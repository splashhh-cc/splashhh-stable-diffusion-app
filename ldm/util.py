import importlib
import math
import multiprocessing as mp
import os
import re
from collections import abc
from inspect import isfunction
from pathlib import Path
from queue import Queue
from threading import Thread

import numpy as np
import requests
import torch
from PIL import Image, ImageDraw, ImageFont
from tqdm import tqdm

from ldm.invoke.devices import torch_dtype


def log_txt_as_img(wh, xc, size=10):
    # wh a tuple of (width, height)
    # xc a list of captions to plot
    b = len(xc)
    txts = list()
    for bi in range(b):
        txt = Image.new("RGB", wh, color="white")
        draw = ImageDraw.Draw(txt)
        font = ImageFont.load_default()
        nc = int(40 * (wh[0] / 256))
        lines = "\n".join(
            xc[bi][start : start + nc] for start in range(0, len(xc[bi]), nc)
        )

        try:
            draw.text((0, 0), lines, fill="black", font=font)
        except UnicodeEncodeError:
            print("Cant encode string for logging. Skipping.")

        txt = np.array(txt).transpose(2, 0, 1) / 127.5 - 1.0
        txts.append(txt)
    txts = np.stack(txts)
    txts = torch.tensor(txts)
    return txts


def ismap(x):
    if not isinstance(x, torch.Tensor):
        return False
    return (len(x.shape) == 4) and (x.shape[1] > 3)


def isimage(x):
    if not isinstance(x, torch.Tensor):
        return False
    return (len(x.shape) == 4) and (x.shape[1] == 3 or x.shape[1] == 1)


def exists(x):
    return x is not None


def default(val, d):
    if exists(val):
        return val
    return d() if isfunction(d) else d


def mean_flat(tensor):
    """
    https://github.com/openai/guided-diffusion/blob/27c20a8fab9cb472df5d6bdd6c8d11c8f430b924/guided_diffusion/nn.py#L86
    Take the mean over all non-batch dimensions.
    """
    return tensor.mean(dim=list(range(1, len(tensor.shape))))


def count_params(model, verbose=False):
    total_params = sum(p.numel() for p in model.parameters())
    if verbose:
        print(
            f"   | {model.__class__.__name__} has {total_params * 1.e-6:.2f} M params."
        )
    return total_params


def instantiate_from_config(config, **kwargs):
    if not "target" in config:
        if config == "__is_first_stage__":
            return None
        elif config == "__is_unconditional__":
            return None
        raise KeyError("Expected key `target` to instantiate.")
    return get_obj_from_str(config["target"])(**config.get("params", dict()), **kwargs)


def get_obj_from_str(string, reload=False):
    module, cls = string.rsplit(".", 1)
    if reload:
        module_imp = importlib.import_module(module)
        importlib.reload(module_imp)
    return getattr(importlib.import_module(module, package=None), cls)


def _do_parallel_data_prefetch(func, Q, data, idx, idx_to_fn=False):
    # create dummy dataset instance

    # run prefetching
    if idx_to_fn:
        res = func(data, worker_id=idx)
    else:
        res = func(data)
    Q.put([idx, res])
    Q.put("Done")


def parallel_data_prefetch(
    func: callable,
    data,
    n_proc,
    target_data_type="ndarray",
    cpu_intensive=True,
    use_worker_id=False,
):
    # if target_data_type not in ["ndarray", "list"]:
    #     raise ValueError(
    #         "Data, which is passed to parallel_data_prefetch has to be either of type list or ndarray."
    #     )
    if isinstance(data, np.ndarray) and target_data_type == "list":
        raise ValueError("list expected but function got ndarray.")
    elif isinstance(data, abc.Iterable):
        if isinstance(data, dict):
            print(
                'WARNING:"data" argument passed to parallel_data_prefetch is a dict: Using only its values and disregarding keys.'
            )
            data = list(data.values())
        if target_data_type == "ndarray":
            data = np.asarray(data)
        else:
            data = list(data)
    else:
        raise TypeError(
            f"The data, that shall be processed parallel has to be either an np.ndarray or an Iterable, but is actually {type(data)}."
        )

    if cpu_intensive:
        Q = mp.Queue(1000)
        proc = mp.Process
    else:
        Q = Queue(1000)
        proc = Thread
    # spawn processes
    if target_data_type == "ndarray":
        arguments = [
            [func, Q, part, i, use_worker_id]
            for i, part in enumerate(np.array_split(data, n_proc))
        ]
    else:
        step = (
            int(len(data) / n_proc + 1)
            if len(data) % n_proc != 0
            else int(len(data) / n_proc)
        )
        arguments = [
            [func, Q, part, i, use_worker_id]
            for i, part in enumerate(
                [data[i : i + step] for i in range(0, len(data), step)]
            )
        ]
    processes = []
    for i in range(n_proc):
        p = proc(target=_do_parallel_data_prefetch, args=arguments[i])
        processes += [p]

    # start processes
    print("Start prefetching...")
    import time

    start = time.time()
    gather_res = [[] for _ in range(n_proc)]
    try:
        for p in processes:
            p.start()

        k = 0
        while k < n_proc:
            # get result
            res = Q.get()
            if res == "Done":
                k += 1
            else:
                gather_res[res[0]] = res[1]

    except Exception as e:
        print("Exception: ", e)
        for p in processes:
            p.terminate()

        raise e
    finally:
        for p in processes:
            p.join()
        print(f"Prefetching complete. [{time.time() - start} sec.]")

    if target_data_type == "ndarray":
        if not isinstance(gather_res[0], np.ndarray):
            return np.concatenate([np.asarray(r) for r in gather_res], axis=0)

        # order outputs
        return np.concatenate(gather_res, axis=0)
    elif target_data_type == "list":
        out = []
        for r in gather_res:
            out.extend(r)
        return out
    else:
        return gather_res


def rand_perlin_2d(
    shape, res, device, fade=lambda t: 6 * t**5 - 15 * t**4 + 10 * t**3
):
    delta = (res[0] / shape[0], res[1] / shape[1])
    d = (shape[0] // res[0], shape[1] // res[1])

    grid = (
        torch.stack(
            torch.meshgrid(
                torch.arange(0, res[0], delta[0]),
                torch.arange(0, res[1], delta[1]),
                indexing="ij",
            ),
            dim=-1,
        ).to(device)
        % 1
    )

    rand_val = torch.rand(res[0] + 1, res[1] + 1)

    angles = 2 * math.pi * rand_val
    gradients = torch.stack((torch.cos(angles), torch.sin(angles)), dim=-1).to(device)

    tile_grads = (
        lambda slice1, slice2: gradients[slice1[0] : slice1[1], slice2[0] : slice2[1]]
        .repeat_interleave(d[0], 0)
        .repeat_interleave(d[1], 1)
    )

    dot = lambda grad, shift: (
        torch.stack(
            (
                grid[: shape[0], : shape[1], 0] + shift[0],
                grid[: shape[0], : shape[1], 1] + shift[1],
            ),
            dim=-1,
        )
        * grad[: shape[0], : shape[1]]
    ).sum(dim=-1)

    n00 = dot(tile_grads([0, -1], [0, -1]), [0, 0]).to(device)
    n10 = dot(tile_grads([1, None], [0, -1]), [-1, 0]).to(device)
    n01 = dot(tile_grads([0, -1], [1, None]), [0, -1]).to(device)
    n11 = dot(tile_grads([1, None], [1, None]), [-1, -1]).to(device)
    t = fade(grid[: shape[0], : shape[1]])
    noise = math.sqrt(2) * torch.lerp(
        torch.lerp(n00, n10, t[..., 0]), torch.lerp(n01, n11, t[..., 0]), t[..., 1]
    ).to(device)
    return noise.to(dtype=torch_dtype(device))


def ask_user(question: str, answers: list):
    from itertools import chain, repeat

    user_prompt = f"\n>> {question} {answers}: "
    invalid_answer_msg = "Invalid answer. Please try again."
    pose_question = chain(
        [user_prompt], repeat("\n".join([invalid_answer_msg, user_prompt]))
    )
    user_answers = map(input, pose_question)
    valid_response = next(filter(answers.__contains__, user_answers))
    return valid_response


def debug_image(
    debug_image, debug_text, debug_show=True, debug_result=False, debug_status=False
):
    if not debug_status:
        return

    image_copy = debug_image.copy().convert("RGBA")
    ImageDraw.Draw(image_copy).text((5, 5), debug_text, (255, 0, 0))

    if debug_show:
        image_copy.show()

    if debug_result:
        return image_copy


# -------------------------------------
def download_with_resume(url: str, dest: Path, access_token: str = None) -> Path:
    '''
    Download a model file.
    :param url:  https, http or ftp URL
    :param dest: A Path object. If path exists and is a directory, then we try to derive the filename
                 from the URL's Content-Disposition header and copy the URL contents into
                 dest/filename
    :param access_token: Access token to access this resource
    '''
    header = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    open_mode = "wb"
    exist_size = 0

    resp = requests.get(url, header, stream=True)
    content_length = int(resp.headers.get("content-length", 0))

    if dest.is_dir():
        try:
            file_name = re.search('filename="(.+)"', resp.headers.get("Content-Disposition")).group(1)
        except:
            file_name = os.path.basename(url)
        dest = dest / file_name
    else:
        dest.parent.mkdir(parents=True, exist_ok=True)

    if dest.exists():
        exist_size = dest.stat().st_size
        header["Range"] = f"bytes={exist_size}-"
        open_mode = "ab"
        resp = requests.get(url, headers=header, stream=True) # new request with range

    if exist_size > content_length:
        print(f'* corrupt existing file found (existing_size={exist_size}, content_length={content_length}). re-downloading')
        os.remove(dest)
        exist_size = 0

    if (
        resp.status_code == 416 or exist_size == content_length
    ):
        print(f"* {dest}: complete file found. Skipping.")
        return dest
    elif resp.status_code == 206 or exist_size > 0:
        print(f"* {dest}: partial file found. Resuming...")
    elif resp.status_code != 200:
        print(f"** An error occurred while downloading {url}: {resp.reason}")
        return None
    else:
        print(f"* {dest}: Downloading...")

    try:
        with open(dest, open_mode) as file, tqdm(
                desc=str(dest),
                initial=exist_size,
                total=content_length,
                unit="iB",
                unit_scale=True,
                unit_divisor=1000,
        ) as bar:
            for data in resp.iter_content(chunk_size=1024):
                size = file.write(data)
                bar.update(size)
    except Exception as e:
        print(f"An error occurred while downloading {dest}: {str(e)}")
        return None

    return dest


def url_attachment_name(url: str) -> dict:
    try:
        resp = requests.get(url, stream=True)
        match = re.search('filename="(.+)"', resp.headers.get("Content-Disposition"))
        return match.group(1)
    except:
        return None


def download_with_progress_bar(url: str, dest: Path) -> bool:
    result = download_with_resume(url, dest, access_token=None)
    return result is not None
