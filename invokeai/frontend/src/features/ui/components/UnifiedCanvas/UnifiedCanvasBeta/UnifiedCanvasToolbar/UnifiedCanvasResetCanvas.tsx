import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import IAIIconButton from 'common/components/IAIIconButton';
import { isStagingSelector } from 'features/canvas/store/canvasSelectors';
import {
  resetCanvas,
  resizeAndScaleCanvas,
} from 'features/canvas/store/canvasSlice';
import { useTranslation } from 'react-i18next';
import { FaTrash } from 'react-icons/fa';

export default function UnifiedCanvasResetCanvas() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isStaging = useAppSelector(isStagingSelector);

  const handleResetCanvas = () => {
    dispatch(resetCanvas());
    dispatch(resizeAndScaleCanvas());
  };
  return (
    <IAIIconButton
      aria-label={t('unifiedCanvas.clearCanvas')}
      tooltip={t('unifiedCanvas.clearCanvas')}
      icon={<FaTrash />}
      onClick={handleResetCanvas}
      style={{ backgroundColor: 'var(--btn-delete-image)' }}
      isDisabled={isStaging}
    />
  );
}
