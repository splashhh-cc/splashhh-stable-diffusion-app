import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Center,
} from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import _ from 'lodash';

import { cloneElement, ReactElement } from 'react';

import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import { systemSelector } from 'features/system/store/systemSelectors';
import { setWelcomeModal } from 'features/system/store/systemSlice';
import IAIIconButton from 'common/components/IAIIconButton';
import { FaExpandArrowsAlt } from 'react-icons/fa';

import TextToImage from 'assets/images/Text-to-Image.webp';
import ImageToImage from 'assets/images/Image-to-Image.webp';
import UpscaleImg from 'assets/images/Upscale.webp';

const selector = createSelector(
  [systemSelector],
  (options) => {
    const { isWelcomeModalOpen } = options;

    return {
      isWelcomeModalOpen,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: _.isEqual,
    },
  }
);

type WelcomeModalProps = {
  /* The button to open the welcome Modal */
  children: ReactElement;
};

/**
 * Modal for app welcome.
 *
 */
const WelcomeModal = ({ children }: WelcomeModalProps) => {
  const dispatch = useAppDispatch();

  const { isWelcomeModalOpen } = useAppSelector(selector);

  const onWelcomeModalClose = () => {
    dispatch(setWelcomeModal(false));
  };

  const onWelcomeModalOpen = () => {
    dispatch(setWelcomeModal(true));
  };

  return (
    <>
      {cloneElement(children, {
        onClick: onWelcomeModalOpen,
      })}

      <Modal
        isOpen={isWelcomeModalOpen}
        onClose={onWelcomeModalClose}
        size="lg"
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(40px)" />
        <ModalContent className="modal welcome-modal">
          <ModalHeader className="welcome-modal-header">
            {'Splashhh - Generative Ai app'}
          </ModalHeader>
          <ModalCloseButton className="modal-close-btn" />
          <ModalBody className="welcome-modal-content">
            <div className="welcome-modal-items">
              <h1 style={{ fontWeight: 'bold' }}>
                Welcome to Splashhh. Things to try:
              </h1>
              <br />
              <br />
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
                    height: '200px',
                    alignItems: 'center',
                  }}
                />
              </Center>
              <br />
              <br />
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
                  style={{ width: 'auto', height: '200px' }}
                />
              </Center>
              <br />
              <br />
              <br />
              <br />
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
                  style={{ width: 'auto', height: '200px' }}
                />
              </Center>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onWelcomeModalClose} className="modal-close-btn">
              {'Begin'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default WelcomeModal;
