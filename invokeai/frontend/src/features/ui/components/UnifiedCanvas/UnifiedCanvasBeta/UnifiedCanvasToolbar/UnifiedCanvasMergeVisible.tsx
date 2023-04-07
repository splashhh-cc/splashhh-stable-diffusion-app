import { RootState } from 'app/store';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import IAIIconButton from 'common/components/IAIIconButton';
import { isStagingSelector } from 'features/canvas/store/canvasSelectors';
import { mergeAndUploadCanvas } from 'features/canvas/store/thunks/mergeAndUploadCanvas';
import { getCanvasBaseLayer } from 'features/canvas/util/konvaInstanceProvider';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { FaLayerGroup } from 'react-icons/fa';

export default function UnifiedCanvasMergeVisible() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const canvasBaseLayer = getCanvasBaseLayer();
  const isStaging = useAppSelector(isStagingSelector);
  const isProcessing = useAppSelector(
    (state: RootState) => state.system.isProcessing
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

  const handleMergeVisible = () => {
    dispatch(
      mergeAndUploadCanvas({
        cropVisible: false,
        shouldSetAsInitialImage: true,
      })
    );
  };
  return (
    <IAIIconButton
      aria-label={`${t('unifiedCanvas.mergeVisible')} (Shift+M)`}
      tooltip={`${t('unifiedCanvas.mergeVisible')} (Shift+M)`}
      icon={<FaLayerGroup />}
      onClick={handleMergeVisible}
      isDisabled={isStaging}
    />
  );
}
