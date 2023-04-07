import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { cloneElement, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import HotkeysModalItem from './HotkeysModalItem';

type HotkeysModalProps = {
  /* The button to open the Settings Modal */
  children: ReactElement;
};

type HotkeyList = {
  title: string;
  desc: string;
  hotkey: string;
};

export default function HotkeysModal({ children }: HotkeysModalProps) {
  const {
    isOpen: isHotkeyModalOpen,
    onOpen: onHotkeysModalOpen,
    onClose: onHotkeysModalClose,
  } = useDisclosure();

  const { t } = useTranslation();

  const appHotkeys = [
    {
      title: t('hotkeys.invoke.title'),
      desc: t('hotkeys.invoke.desc'),
      hotkey: 'Ctrl+Enter',
    },
    {
      title: t('hotkeys.cancel.title'),
      desc: t('hotkeys.cancel.desc'),
      hotkey: 'Shift+X',
    },
    {
      title: t('hotkeys.focusPrompt.title'),
      desc: t('hotkeys.focusPrompt.desc'),
      hotkey: 'Alt+A',
    },
    {
      title: t('hotkeys.toggleOptions.title'),
      desc: t('hotkeys.toggleOptions.desc'),
      hotkey: 'O',
    },
    {
      title: t('hotkeys.pinOptions.title'),
      desc: t('hotkeys.pinOptions.desc'),
      hotkey: 'Shift+O',
    },
    {
      title: t('hotkeys.toggleViewer.title'),
      desc: t('hotkeys.toggleViewer.desc'),
      hotkey: 'Z',
    },
    {
      title: t('hotkeys.toggleGallery.title'),
      desc: t('hotkeys.toggleGallery.desc'),
      hotkey: 'G',
    },
    {
      title: t('hotkeys.maximizeWorkSpace.title'),
      desc: t('hotkeys.maximizeWorkSpace.desc'),
      hotkey: 'F',
    },
    {
      title: t('hotkeys.changeTabs.title'),
      desc: t('hotkeys.changeTabs.desc'),
      hotkey: '1-5',
    },

    {
      title: t('hotkeys.consoleToggle.title'),
      desc: t('hotkeys.consoleToggle.desc'),
      hotkey: '`',
    },
  ];

  const generalHotkeys = [
    {
      title: t('hotkeys.setPrompt.title'),
      desc: t('hotkeys.setPrompt.desc'),
      hotkey: 'P',
    },
    {
      title: t('hotkeys.setSeed.title'),
      desc: t('hotkeys.setSeed.desc'),
      hotkey: 'S',
    },
    {
      title: t('hotkeys.setParameters.title'),
      desc: t('hotkeys.setParameters.desc'),
      hotkey: 'A',
    },
    {
      title: t('hotkeys.restoreFaces.title'),
      desc: t('hotkeys.restoreFaces.desc'),
      hotkey: 'Shift+R',
    },
    {
      title: t('hotkeys.upscale.title'),
      desc: t('hotkeys.upscale.desc'),
      hotkey: 'Shift+U',
    },
    {
      title: t('hotkeys.showInfo.title'),
      desc: t('hotkeys.showInfo.desc'),
      hotkey: 'I',
    },
    {
      title: t('hotkeys.sendToImageToImage.title'),
      desc: t('hotkeys.sendToImageToImage.desc'),
      hotkey: 'Shift+I',
    },
    {
      title: t('hotkeys.deleteImage.title'),
      desc: t('hotkeys.deleteImage.desc'),
      hotkey: 'Del',
    },
    {
      title: t('hotkeys.closePanels.title'),
      desc: t('hotkeys.closePanels.desc'),
      hotkey: 'Esc',
    },
  ];

  const galleryHotkeys = [
    {
      title: t('hotkeys.previousImage.title'),
      desc: t('hotkeys.previousImage.desc'),
      hotkey: 'Arrow Left',
    },
    {
      title: t('hotkeys.nextImage.title'),
      desc: t('hotkeys.nextImage.desc'),
      hotkey: 'Arrow Right',
    },
    {
      title: t('hotkeys.toggleGalleryPin.title'),
      desc: t('hotkeys.toggleGalleryPin.desc'),
      hotkey: 'Shift+G',
    },
    {
      title: t('hotkeys.increaseGalleryThumbSize.title'),
      desc: t('hotkeys.increaseGalleryThumbSize.desc'),
      hotkey: 'Shift+Up',
    },
    {
      title: t('hotkeys.decreaseGalleryThumbSize.title'),
      desc: t('hotkeys.decreaseGalleryThumbSize.desc'),
      hotkey: 'Shift+Down',
    },
  ];

  const unifiedCanvasHotkeys = [
    {
      title: t('hotkeys.selectBrush.title'),
      desc: t('hotkeys.selectBrush.desc'),
      hotkey: 'B',
    },
    {
      title: t('hotkeys.selectEraser.title'),
      desc: t('hotkeys.selectEraser.desc'),
      hotkey: 'E',
    },
    {
      title: t('hotkeys.decreaseBrushSize.title'),
      desc: t('hotkeys.decreaseBrushSize.desc'),
      hotkey: '[',
    },
    {
      title: t('hotkeys.increaseBrushSize.title'),
      desc: t('hotkeys.increaseBrushSize.desc'),
      hotkey: ']',
    },
    {
      title: t('hotkeys.decreaseBrushOpacity.title'),
      desc: t('hotkeys.decreaseBrushOpacity.desc'),
      hotkey: 'Shift + [',
    },
    {
      title: t('hotkeys.increaseBrushOpacity.title'),
      desc: t('hotkeys.increaseBrushOpacity.desc'),
      hotkey: 'Shift + ]',
    },
    {
      title: t('hotkeys.moveTool.title'),
      desc: t('hotkeys.moveTool.desc'),
      hotkey: 'V',
    },
    {
      title: t('hotkeys.fillBoundingBox.title'),
      desc: t('hotkeys.fillBoundingBox.desc'),
      hotkey: 'Shift + F',
    },
    {
      title: t('hotkeys.eraseBoundingBox.title'),
      desc: t('hotkeys.eraseBoundingBox.desc'),
      hotkey: 'Delete / Backspace',
    },
    {
      title: t('hotkeys.colorPicker.title'),
      desc: t('hotkeys.colorPicker.desc'),
      hotkey: 'C',
    },
    {
      title: t('hotkeys.toggleSnap.title'),
      desc: t('hotkeys.toggleSnap.desc'),
      hotkey: 'N',
    },
    {
      title: t('hotkeys.quickToggleMove.title'),
      desc: t('hotkeys.quickToggleMove.desc'),
      hotkey: 'Hold Space',
    },
    {
      title: t('hotkeys.toggleLayer.title'),
      desc: t('hotkeys.toggleLayer.desc'),
      hotkey: 'Q',
    },
    {
      title: t('hotkeys.clearMask.title'),
      desc: t('hotkeys.clearMask.desc'),
      hotkey: 'Shift+C',
    },
    {
      title: t('hotkeys.hideMask.title'),
      desc: t('hotkeys.hideMask.desc'),
      hotkey: 'H',
    },
    {
      title: t('hotkeys.showHideBoundingBox.title'),
      desc: t('hotkeys.showHideBoundingBox.desc'),
      hotkey: 'Shift+H',
    },
    {
      title: t('hotkeys.mergeVisible.title'),
      desc: t('hotkeys.mergeVisible.desc'),
      hotkey: 'Shift+M',
    },
    {
      title: t('hotkeys.saveToGallery.title'),
      desc: t('hotkeys.saveToGallery.desc'),
      hotkey: 'Shift+S',
    },
    {
      title: t('hotkeys.copyToClipboard.title'),
      desc: t('hotkeys.copyToClipboard.desc'),
      hotkey: 'Ctrl+C',
    },
    {
      title: t('hotkeys.downloadImage.title'),
      desc: t('hotkeys.downloadImage.desc'),
      hotkey: 'Shift+D',
    },
    {
      title: t('hotkeys.undoStroke.title'),
      desc: t('hotkeys.undoStroke.desc'),
      hotkey: 'Ctrl+Z',
    },
    {
      title: t('hotkeys.redoStroke.title'),
      desc: t('hotkeys.redoStroke.desc'),
      hotkey: 'Ctrl+Shift+Z, Ctrl+Y',
    },
    {
      title: t('hotkeys.resetView.title'),
      desc: t('hotkeys.resetView.desc'),
      hotkey: 'R',
    },
    {
      title: t('hotkeys.previousStagingImage.title'),
      desc: t('hotkeys.previousStagingImage.desc'),
      hotkey: 'Arrow Left',
    },
    {
      title: t('hotkeys.nextStagingImage.title'),
      desc: t('hotkeys.nextStagingImage.desc'),
      hotkey: 'Arrow Right',
    },
    {
      title: t('hotkeys.acceptStagingImage.title'),
      desc: t('hotkeys.acceptStagingImage.desc'),
      hotkey: 'Enter',
    },
  ];

  const renderHotkeyModalItems = (hotkeys: HotkeyList[]) => {
    const hotkeyModalItemsToRender: ReactElement[] = [];

    hotkeys.forEach((hotkey, i) => {
      hotkeyModalItemsToRender.push(
        <HotkeysModalItem
          key={i}
          title={hotkey.title}
          description={hotkey.desc}
          hotkey={hotkey.hotkey}
        />
      );
    });

    return (
      <div className="hotkey-modal-category">{hotkeyModalItemsToRender}</div>
    );
  };

  return (
    <>
      {cloneElement(children, {
        onClick: onHotkeysModalOpen,
      })}
      <Modal isOpen={isHotkeyModalOpen} onClose={onHotkeysModalClose}>
        <ModalOverlay />
        <ModalContent className=" modal hotkeys-modal">
          <ModalCloseButton className="modal-close-btn" />

          <h1>Keyboard Shorcuts</h1>
          <div className="hotkeys-modal-items">
            <Accordion allowMultiple>
              <AccordionItem>
                <AccordionButton className="hotkeys-modal-button">
                  <h2>{t('hotkeys.appHotkeys')}</h2>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  {renderHotkeyModalItems(appHotkeys)}
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton className="hotkeys-modal-button">
                  <h2>{t('hotkeys.generalHotkeys')}</h2>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  {renderHotkeyModalItems(generalHotkeys)}
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton className="hotkeys-modal-button">
                  <h2>{t('hotkeys.galleryHotkeys')}</h2>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  {renderHotkeyModalItems(galleryHotkeys)}
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton className="hotkeys-modal-button">
                  <h2>{t('hotkeys.unifiedCanvasHotkeys')}</h2>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  {renderHotkeyModalItems(unifiedCanvasHotkeys)}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
