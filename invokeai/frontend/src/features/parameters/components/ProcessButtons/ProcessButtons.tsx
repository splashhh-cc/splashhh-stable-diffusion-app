import { useAppSelector } from 'app/storeHooks';
import { activeTabNameSelector } from 'features/ui/store/uiSelectors';
import InvokeButton from './InvokeButton';
import LoopbackButton from './Loopback';
import RandomPromptButton from './RandomPromptButton';

/**
 * Buttons to start and cancel image generation.
 */
const ProcessButtons = () => {
  const activeTabName = useAppSelector(activeTabNameSelector);

  return (
    <div className="process-buttons">
      <InvokeButton />
      {activeTabName === 'img2img' && <LoopbackButton />}
      <RandomPromptButton />
    </div>
  );
};

export default ProcessButtons;
