import { RootState } from 'app/store';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import IAIInput from 'common/components/IAIInput';
import { validateSeedWeights } from 'common/util/seedWeightPairs';
import { setSeedWeights } from 'features/parameters/store/generationSlice';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

export default function SeedWeights() {
  const seedWeights = useAppSelector(
    (state: RootState) => state.generation.seedWeights
  );

  const shouldGenerateVariations = useAppSelector(
    (state: RootState) => state.generation.shouldGenerateVariations
  );

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const handleChangeSeedWeights = (e: ChangeEvent<HTMLInputElement>) =>
    dispatch(setSeedWeights(e.target.value));

  return (
    <IAIInput
      label={t('parameters.seedWeights')}
      value={seedWeights}
      isInvalid={
        shouldGenerateVariations &&
        !(validateSeedWeights(seedWeights) || seedWeights === '')
      }
      isDisabled={!shouldGenerateVariations}
      onChange={handleChangeSeedWeights}
    />
  );
}
