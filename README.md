<div align="center">

[//]: # (![project logo]&#40;docs/assets/invoke_ai_banner.png&#41;)

# InvokeAI by Splashhh: A Stable Diffusion Toolkit

[![latest release badge]][latest release link] [![github stars badge]][github stars link] [![github forks badge]][github forks link]

[![CI checks on main badge]][CI checks on main link]

[![github open issues badge]][github open issues link] [![github open prs badge]][github open prs link]

[CI checks on main badge]: https://flat.badgen.net/github/checks/splashhh-cc/splashhh-stable-diffusion-app/main?label=CI%20status%20on%20main&cache=900&icon=github
[CI checks on main link]: https://github.com/splashhh-cc/splashhh-stable-diffusion-app/actions/workflows/test-invoke-conda.yml
[github forks badge]: https://flat.badgen.net/github/forks/splashhh-cc/splashhh-stable-diffusion-appicon=github
[github forks link]: https://useful-forks.github.io/?repo=invoke-ai%2FInvokeAI
[github open issues badge]: https://flat.badgen.net/github/open-issues/splashhh-cc/splashhh-stable-diffusion-app?icon=github
[github open issues link]: https://github.com/splashhh-cc/splashhh-stable-diffusion-app/issues?q=is%3Aissue+is%3Aopen
[github open prs badge]: https://flat.badgen.net/github/open-prs/splashhh-cc/splashhh-stable-diffusion-app?icon=github
[github open prs link]: https://github.com/splashhh-cc/splashhh-stable-diffusion-app/pulls?q=is%3Apr+is%3Aopen
[github stars badge]: https://flat.badgen.net/github/stars/splashhh-cc/splashhh-stable-diffusion-app?icon=github
[github stars link]: https://github.com/splashhh-cc/splashhh-stable-diffusion-app/stargazers

[latest release badge]: https://flat.badgen.net/github/release/splashhh-cc/splashhh-stable-diffusion-app/development?icon=github
[latest release link]: https://github.com/splashhh-cc/splashhh-stable-diffusion-app/releases
</div>

This is a fork of
[invoke-ai/InvokeAI](https://github.com/invoke-ai/InvokeAI),
It provides a streamlined process with various new features and options to aid the image
generation process. It runs on Windows, macOS and Linux machines, with
GPU cards with as little as 4 GB of RAM. It provides both a polished
Web interface, and an easy-to-use command-line interface.

### Features

#### On top of the upstream INVOKE AI toolkit, we aim to provide:

- The ability to support multiple users simultaneously, with each user having their own set of saved images.
- A simple queueing mechanism to avoid overloading the server with multiple simultaneous requests.
- Harden the API to avoid intrusive changes such as model changes, model deletions, and other changes that could break the multi-user experience.
- Enforce reasonable maximum Limits to avoid long requests. This applies to the number of generated images, image sizes, iterations, and other parameters.


_Note: InvokeAI by Splashhh is rapidly evolving. Please use the
[Issues](https://github.com/splashhh-cc/splashhh-stable-diffusion-app/issues) tab to report bugs and make feature
requests. Be sure to use the provided templates. They will help us diagnose issues faster._

# Getting Started with InvokeAI

For full installation and upgrade instructions, please see:
[InvokeAI Installation Overview](https://invoke-ai.github.io/InvokeAI/installation/)

1. Go to the bottom of the [Latest Release Page](https://github.com/invoke-ai/InvokeAI/releases/latest)
2. Download the .zip file for your OS (Windows/macOS/Linux).
3. Unzip the file.
4. If you are on Windows, double-click on the `install.bat` script. On macOS, open a Terminal window, drag the file `install.sh` from Finder into the Terminal, and press return. On Linux, run `install.sh`.
5. Wait a while, until it is done.
6. The folder where you ran the installer from will now be filled with lots of files. If you are on Windows, double-click on the `invoke.bat` file. On macOS, open a Terminal window, drag `invoke.sh` from the folder into the Terminal, and press return. On Linux, run `invoke.sh`
7. Press 2 to open the "browser-based UI", press enter/return, wait a minute or two for Stable Diffusion to start up, then open your browser and go to http://localhost:9090.
8. Type `banana sushi` in the box on the top left and click `Invoke`:


For full documentation, please refer to the invoke-ai.github.io website: https://invoke-ai.github.io/InvokeAI/


### Invoke AI Features

#### Major Features

- [Web Server](https://invoke-ai.github.io/InvokeAI/features/WEB/)
- [Interactive Command Line Interface](https://invoke-ai.github.io/InvokeAI/features/CLI/)
- [Image To Image](https://invoke-ai.github.io/InvokeAI/features/IMG2IMG/)
- [Inpainting Support](https://invoke-ai.github.io/InvokeAI/features/INPAINTING/)
- [Outpainting Support](https://invoke-ai.github.io/InvokeAI/features/OUTPAINTING/)
- [Upscaling, face-restoration and outpainting](https://invoke-ai.github.io/InvokeAI/features/POSTPROCESS/)
- [Reading Prompts From File](https://invoke-ai.github.io/InvokeAI/features/PROMPTS/#reading-prompts-from-a-file)
- [Prompt Blending](https://invoke-ai.github.io/InvokeAI/features/PROMPTS/#prompt-blending)
- [Thresholding and Perlin Noise Initialization Options](https://invoke-ai.github.io/InvokeAI/features/OTHER/#thresholding-and-perlin-noise-initialization-options)
- [Negative/Unconditioned Prompts](https://invoke-ai.github.io/InvokeAI/features/PROMPTS/#negative-and-unconditioned-prompts)
- [Variations](https://invoke-ai.github.io/InvokeAI/features/VARIATIONS/)
- [Personalizing Text-to-Image Generation](https://invoke-ai.github.io/InvokeAI/features/TEXTUAL_INVERSION/)
- [Simplified API for text to image generation](https://invoke-ai.github.io/InvokeAI/features/OTHER/#simplified-api)

#### Other Features

- [Google Colab](https://invoke-ai.github.io/InvokeAI/features/OTHER/#google-colab)
- [Seamless Tiling](https://invoke-ai.github.io/InvokeAI/features/OTHER/#seamless-tiling)
- [Shortcut: Reusing Seeds](https://invoke-ai.github.io/InvokeAI/features/OTHER/#shortcuts-reusing-seeds)
- [Preload Models](https://invoke-ai.github.io/InvokeAI/features/OTHER/#preload-models)


### Troubleshooting

Please check out our **[Q&A](https://invoke-ai.github.io/InvokeAI/help/TROUBLESHOOT/#faq)** to get solutions for common installation
problems and other issues.

