import React from 'react';
import { RootState } from 'app/store';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import IAINumberInput from 'common/components/IAINumberInput';
import { setSteps } from 'features/options/store/optionsSlice';
import { useTranslation } from 'react-i18next';

export default function MainSteps() {
  const dispatch = useAppDispatch();
  const steps = useAppSelector((state: RootState) => state.options.steps);
  const { t } = useTranslation();
  const { max_limits } = useAppSelector((state: RootState) => state.system);

  const handleChangeSteps = (v: number) => dispatch(setSteps(v));

  return (
    <IAINumberInput
      label={t('options:steps')}
      min={1}
      max={max_limits.generation_parameters.steps}
      step={1}
      onChange={handleChangeSteps}
      value={steps}
      width="auto"
      styleClass="main-option-block"
      textAlign="center"
    />
  );
}
