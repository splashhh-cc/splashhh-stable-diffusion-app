import {
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Center,
  useDisclosure,
} from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import _, { isEqual } from 'lodash';
import React, { ChangeEvent, cloneElement, ReactElement } from 'react';
import { RootState } from 'app/store';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import { persistor } from 'persistor';
import {
  InProgressImageType,
  setEnableImageDebugging,
  setSaveIntermediatesInterval,
  setShouldConfirmOnDelete,
  setShouldDisplayGuides,
  setShouldDisplayInProgressType,
} from 'features/system/store/systemSlice';

import { systemSelector } from 'features/system/store/systemSelectors';
import { optionsSelector } from 'features/options/store/optionsSelectors';
import { setShouldUseCanvasBetaLayout } from 'features/options/store/optionsSlice';
import { useTranslation } from 'react-i18next';

import TextToImage from 'assets/images/Text-to-Image.webp';
import ImageToImage from 'assets/images/Image-to-Image.webp';
import UpscaleImg from 'assets/images/Upscale.webp';
import IAIIconButton from '../../../../common/components/IAIIconButton';
import { FaExpandArrowsAlt } from 'react-icons/fa';

const selector = createSelector(
  [systemSelector, optionsSelector],
  (system, options) => {
    const {
      shouldDisplayInProgressType,
      shouldConfirmOnDelete,
      shouldDisplayGuides,
      model_list,
      saveIntermediatesInterval,
      enableImageDebugging,
    } = system;

    const { shouldUseCanvasBetaLayout } = options;

    return {
      shouldDisplayInProgressType,
      shouldConfirmOnDelete,
      shouldDisplayGuides,
      models: _.map(model_list, (_model, key) => key),
      saveIntermediatesInterval,
      enableImageDebugging,
      shouldUseCanvasBetaLayout,
    };
  },
  {
    memoizeOptions: { resultEqualityCheck: isEqual },
  }
);

type WelcomeModalProps = {
  /* The button to open the Settings Modal */
  children: ReactElement;
};

/**
 * Modal for app settings. Also provides Reset functionality in which the
 * app's localstorage is wiped via redux-persist.
 *
 * Secondary post-reset modal is included here.
 */
const WelcomeModal = ({ children }: WelcomeModalProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const {
    isOpen: isSettingsModalOpen,
    onOpen: onSettingsModalOpen,
    onClose: onSettingsModalClose,
  } = useDisclosure();

  const {
    isOpen: isRefreshModalOpen,
    onOpen: onRefreshModalOpen,
    onClose: onRefreshModalClose,
  } = useDisclosure();

  const { enableImageDebugging } = useAppSelector(selector);

  /**
   * Resets localstorage, then opens a secondary modal informing user to
   * refresh their browser.
   * */
  const handleClickResetWebUI = () => {
    persistor.purge().then(() => {
      onSettingsModalClose();
      onRefreshModalOpen();
    });
  };

  return (
    <>
      {cloneElement(children, {
        onClick: onSettingsModalOpen,
      })}

      <Modal
        isOpen={isSettingsModalOpen}
        onClose={onSettingsModalClose}
        size="lg"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(40px)" />
        <ModalContent className="modal settings-modal">
          <ModalHeader className="settings-modal-header">
            {'Splashhh - Generative Ai app'}
          </ModalHeader>
          <ModalCloseButton className="modal-close-btn" />
          <ModalBody className="settings-modal-content">
            <div className="settings-modal-items">
              <h1 style={{ fontWeight: 'bold' }}>Things to try:</h1>
              <h2 style={{ fontWeight: 'bold' }}>1. Text-to-Image:</h2>
              <Text>
                {
                  'Text-to-Image feature refers to the capability of a model to generate an image based on a textual description.'
                }
              </Text>
              <Center>
                <img
                  className=""
                  src={TextToImage}
                  alt="invoke-ai-logo"
                  style={{
                    width: 'auto',
                    height: '150px',
                    alignItems: 'center',
                  }}
                />
              </Center>
              <h2 style={{ fontWeight: 'bold' }}>2. Image-to-Image:</h2>
              <Text>
                {
                  'This can be useful for a variety of applications, such as image editing and image style transfer. For example, the model could be used to add a specific filter or effect to an input image, or to transfer the style of one image to another.'
                }
              </Text>
              <Center>
                <img
                  src={ImageToImage}
                  alt="invoke-ai-logo"
                  style={{ width: 'auto', height: '150px' }}
                />
              </Center>
              <h2 style={{ fontWeight: 'bold' }}>3. Upscale:</h2>
              <Text>
                <IAIIconButton
                  icon={<FaExpandArrowsAlt />}
                  tooltip="Upscale"
                  aria-label={''}
                  size="lg"
                />
                <br />
                {
                  'Once you created the perfect image - upscale it: increase the size of an image while still maintaining its quality and preserving its details.'
                }
              </Text>
              <Center>
                <img
                  src={UpscaleImg}
                  alt="invoke-ai-logo"
                  style={{ width: 'auto', height: '150px' }}
                />
              </Center>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onSettingsModalClose} className="modal-close-btn">
              {'Begin'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default WelcomeModal;
