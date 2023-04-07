import { RootState } from 'app/store';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import IAINumberInput from 'common/components/IAINumberInput';

import IAISlider from 'common/components/IAISlider';
import {
  clampSymmetrySteps,
  setSteps,
} from 'features/parameters/store/generationSlice';
import { useTranslation } from 'react-i18next';

export default function MainSteps() {
  const dispatch = useAppDispatch();
  const steps = useAppSelector((state: RootState) => state.generation.steps);
  const shouldUseSliders = useAppSelector(
    (state: RootState) => state.ui.shouldUseSliders
  );
  const { t } = useTranslation();
  const max_steps = useAppSelector(
    (state: RootState) => state.system.max_limits.generation_parameters.steps
  );

  if (steps > max_steps) {
    dispatch(setSteps(max_steps));
  }

  const handleChangeSteps = (v: number) => {
    dispatch(setSteps(v));
  };

  const handleBlur = () => {
    dispatch(clampSymmetrySteps());
  };

  return shouldUseSliders ? (
    <IAISlider
      label={t('parameters.steps')}
      min={1}
      step={1}
      onChange={handleChangeSteps}
      handleReset={() => dispatch(setSteps(20))}
      value={steps}
      withInput
      withReset
      withSliderMarks
      sliderMarkRightOffset={-6}
      sliderNumberInputProps={{ max: 9999 }}
    />
  ) : (
    <IAINumberInput
      label={t('parameters.steps')}
      min={1}
      max={max_steps}
      step={1}
      onChange={handleChangeSteps}
      value={steps}
      width="auto"
      styleClass="main-settings-block"
      textAlign="center"
      onBlur={handleBlur}
    />
  );
}
