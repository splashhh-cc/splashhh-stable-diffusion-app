import { Button } from '@chakra-ui/button';
import { NumberSize, Resizable } from 're-resizable';

import { ButtonGroup } from '@chakra-ui/react';
import { requestImages } from 'app/socketio/actions';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import IAIButton from 'common/components/IAIButton';
import IAICheckbox from 'common/components/IAICheckbox';
import IAIIconButton from 'common/components/IAIIconButton';
import IAIPopover from 'common/components/IAIPopover';
import IAISlider from 'common/components/IAISlider';
import { setDoesCanvasNeedScaling } from 'features/canvas/store/canvasSlice';
import { imageGallerySelector } from 'features/gallery/store/gallerySelectors';
import {
  selectNextImage,
  selectPrevImage,
  setCurrentCategory,
  setGalleryImageMinimumWidth,
  setGalleryImageObjectFit,
  setGalleryScrollPosition,
  setGalleryWidth,
  setShouldAutoSwitchToNewImages,
  setShouldHoldGalleryOpen,
  setShouldPinGallery,
  setShouldShowGallery,
  setShouldUseSingleGalleryColumn,
} from 'features/gallery/store/gallerySlice';
import { InvokeTabName } from 'features/ui/store/tabMap';

import { clamp } from 'lodash';
import { Direction } from 're-resizable/lib/resizer';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { BiReset } from 'react-icons/bi';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import { FaImage, FaUser, FaWrench } from 'react-icons/fa';
import { MdPhotoLibrary } from 'react-icons/md';
import { CSSTransition } from 'react-transition-group';
import HoverableImage from './HoverableImage';

const GALLERY_SHOW_BUTTONS_MIN_WIDTH = 320;
const GALLERY_IMAGE_WIDTH_OFFSET = 40;

const GALLERY_TAB_WIDTHS: Record<
  InvokeTabName,
  { galleryMinWidth: number; galleryMaxWidth: number }
> = {
  txt2img: { galleryMinWidth: 200, galleryMaxWidth: 500 },
  img2img: { galleryMinWidth: 200, galleryMaxWidth: 500 },
  unifiedCanvas: { galleryMinWidth: 200, galleryMaxWidth: 200 },
  nodes: { galleryMinWidth: 200, galleryMaxWidth: 500 },
  postprocess: { galleryMinWidth: 200, galleryMaxWidth: 500 },
  training: { galleryMinWidth: 200, galleryMaxWidth: 500 },
};

const LIGHTBOX_GALLERY_WIDTH = 400;

export default function ImageGallery() {
  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const {
    images,
    currentCategory,
    currentImageUuid,
    shouldPinGallery,
    shouldShowGallery,
    galleryScrollPosition,
    galleryImageMinimumWidth,
    galleryGridTemplateColumns,
    activeTabName,
    galleryImageObjectFit,
    shouldHoldGalleryOpen,
    shouldAutoSwitchToNewImages,
    areMoreImagesAvailable,
    galleryWidth,
    isLightboxOpen,
    isStaging,
    shouldEnableResize,
    shouldUseSingleGalleryColumn,
  } = useAppSelector(imageGallerySelector);

  const { galleryMinWidth, galleryMaxWidth } = isLightboxOpen
    ? {
        galleryMinWidth: LIGHTBOX_GALLERY_WIDTH,
        galleryMaxWidth: LIGHTBOX_GALLERY_WIDTH,
      }
    : GALLERY_TAB_WIDTHS[activeTabName];

  const [shouldShowButtons, setShouldShowButtons] = useState<boolean>(
    galleryWidth >= GALLERY_SHOW_BUTTONS_MIN_WIDTH
  );

  const [isResizing, setIsResizing] = useState(false);
  const [galleryResizeHeight, setGalleryResizeHeight] = useState(0);

  const galleryRef = useRef<HTMLDivElement>(null);
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (galleryWidth >= GALLERY_SHOW_BUTTONS_MIN_WIDTH) {
      setShouldShowButtons(false);
    }
  }, [galleryWidth]);

  const handleSetShouldPinGallery = () => {
    dispatch(setShouldPinGallery(!shouldPinGallery));
    dispatch(setDoesCanvasNeedScaling(true));
  };

  const handleToggleGallery = () => {
    shouldShowGallery ? handleCloseGallery() : handleOpenGallery();
  };

  const handleOpenGallery = () => {
    dispatch(setShouldShowGallery(true));
    shouldPinGallery && dispatch(setDoesCanvasNeedScaling(true));
  };

  const handleCloseGallery = useCallback(() => {
    dispatch(setShouldShowGallery(false));
    dispatch(setShouldHoldGalleryOpen(false));
    dispatch(
      setGalleryScrollPosition(
        galleryContainerRef.current ? galleryContainerRef.current.scrollTop : 0
      )
    );
    setTimeout(
      () => shouldPinGallery && dispatch(setDoesCanvasNeedScaling(true)),
      400
    );
  }, [dispatch, shouldPinGallery]);

  const handleClickLoadMore = () => {
    dispatch(requestImages(currentCategory));
  };

  const handleChangeGalleryImageMinimumWidth = (v: number) => {
    dispatch(setGalleryImageMinimumWidth(v));
  };

  const setCloseGalleryTimer = () => {
    if (shouldHoldGalleryOpen) return;
    timeoutIdRef.current = window.setTimeout(() => handleCloseGallery(), 500);
  };

  const cancelCloseGalleryTimer = () => {
    timeoutIdRef.current && window.clearTimeout(timeoutIdRef.current);
  };

  useHotkeys(
    'g',
    () => {
      handleToggleGallery();
    },
    [shouldShowGallery, shouldPinGallery]
  );

  useHotkeys(
    'left',
    () => {
      dispatch(selectPrevImage());
    },
    {
      enabled: !isStaging || activeTabName !== 'unifiedCanvas',
    },
    [isStaging]
  );

  useHotkeys(
    'right',
    () => {
      dispatch(selectNextImage());
    },
    {
      enabled: !isStaging || activeTabName !== 'unifiedCanvas',
    },
    [isStaging]
  );

  useHotkeys(
    'shift+g',
    () => {
      handleSetShouldPinGallery();
    },
    [shouldPinGallery]
  );

  useHotkeys(
    'esc',
    () => {
      dispatch(setShouldShowGallery(false));
    },
    {
      enabled: () => !shouldPinGallery,
      preventDefault: true,
    },
    [shouldPinGallery]
  );

  const IMAGE_SIZE_STEP = 32;

  useHotkeys(
    'shift+up',
    () => {
      if (galleryImageMinimumWidth < 256) {
        const newMinWidth = clamp(
          galleryImageMinimumWidth + IMAGE_SIZE_STEP,
          32,
          256
        );
        dispatch(setGalleryImageMinimumWidth(newMinWidth));
      }
    },
    [galleryImageMinimumWidth]
  );

  useHotkeys(
    'shift+down',
    () => {
      if (galleryImageMinimumWidth > 32) {
        const newMinWidth = clamp(
          galleryImageMinimumWidth - IMAGE_SIZE_STEP,
          32,
          256
        );
        dispatch(setGalleryImageMinimumWidth(newMinWidth));
      }
    },
    [galleryImageMinimumWidth]
  );

  // set gallery scroll position
  useEffect(() => {
    if (!galleryContainerRef.current) return;
    galleryContainerRef.current.scrollTop = galleryScrollPosition;
  }, [galleryScrollPosition, shouldShowGallery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        !shouldPinGallery &&
        galleryRef.current &&
        !galleryRef.current.contains(e.target as Node)
      ) {
        handleCloseGallery();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleCloseGallery, shouldPinGallery]);

  return (
    <CSSTransition
      nodeRef={galleryRef}
      in={shouldShowGallery || shouldHoldGalleryOpen}
      unmountOnExit
      timeout={200}
      classNames="image-gallery-wrapper"
    >
      <div
        className="image-gallery-wrapper"
        style={{ zIndex: shouldPinGallery ? 1 : 100 }}
        data-pinned={shouldPinGallery}
        ref={galleryRef}
        onMouseLeave={!shouldPinGallery ? setCloseGalleryTimer : undefined}
        onMouseEnter={!shouldPinGallery ? cancelCloseGalleryTimer : undefined}
        onMouseOver={!shouldPinGallery ? cancelCloseGalleryTimer : undefined}
      >
        <Resizable
          minWidth={galleryMinWidth}
          maxWidth={shouldPinGallery ? galleryMaxWidth : window.innerWidth}
          className="image-gallery-popup"
          handleStyles={{
            left: {
              width: '15px',
            },
          }}
          enable={{
            left: shouldEnableResize,
          }}
          size={{
            width: galleryWidth,
            height: shouldPinGallery ? '100%' : '100vh',
          }}
          onResizeStart={(
            _event:
              | React.MouseEvent<HTMLElement>
              | React.TouchEvent<HTMLElement>,
            _direction: Direction,
            elementRef: HTMLElement
          ) => {
            setGalleryResizeHeight(elementRef.clientHeight);
            elementRef.style.height = `${elementRef.clientHeight}px`;
            if (shouldPinGallery) {
              elementRef.style.position = 'fixed';
              elementRef.style.right = '1rem';
              setIsResizing(true);
            }
          }}
          onResizeStop={(
            _event: MouseEvent | TouchEvent,
            _direction: Direction,
            elementRef: HTMLElement,
            delta: NumberSize
          ) => {
            const newWidth = shouldPinGallery
              ? clamp(
                  Number(galleryWidth) + delta.width,
                  galleryMinWidth,
                  Number(galleryMaxWidth)
                )
              : Number(galleryWidth) + delta.width;
            dispatch(setGalleryWidth(newWidth));

            elementRef.removeAttribute('data-resize-alert');

            if (shouldPinGallery) {
              elementRef.style.position = 'relative';
              elementRef.style.removeProperty('right');
              elementRef.style.setProperty(
                'height',
                shouldPinGallery ? '100%' : '100vh'
              );
              setIsResizing(false);
              dispatch(setDoesCanvasNeedScaling(true));
            }
          }}
          onResize={(
            _event: MouseEvent | TouchEvent,
            _direction: Direction,
            elementRef: HTMLElement,
            delta: NumberSize
          ) => {
            const newWidth = clamp(
              Number(galleryWidth) + delta.width,
              galleryMinWidth,
              Number(
                shouldPinGallery ? galleryMaxWidth : 0.95 * window.innerWidth
              )
            );

            if (
              newWidth >= GALLERY_SHOW_BUTTONS_MIN_WIDTH &&
              !shouldShowButtons
            ) {
              setShouldShowButtons(true);
            } else if (
              newWidth < GALLERY_SHOW_BUTTONS_MIN_WIDTH &&
              shouldShowButtons
            ) {
              setShouldShowButtons(false);
            }

            if (
              galleryImageMinimumWidth >
              newWidth - GALLERY_IMAGE_WIDTH_OFFSET
            ) {
              dispatch(
                setGalleryImageMinimumWidth(
                  newWidth - GALLERY_IMAGE_WIDTH_OFFSET
                )
              );
            }

            if (shouldPinGallery) {
              if (newWidth >= galleryMaxWidth) {
                elementRef.setAttribute('data-resize-alert', 'true');
              } else {
                elementRef.removeAttribute('data-resize-alert');
              }
            }

            elementRef.style.height = `${galleryResizeHeight}px`;
          }}
        >
          <div className="image-gallery-header">
            <ButtonGroup
              size="sm"
              isAttached
              variant="solid"
              className="image-gallery-category-btn-group"
            >
              {shouldShowButtons ? (
                <>
                  <IAIButton
                    size="sm"
                    data-selected={currentCategory === 'result'}
                    onClick={() => dispatch(setCurrentCategory('result'))}
                  >
                    {t('gallery.generations')}
                  </IAIButton>
                  <IAIButton
                    size="sm"
                    data-selected={currentCategory === 'user'}
                    onClick={() => dispatch(setCurrentCategory('user'))}
                  >
                    {t('gallery.uploads')}
                  </IAIButton>
                </>
              ) : (
                <>
                  <IAIIconButton
                    aria-label={t('gallery.showGenerations')}
                    tooltip={t('gallery.showGenerations')}
                    data-selected={currentCategory === 'result'}
                    icon={<FaImage />}
                    onClick={() => dispatch(setCurrentCategory('result'))}
                  />
                  <IAIIconButton
                    aria-label={t('gallery.showUploads')}
                    tooltip={t('gallery.showUploads')}
                    data-selected={currentCategory === 'user'}
                    icon={<FaUser />}
                    onClick={() => dispatch(setCurrentCategory('user'))}
                  />
                </>
              )}
            </ButtonGroup>

            <div className="image-gallery-header-right-icons">
              <IAIPopover
                isLazy
                trigger="hover"
                placement="left"
                triggerComponent={
                  <IAIIconButton
                    size="sm"
                    aria-label={t('gallery.gallerySettings')}
                    icon={<FaWrench />}
                    className="image-gallery-icon-btn"
                    cursor="pointer"
                  />
                }
              >
                <div className="image-gallery-settings-popover">
                  <div>
                    <IAISlider
                      value={galleryImageMinimumWidth}
                      onChange={handleChangeGalleryImageMinimumWidth}
                      min={32}
                      max={256}
                      hideTooltip={true}
                      label={t('gallery.galleryImageSize')}
                    />
                    <IAIIconButton
                      size="sm"
                      aria-label={t('gallery.galleryImageResetSize')}
                      tooltip={t('gallery.galleryImageResetSize')}
                      onClick={() => dispatch(setGalleryImageMinimumWidth(64))}
                      icon={<BiReset />}
                      data-selected={shouldPinGallery}
                      styleClass="image-gallery-icon-btn"
                    />
                  </div>
                  <div>
                    <IAICheckbox
                      label={t('gallery.maintainAspectRatio')}
                      isChecked={galleryImageObjectFit === 'contain'}
                      onChange={() =>
                        dispatch(
                          setGalleryImageObjectFit(
                            galleryImageObjectFit === 'contain'
                              ? 'cover'
                              : 'contain'
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <IAICheckbox
                      label={t('gallery.autoSwitchNewImages')}
                      isChecked={shouldAutoSwitchToNewImages}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        dispatch(
                          setShouldAutoSwitchToNewImages(e.target.checked)
                        )
                      }
                    />
                  </div>
                  <div>
                    <IAICheckbox
                      label={t('gallery.singleColumnLayout')}
                      isChecked={shouldUseSingleGalleryColumn}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        dispatch(
                          setShouldUseSingleGalleryColumn(e.target.checked)
                        )
                      }
                    />
                  </div>
                </div>
              </IAIPopover>

              <IAIIconButton
                size="sm"
                className="image-gallery-icon-btn"
                aria-label={t('gallery.pinGallery')}
                tooltip={`${t('gallery.pinGallery')} (Shift+G)`}
                onClick={handleSetShouldPinGallery}
                icon={shouldPinGallery ? <BsPinAngleFill /> : <BsPinAngle />}
              />
            </div>
          </div>
          <div className="image-gallery-container" ref={galleryContainerRef}>
            {images.length || areMoreImagesAvailable ? (
              <>
                <div
                  className="image-gallery"
                  style={{ gridTemplateColumns: galleryGridTemplateColumns }}
                >
                  {images.map((image) => {
                    const { uuid } = image;
                    const isSelected = currentImageUuid === uuid;
                    return (
                      <HoverableImage
                        key={uuid}
                        image={image}
                        isSelected={isSelected}
                      />
                    );
                  })}
                </div>
                <Button
                  onClick={handleClickLoadMore}
                  isDisabled={!areMoreImagesAvailable}
                  className="image-gallery-load-more-btn"
                >
                  {areMoreImagesAvailable
                    ? t('gallery.loadMore')
                    : t('gallery.allImagesLoaded')}
                </Button>
              </>
            ) : (
              <div className="image-gallery-container-placeholder">
                <MdPhotoLibrary />
                <p>{t('gallery.noImagesInGallery')}</p>
              </div>
            )}
          </div>
        </Resizable>
        {isResizing && (
          <div
            style={{
              width: `${galleryWidth}px`,
              height: '100%',
            }}
          />
        )}
      </div>
    </CSSTransition>
  );
}
