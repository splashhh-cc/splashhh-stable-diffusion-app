import type { RootState } from 'app/store';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import IAINumberInput from 'common/components/IAINumberInput';
import IAISlider from 'common/components/IAISlider';
import { setIterations } from 'features/parameters/store/generationSlice';

import { useTranslation } from 'react-i18next';

export default function MainIterations() {
  const iterations = useAppSelector(
    (state: RootState) => state.generation.iterations
  );

  const shouldUseSliders = useAppSelector(
    (state: RootState) => state.ui.shouldUseSliders
  );

  const dispatch = useAppDispatch();
  const { max_limits } = useAppSelector((state: RootState) => state.system);

  const { t } = useTranslation();

  const handleChangeIterations = (v: number) => dispatch(setIterations(v));

  return shouldUseSliders ? (
    <IAISlider
      label={t('parameters.images')}
      step={1}
      min={1}
      max={16}
      onChange={handleChangeIterations}
      handleReset={() => dispatch(setIterations(1))}
      value={iterations}
      withInput
      withReset
      withSliderMarks
      sliderMarkRightOffset={-5}
      sliderNumberInputProps={{ max: 9999 }}
    />
  ) : (
    <IAINumberInput
      label={t('parameters.images')}
      step={1}
      min={1}
      max={max_limits.generation_parameters.iterations}
      onChange={handleChangeIterations}
      value={iterations}
      width="auto"
      labelFontSize={0.5}
      styleClass="main-settings-block"
      textAlign="center"
    />
  );
}
