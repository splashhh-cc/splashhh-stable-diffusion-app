import { WIDTHS } from 'app/constants';
import { RootState } from 'app/store';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import IAISelect from 'common/components/IAISelect';
import IAISlider from 'common/components/IAISlider';
import { setWidth } from 'features/parameters/store/generationSlice';
import { activeTabNameSelector } from 'features/ui/store/uiSelectors';
import { useTranslation } from 'react-i18next';

export default function MainWidth() {
  const width = useAppSelector((state: RootState) => state.generation.width);
  const shouldUseSliders = useAppSelector(
    (state: RootState) => state.ui.shouldUseSliders
  );
  const activeTabName = useAppSelector(activeTabNameSelector);
  const { t } = useTranslation();
  const { max_limits } = useAppSelector((state: RootState) => state.system);

  const dispatch = useAppDispatch();

  return shouldUseSliders ? (
    <IAISlider
      isSliderDisabled={activeTabName === 'unifiedCanvas'}
      isInputDisabled={activeTabName === 'unifiedCanvas'}
      isResetDisabled={activeTabName === 'unifiedCanvas'}
      label={t('parameters.width')}
      value={width}
      min={64}
      step={64}
      max={2048}
      onChange={(v) => dispatch(setWidth(v))}
      handleReset={() => dispatch(setWidth(512))}
      withInput
      withReset
      withSliderMarks
      sliderMarkRightOffset={-8}
      inputWidth="6.2rem"
      inputReadOnly
      sliderNumberInputProps={{ max: 15360 }}
    />
  ) : (
    <IAISelect
      isDisabled={activeTabName === 'unifiedCanvas'}
      label={t('parameters.width')}
      value={width}
      flexGrow={1}
      onChange={(e) => dispatch(setWidth(Number(e.target.value)))}
      styleClass="main-settings-block"
      validValues={WIDTHS.filter(
        (w) => w <= max_limits.generation_parameters.width
      )}
    />
  );
}
