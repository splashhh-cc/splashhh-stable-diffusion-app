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
import { MdInsights } from 'react-icons/md';

import TextToImage from 'assets/images/Text-to-Image.webp';
import ImageToImage from 'assets/images/Image-to-Image.webp';
import UpscaleImg from 'assets/images/Upscale.webp';
import SplashhhImg from 'assets/images/Splashhh-header.webp';
import type { RootState } from 'app/store';

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

  const appVersion = useAppSelector(
    (state: RootState) => state.system.app_version
  );

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
        <ModalContent className="w-modal welcome-modal">
          <ModalHeader className="welcome-modal-header">
            {'Splashhh - Generative Ai Experiment'}
            <Text
              fontWeight="bold"
              color="var(--text-color-secondary)"
              // marginTop="0.2rem"
            >
              App Version: {appVersion}
            </Text>
          </ModalHeader>
          <ModalCloseButton className="modal-close-btn" />
          <ModalBody className="welcome-modal-content">
            <div className="welcome-modal-items">
              <Center>
                <img
                  src={SplashhhImg}
                  alt="Upscale-image"
                  style={{ width: 'auto', height: '60px' }}
                />
                <h1 style={{ fontWeight: 'bold' }}>
                  | Welcome to Splashhh. Things to try:
                </h1>
              </Center>
              <br />
              <br />
              <h2 style={{ fontWeight: 'bold' }}>1. Text-to-Image:</h2>
              <Text>
                {
                  'Text-to-Image feature refers to the capability of a model to generate an image based on a textual description. The first prompt is already included in the text box. You can also try your own prompt.'
                }
              </Text>
              <Center>
                <img
                  className=""
                  src={TextToImage}
                  alt="Text-to-Image"
                  style={{
                    width: 'auto',
                    height: '200px',
                    alignItems: 'center',
                  }}
                />
              </Center>
              <br />
              <Text>
                No ideas? Try the ‘Random Prompt‘ button:{' '}
                <IAIIconButton
                  icon={<MdInsights />}
                  tooltip={'Random prompt'}
                  aria-label={'Random prompt'}
                  styleClass="random-prompt-btn"
                />
              </Text>
              <br />
              <h2 style={{ fontWeight: 'bold' }}>2. Image-to-Image:</h2>
              <Text>
                {
                  'This can be useful for a variety of applications, such as image editing and image style transfer. For example, the model could be used to add a specific filter or effect to an input image, or to transfer the style of one image to another. Alternatively, you can also try to create a new image based on the style of the input image or slightly adjust an existing image.'
                }
              </Text>
              <Center>
                <img
                  src={ImageToImage}
                  alt="Image-to-Image"
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
                  'Once you created the perfect image - upscale it: increase the size of an image while still maintaining its quality and preserving its details. A different ML model is used to upscale the image.'
                }
              </Text>
              <Center>
                <img
                  src={UpscaleImg}
                  alt="Upscale-image"
                  style={{ width: 'auto', height: '200px' }}
                />
              </Center>
              <br />
              <br />
              <br />
              <Text>
                Terms and conditions:
                <br />
                By closing this window you agree to the terms and conditions and
                the privacy policy as published on Splashhh.cc
              </Text>
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
