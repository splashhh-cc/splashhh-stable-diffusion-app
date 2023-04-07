import { ButtonGroup } from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import IAIIconButton from 'common/components/IAIIconButton';
import IAISelect from 'common/components/IAISelect';
import useImageUploader from 'common/hooks/useImageUploader';
import { useSingleAndDoubleClick } from 'common/hooks/useSingleAndDoubleClick';
import {
  canvasSelector,
  isStagingSelector,
} from 'features/canvas/store/canvasSelectors';
import {
  resetCanvas,
  resetCanvasView,
  resizeAndScaleCanvas,
  setIsMaskEnabled,
  setLayer,
  setTool,
} from 'features/canvas/store/canvasSlice';
import {
  CanvasLayer,
  LAYER_NAMES_DICT,
} from 'features/canvas/store/canvasTypes';
import { mergeAndUploadCanvas } from 'features/canvas/store/thunks/mergeAndUploadCanvas';
import { getCanvasBaseLayer } from 'features/canvas/util/konvaInstanceProvider';
import { systemSelector } from 'features/system/store/systemSelectors';
import { isEqual } from 'lodash';

import { ChangeEvent } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import {
  FaArrowsAlt,
  FaCopy,
  FaCrosshairs,
  FaDownload,
  FaLayerGroup,
  FaSave,
  FaTrash,
  FaUpload,
} from 'react-icons/fa';
import IAICanvasMaskOptions from './IAICanvasMaskOptions';
import IAICanvasRedoButton from './IAICanvasRedoButton';
import IAICanvasSettingsButtonPopover from './IAICanvasSettingsButtonPopover';
import IAICanvasToolChooserOptions from './IAICanvasToolChooserOptions';
import IAICanvasUndoButton from './IAICanvasUndoButton';

export const selector = createSelector(
  [systemSelector, canvasSelector, isStagingSelector],
  (system, canvas, isStaging) => {
    const { isProcessing } = system;
    const { tool, shouldCropToBoundingBoxOnSave, layer, isMaskEnabled } =
      canvas;

    return {
      isProcessing,
      isStaging,
      isMaskEnabled,
      tool,
      layer,
      shouldCropToBoundingBoxOnSave,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  }
);

const IAICanvasOutpaintingControls = () => {
  const dispatch = useAppDispatch();
  const {
    isProcessing,
    isStaging,
    isMaskEnabled,
    layer,
    tool,
    shouldCropToBoundingBoxOnSave,
  } = useAppSelector(selector);
  const canvasBaseLayer = getCanvasBaseLayer();

  const { t } = useTranslation();

  const { openUploader } = useImageUploader();

  useHotkeys(
    ['v'],
    () => {
      handleSelectMoveTool();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    []
  );

  useHotkeys(
    ['r'],
    () => {
      handleResetCanvasView();
    },
    {
      enabled: () => true,
      preventDefault: true,
    },
    [canvasBaseLayer]
  );

  useHotkeys(
    ['shift+m'],
    () => {
      handleMergeVisible();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    [canvasBaseLayer, isProcessing]
  );

  useHotkeys(
    ['shift+s'],
    () => {
      handleSaveToGallery();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    [canvasBaseLayer, isProcessing]
  );

  useHotkeys(
    ['meta+c', 'ctrl+c'],
    () => {
      handleCopyImageToClipboard();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    [canvasBaseLayer, isProcessing]
  );

  useHotkeys(
    ['shift+d'],
    () => {
      handleDownloadAsImage();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    [canvasBaseLayer, isProcessing]
  );

  const handleSelectMoveTool = () => dispatch(setTool('move'));

  const handleClickResetCanvasView = useSingleAndDoubleClick(
    () => handleResetCanvasView(false),
    () => handleResetCanvasView(true)
  );

  const handleResetCanvasView = (shouldScaleTo1 = false) => {
    const canvasBaseLayer = getCanvasBaseLayer();
    if (!canvasBaseLayer) return;
    const clientRect = canvasBaseLayer.getClientRect({
      skipTransform: true,
    });
    dispatch(
      resetCanvasView({
        contentRect: clientRect,
        shouldScaleTo1,
      })
    );
  };

  const handleResetCanvas = () => {
    dispatch(resetCanvas());
    dispatch(resizeAndScaleCanvas());
  };

  const handleMergeVisible = () => {
    dispatch(
      mergeAndUploadCanvas({
        cropVisible: false,
        shouldSetAsInitialImage: true,
      })
    );
  };

  const handleSaveToGallery = () => {
    dispatch(
      mergeAndUploadCanvas({
        cropVisible: shouldCropToBoundingBoxOnSave ? false : true,
        cropToBoundingBox: shouldCropToBoundingBoxOnSave,
        shouldSaveToGallery: true,
      })
    );
  };

  const handleCopyImageToClipboard = () => {
    dispatch(
      mergeAndUploadCanvas({
        cropVisible: shouldCropToBoundingBoxOnSave ? false : true,
        cropToBoundingBox: shouldCropToBoundingBoxOnSave,
        shouldCopy: true,
      })
    );
  };

  const handleDownloadAsImage = () => {
    dispatch(
      mergeAndUploadCanvas({
        cropVisible: shouldCropToBoundingBoxOnSave ? false : true,
        cropToBoundingBox: shouldCropToBoundingBoxOnSave,
        shouldDownload: true,
      })
    );
  };

  const handleChangeLayer = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLayer = e.target.value as CanvasLayer;
    dispatch(setLayer(newLayer));
    if (newLayer === 'mask' && !isMaskEnabled) {
      dispatch(setIsMaskEnabled(true));
    }
  };

  return (
    <div className="inpainting-settings">
      <IAISelect
        tooltip={`${t('unifiedCanvas.layer')} (Q)`}
        tooltipProps={{ hasArrow: true, placement: 'top' }}
        value={layer}
        validValues={LAYER_NAMES_DICT}
        onChange={handleChangeLayer}
        isDisabled={isStaging}
      />

      <IAICanvasMaskOptions />
      <IAICanvasToolChooserOptions />

      <ButtonGroup isAttached>
        <IAIIconButton
          aria-label={`${t('unifiedCanvas.move')} (V)`}
          tooltip={`${t('unifiedCanvas.move')} (V)`}
          icon={<FaArrowsAlt />}
          data-selected={tool === 'move' || isStaging}
          onClick={handleSelectMoveTool}
        />
        <IAIIconButton
          aria-label={`${t('unifiedCanvas.resetView')} (R)`}
          tooltip={`${t('unifiedCanvas.resetView')} (R)`}
          icon={<FaCrosshairs />}
          onClick={handleClickResetCanvasView}
        />
      </ButtonGroup>

      <ButtonGroup isAttached>
        <IAIIconButton
          aria-label={`${t('unifiedCanvas.mergeVisible')} (Shift+M)`}
          tooltip={`${t('unifiedCanvas.mergeVisible')} (Shift+M)`}
          icon={<FaLayerGroup />}
          onClick={handleMergeVisible}
          isDisabled={isStaging}
        />
        <IAIIconButton
          aria-label={`${t('unifiedCanvas.saveToGallery')} (Shift+S)`}
          tooltip={`${t('unifiedCanvas.saveToGallery')} (Shift+S)`}
          icon={<FaSave />}
          onClick={handleSaveToGallery}
          isDisabled={isStaging}
        />
        <IAIIconButton
          aria-label={`${t('unifiedCanvas.copyToClipboard')} (Cmd/Ctrl+C)`}
          tooltip={`${t('unifiedCanvas.copyToClipboard')} (Cmd/Ctrl+C)`}
          icon={<FaCopy />}
          onClick={handleCopyImageToClipboard}
          isDisabled={isStaging}
        />
        <IAIIconButton
          aria-label={`${t('unifiedCanvas.downloadAsImage')} (Shift+D)`}
          tooltip={`${t('unifiedCanvas.downloadAsImage')} (Shift+D)`}
          icon={<FaDownload />}
          onClick={handleDownloadAsImage}
          isDisabled={isStaging}
        />
      </ButtonGroup>
      <ButtonGroup isAttached>
        <IAICanvasUndoButton />
        <IAICanvasRedoButton />
      </ButtonGroup>

      <ButtonGroup isAttached>
        <IAIIconButton
          aria-label={`${t('common.upload')}`}
          tooltip={`${t('common.upload')}`}
          icon={<FaUpload />}
          onClick={openUploader}
          isDisabled={isStaging}
        />
        <IAIIconButton
          aria-label={`${t('unifiedCanvas.clearCanvas')}`}
          tooltip={`${t('unifiedCanvas.clearCanvas')}`}
          icon={<FaTrash />}
          onClick={handleResetCanvas}
          style={{ backgroundColor: 'var(--btn-delete-image)' }}
          isDisabled={isStaging}
        />
      </ButtonGroup>
      <ButtonGroup isAttached>
        <IAICanvasSettingsButtonPopover />
      </ButtonGroup>
    </div>
  );
};

export default IAICanvasOutpaintingControls;
