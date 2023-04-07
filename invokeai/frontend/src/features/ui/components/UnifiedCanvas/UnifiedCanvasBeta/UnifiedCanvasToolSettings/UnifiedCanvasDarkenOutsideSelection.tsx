import { RootState } from 'app/store';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import IAICheckbox from 'common/components/IAICheckbox';
import { setShouldDarkenOutsideBoundingBox } from 'features/canvas/store/canvasSlice';
import { useTranslation } from 'react-i18next';

export default function UnifiedCanvasDarkenOutsideSelection() {
  const shouldDarkenOutsideBoundingBox = useAppSelector(
    (state: RootState) => state.canvas.shouldDarkenOutsideBoundingBox
  );

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  return (
    <IAICheckbox
      label={t('unifiedCanvas.betaDarkenOutside')}
      isChecked={shouldDarkenOutsideBoundingBox}
      onChange={(e) =>
        dispatch(setShouldDarkenOutsideBoundingBox(e.target.checked))
      }
    />
  );
}
