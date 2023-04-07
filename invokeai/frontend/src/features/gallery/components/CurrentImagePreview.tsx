import { IconButton, Image } from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import {
  GalleryCategory,
  GalleryState,
  selectNextImage,
  selectPrevImage,
} from 'features/gallery/store/gallerySlice';
import { uiSelector } from 'features/ui/store/uiSelectors';
import { isEqual } from 'lodash';

import { useState } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { gallerySelector } from '../store/gallerySelectors';
import ImageMetadataViewer from './ImageMetaDataViewer/ImageMetadataViewer';

export const imagesSelector = createSelector(
  [gallerySelector, uiSelector],
  (gallery: GalleryState, ui) => {
    const { currentCategory, currentImage, intermediateImage } = gallery;
    const { shouldShowImageDetails } = ui;

    const tempImages =
      gallery.categories[
        currentImage ? (currentImage.category as GalleryCategory) : 'result'
      ].images;
    const currentImageIndex = tempImages.findIndex(
      (i) => i.uuid === gallery?.currentImage?.uuid
    );
    const imagesLength = tempImages.length;

    return {
      imageToDisplay: intermediateImage ? intermediateImage : currentImage,
      isIntermediate: Boolean(intermediateImage),
      viewerImageToDisplay: currentImage,
      currentCategory,
      isOnFirstImage: currentImageIndex === 0,
      isOnLastImage:
        !isNaN(currentImageIndex) && currentImageIndex === imagesLength - 1,
      shouldShowImageDetails,
      shouldShowPrevImageButton: currentImageIndex === 0,
      shouldShowNextImageButton:
        !isNaN(currentImageIndex) && currentImageIndex === imagesLength - 1,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  }
);

export default function CurrentImagePreview() {
  const dispatch = useAppDispatch();

  const {
    isOnFirstImage,
    isOnLastImage,
    shouldShowImageDetails,
    imageToDisplay,
    isIntermediate,
  } = useAppSelector(imagesSelector);

  const [shouldShowNextPrevButtons, setShouldShowNextPrevButtons] =
    useState<boolean>(false);

  const handleCurrentImagePreviewMouseOver = () => {
    setShouldShowNextPrevButtons(true);
  };

  const handleCurrentImagePreviewMouseOut = () => {
    setShouldShowNextPrevButtons(false);
  };

  const handleClickPrevButton = () => {
    dispatch(selectPrevImage());
  };

  const handleClickNextButton = () => {
    dispatch(selectNextImage());
  };

  return (
    <div className="current-image-preview">
      {imageToDisplay && (
        <Image
          src={imageToDisplay.url}
          width={imageToDisplay.width}
          height={imageToDisplay.height}
          style={{
            imageRendering: isIntermediate ? 'pixelated' : 'initial',
          }}
        />
      )}
      {!shouldShowImageDetails && (
        <div className="current-image-next-prev-buttons">
          <div
            className="next-prev-button-trigger-area prev-button-trigger-area"
            onMouseOver={handleCurrentImagePreviewMouseOver}
            onMouseOut={handleCurrentImagePreviewMouseOut}
          >
            {shouldShowNextPrevButtons && !isOnFirstImage && (
              <IconButton
                aria-label="Previous image"
                icon={<FaAngleLeft className="next-prev-button" />}
                variant="unstyled"
                onClick={handleClickPrevButton}
              />
            )}
          </div>
          <div
            className="next-prev-button-trigger-area next-button-trigger-area"
            onMouseOver={handleCurrentImagePreviewMouseOver}
            onMouseOut={handleCurrentImagePreviewMouseOut}
          >
            {shouldShowNextPrevButtons && !isOnLastImage && (
              <IconButton
                aria-label="Next image"
                icon={<FaAngleRight className="next-prev-button" />}
                variant="unstyled"
                onClick={handleClickNextButton}
              />
            )}
          </div>
        </div>
      )}
      {shouldShowImageDetails && imageToDisplay && (
        <ImageMetadataViewer
          image={imageToDisplay}
          styleClass="current-image-metadata"
        />
      )}
    </div>
  );
}
