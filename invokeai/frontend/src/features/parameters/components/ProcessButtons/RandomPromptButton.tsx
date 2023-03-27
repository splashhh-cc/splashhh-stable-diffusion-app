import { createSelector } from '@reduxjs/toolkit';
import { cancelProcessing } from 'app/socketio/actions';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import IAIIconButton, {
  IAIIconButtonProps,
} from 'common/components/IAIIconButton';
import { systemSelector } from 'features/system/store/systemSelectors';
import { SystemState } from 'features/system/store/systemSlice';
import { isEqual } from 'lodash';

import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { MdInsights } from 'react-icons/md';
import { setPrompt } from 'features/parameters/store/generationSlice';
import { random_prompt } from 'app/prompts';

const cancelButtonSelector = createSelector(
  systemSelector,
  (system: SystemState) => {
    return {
      isProcessing: system.isProcessing,
      isConnected: system.isConnected,
      isCancelable: system.isCancelable,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  }
);

export default function RandomPromptButton(
  props: Omit<IAIIconButtonProps, 'aria-label'>
) {
  const { ...rest } = props;
  const dispatch = useAppDispatch();
  const { isProcessing, isConnected, isCancelable } =
    useAppSelector(cancelButtonSelector);
  const handleClick = () => dispatch(setPrompt(random_prompt()));

  // Todo: add translation for 'Random Prompt'
  // const { t } = useTranslation();

  useHotkeys(
    'shift+x',
    () => {
      if ((isConnected || isProcessing) && isCancelable) {
        handleClick();
      }
    },
    [isConnected, isProcessing, isCancelable]
  );

  return (
    <IAIIconButton
      icon={<MdInsights />}
      tooltip={'Random prompt'}
      aria-label={'Random prompt'}
      isDisabled={!isConnected || isProcessing}
      onClick={handleClick}
      styleClass="random-prompt-btn"
      {...rest}
    />
  );
}
