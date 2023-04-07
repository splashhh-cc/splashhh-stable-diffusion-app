import { AnyAction, Dispatch, MiddlewareAPI } from '@reduxjs/toolkit';
import * as InvokeAI from 'app/invokeai';
import type { RootState } from 'app/store';
import {
  frontendToBackendParameters,
  FrontendToBackendParametersConfig,
} from 'common/util/parameterTranslation';
import dateFormat from 'dateformat';
import {
  GalleryCategory,
  GalleryState,
  removeImage,
} from 'features/gallery/store/gallerySlice';
import {
  addLogEntry,
  generationRequested,
  modelChangeRequested,
  setChallenge,
  modelConvertRequested,
  modelMergingRequested,
  setIsProcessing,
} from 'features/system/store/systemSlice';
import { InvokeTabName } from 'features/ui/store/tabMap';
import { Socket } from 'socket.io-client';
import { getChallenge, solve_challenge } from '../utils';

/**
 * Returns an object containing all functions which use `socketio.emit()`.
 * i.e. those which make server requests.
 */
const makeSocketIOEmitters = (
  store: MiddlewareAPI<Dispatch<AnyAction>, RootState>,
  socketio: Socket
) => {
  // We need to dispatch actions to redux and get pieces of state from the store.
  const { dispatch, getState } = store;

  async function solveChallengeIfNeeded() {
    if (
      getState().system.challenge === null ||
      Date.now() >
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        new Date(getState().system.challenge.payload.expires_utc).getTime()
    ) {
      const solved = await solve_challenge(await getChallenge());
      dispatch(setChallenge(solved));
    }
  }

  return {
    emitGenerateImage: async (generationMode: InvokeTabName) => {
      dispatch(setIsProcessing(true));

      const state: RootState = getState();

      const {
        generation: generationState,
        postprocessing: postprocessingState,
        system: systemState,
        canvas: canvasState,
      } = state;

      const frontendToBackendParametersConfig: FrontendToBackendParametersConfig =
        {
          generationMode,
          generationState,
          postprocessingState,
          canvasState,
          systemState,
        };

      await solveChallengeIfNeeded();

      dispatch(generationRequested());

      const { generationParameters, esrganParameters, facetoolParameters } =
        frontendToBackendParameters(frontendToBackendParametersConfig);

      socketio.emit(
        'generateImage',
        generationParameters,
        esrganParameters,
        facetoolParameters,
        systemState.user_id,
        getState().system.challenge
      );
      dispatch(setChallenge(null));

      // we need to truncate the init_mask base64 else it takes up the whole log
      // TODO: handle maintaining masks for reproducibility in future
      if (generationParameters.init_mask) {
        generationParameters.init_mask = generationParameters.init_mask
          .substr(0, 64)
          .concat('...');
      }
      if (generationParameters.init_img) {
        generationParameters.init_img = generationParameters.init_img
          .substr(0, 64)
          .concat('...');
      }

      dispatch(
        addLogEntry({
          timestamp: dateFormat(new Date(), 'isoDateTime'),
          message: `Image generation requested: ${JSON.stringify({
            ...generationParameters,
            ...esrganParameters,
            ...facetoolParameters,
          })}`,
        })
      );
    },
    emitRunESRGAN: async (imageToProcess: InvokeAI.Image) => {
      dispatch(setIsProcessing(true));

      const {
        postprocessing: {
          upscalingLevel,
          upscalingDenoising,
          upscalingStrength,
        },
      } = getState();

      const esrganParameters = {
        upscale: [upscalingLevel, upscalingDenoising, upscalingStrength],
      };

      await solveChallengeIfNeeded();

      socketio.emit(
        'runPostprocessing',
        imageToProcess,
        {
          type: 'esrgan',
          ...esrganParameters,
        },
        getState().system.user_id,
        getState().system.challenge
      );
      dispatch(setChallenge(null));
      dispatch(
        addLogEntry({
          timestamp: dateFormat(new Date(), 'isoDateTime'),
          message: `ESRGAN upscale requested: ${JSON.stringify({
            file: imageToProcess.url,
            ...esrganParameters,
          })}`,
        })
      );
    },
    emitRunFacetool: async (imageToProcess: InvokeAI.Image) => {
      dispatch(setIsProcessing(true));
      const {
        postprocessing: { facetoolType, facetoolStrength, codeformerFidelity },
      } = getState();

      await solveChallengeIfNeeded();

      const facetoolParameters: Record<string, unknown> = {
        facetool_strength: facetoolStrength,
      };

      if (facetoolType === 'codeformer') {
        facetoolParameters.codeformer_fidelity = codeformerFidelity;
      }

      socketio.emit(
        'runPostprocessing',
        imageToProcess,
        {
          type: facetoolType,
          ...facetoolParameters,
        },
        getState().system.user_id,
        getState().system.challenge
      );
      dispatch(setChallenge(null));
      dispatch(
        addLogEntry({
          timestamp: dateFormat(new Date(), 'isoDateTime'),
          message: `Face restoration (${facetoolType}) requested: ${JSON.stringify(
            {
              file: imageToProcess.url,
              ...facetoolParameters,
            }
          )}`,
        })
      );
    },
    emitDeleteImage: (imageToDelete: InvokeAI.Image) => {
      const { url, uuid, category, thumbnail } = imageToDelete;
      dispatch(removeImage(imageToDelete));
      const { user_id } = getState().system;
      socketio.emit('deleteImage', url, thumbnail, uuid, category, user_id);
    },
    emitRequestImages: (category: GalleryCategory) => {
      const gallery: GalleryState = getState().gallery;
      const { earliest_mtime } = gallery.categories[category];
      const { user_id } = getState().system;
      socketio.emit('requestImages', category, earliest_mtime, user_id);
    },
    emitRequestNewImages: (category: GalleryCategory) => {
      const gallery: GalleryState = getState().gallery;
      const { latest_mtime } = gallery.categories[category];
      const { user_id } = getState().system;
      socketio.emit('requestLatestImages', category, latest_mtime, user_id);
    },
    emitCancelProcessing: () => {
      socketio.emit('cancel');
    },
    emitRequestSystemConfig: () => {
      socketio.emit('requestSystemConfig');
    },
    emitSearchForModels: (modelFolder: string) => {
      socketio.emit('searchForModels', modelFolder);
    },
    emitAddNewModel: (modelConfig: InvokeAI.InvokeModelConfigProps) => {
      socketio.emit('addNewModel', modelConfig);
    },
    emitDeleteModel: (modelName: string) => {
      socketio.emit('deleteModel', modelName);
    },
    emitConvertToDiffusers: (
      modelToConvert: InvokeAI.InvokeModelConversionProps
    ) => {
      dispatch(modelConvertRequested());
      socketio.emit('convertToDiffusers', modelToConvert);
    },
    emitMergeDiffusersModels: (
      modelMergeInfo: InvokeAI.InvokeModelMergingProps
    ) => {
      dispatch(modelMergingRequested());
      socketio.emit('mergeDiffusersModels', modelMergeInfo);
    },
    emitRequestModelChange: (modelName: string) => {
      dispatch(modelChangeRequested());
      socketio.emit('requestModelChange', modelName);
    },
    emitSaveStagingAreaImageToGallery: (url: string) => {
      const { user_id } = getState().system;
      socketio.emit('requestSaveStagingAreaImageToGallery', url, user_id);
    },
    emitRequestEmptyTempFolder: () => {
      socketio.emit('requestEmptyTempFolder');
    },
  };
};

export default makeSocketIOEmitters;
