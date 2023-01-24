/**
 * Types for images, the things they are made of, and the things
 * they make up.
 *
 * Generated images are txt2img and img2img images. They may have
 * had additional postprocessing done on them when they were first
 * generated.
 *
 * Postprocessed images are images which were not generated here
 * but only postprocessed by the app. They only get postprocessing
 * metadata and have a different image type, e.g. 'esrgan' or
 * 'gfpgan'.
 */

import { InvokeTabName } from 'features/tabs/tabMap';
import { IRect } from 'konva/lib/types';

/**
 * TODO:
 * Once an image has been generated, if it is postprocessed again,
 * additional postprocessing steps are added to its postprocessing
 * array.
 *
 * TODO: Better documentation of types.
 */

export declare type PromptItem = {
  prompt: string;
  weight: number;
};

export declare type Prompt = Array<PromptItem>;

export declare type SeedWeightPair = {
  seed: number;
  weight: number;
};

export declare type SeedWeights = Array<SeedWeightPair>;

// All generated images contain these metadata.
export declare type CommonGeneratedImageMetadata = {
  postprocessing: null | Array<ESRGANMetadata | GFPGANMetadata>;
  sampler:
    | 'ddim'
    | 'k_dpm_2_a'
    | 'k_dpm_2'
    | 'k_dpmpp_2_a'
    | 'k_dpmpp_2'
    | 'k_euler_a'
    | 'k_euler'
    | 'k_heun'
    | 'k_lms'
    | 'plms';
  prompt: Prompt;
  seed: number;
  variations: SeedWeights;
  steps: number;
  cfg_scale: number;
  width: number;
  height: number;
  seamless: boolean;
  hires_fix: boolean;
  extra: null | Record<string, never>; // Pending development of RFC #266
};

// txt2img and img2img images have some unique attributes.
export declare type Txt2ImgMetadata = GeneratedImageMetadata & {
  type: 'txt2img';
};

export declare type Img2ImgMetadata = GeneratedImageMetadata & {
  type: 'img2img';
  orig_hash: string;
  strength: number;
  fit: boolean;
  init_image_path: string;
  mask_image_path?: string;
};

// Superset of  generated image metadata types.
export declare type GeneratedImageMetadata = Txt2ImgMetadata | Img2ImgMetadata;

// All post processed images contain these metadata.
export declare type CommonPostProcessedImageMetadata = {
  orig_path: string;
  orig_hash: string;
};

// esrgan and gfpgan images have some unique attributes.
export declare type ESRGANMetadata = CommonPostProcessedImageMetadata & {
  type: 'esrgan';
  scale: 2 | 4;
  strength: number;
};

export declare type FacetoolMetadata = CommonPostProcessedImageMetadata & {
  type: 'gfpgan' | 'codeformer';
  strength: number;
  fidelity?: number;
};

// Superset of all postprocessed image metadata types..
export declare type PostProcessedImageMetadata =
  | ESRGANMetadata
  | FacetoolMetadata;

// Metadata includes the system config and image metadata.
export declare type Metadata = SystemGenerationMetadata & {
  image: GeneratedImageMetadata | PostProcessedImageMetadata;
};

// An Image has a UUID, url, modified timestamp, width, height and maybe metadata
export declare type Image = {
  uuid: string;
  url: string;
  thumbnail: string;
  mtime: number;
  metadata?: Metadata;
  width: number;
  height: number;
  category: GalleryCategory;
  isBase64?: boolean;
  dreamPrompt?: 'string';
};

// GalleryImages is an array of Image.
export declare type GalleryImages = {
  images: Array<Image>;
};

/**
 * Types related to the system status.
 */

// This represents the processing status of the backend.
export declare type SystemStatus = {
  isProcessing: boolean;
  currentStep: number;
  totalSteps: number;
  currentIteration: number;
  totalIterations: number;
  currentStatus: string;
  currentStatusHasSteps: boolean;
  hasError: boolean;
};

export declare type SystemGenerationMetadata = {
  model: string;
  model_weights?: string;
  model_id?: string;
  model_hash: string;
  app_id: string;
  app_version: string;
};

export declare type SystemConfig = SystemGenerationMetadata & {
  model_list: ModelList;
  infill_methods: string[];
};

export declare type ModelStatus = 'active' | 'cached' | 'not loaded';

export declare type Model = {
  status: ModelStatus;
  description: string;
  weights: string;
  config?: string;
  vae?: string;
  width?: number;
  height?: number;
  default?: boolean;
};

export declare type ModelList = Record<string, Model>;

export declare type FoundModel = {
  name: string;
  location: string;
};

export declare type InvokeModelConfigProps = {
  name: string | undefined;
  description: string | undefined;
  config: string | undefined;
  weights: string | undefined;
  vae: string | undefined;
  width: number | undefined;
  height: number | undefined;
  default: boolean | undefined;
};

/**
 * These types type data received from the server via socketio.
 */

export declare type ModelChangeResponse = {
  model_name: string;
  model_list: ModelList;
};

export declare type ModelAddedResponse = {
  new_model_name: string;
  model_list: ModelList;
  update: boolean;
};

export declare type ModelDeletedResponse = {
  deleted_model_name: string;
  model_list: ModelList;
};

export declare type FoundModelResponse = {
  search_folder: string;
  found_models: FoundModel[];
};

export declare type SystemStatusResponse = SystemStatus;

export declare type SystemConfigResponse = SystemConfig;

export declare type ImageResultResponse = Omit<Image, 'uuid'> & {
  boundingBox?: IRect;
  generationMode: InvokeTabName;
};

export declare type ImageUploadResponse = {
  // image: Omit<Image, 'uuid' | 'metadata' | 'category'>;
  url: string;
  mtime: number;
  width: number;
  height: number;
  thumbnail: string;
  // bbox: [number, number, number, number];
};

export declare type ErrorResponse = {
  message: string;
  additionalData?: string;
};

export declare type GalleryImagesResponse = {
  images: Array<Omit<Image, 'uuid'>>;
  areMoreImagesAvailable: boolean;
  category: GalleryCategory;
};

export declare type ImageDeletedResponse = {
  uuid: string;
  url: string;
  category: GalleryCategory;
};

export declare type ImageUrlResponse = {
  url: string;
};

export declare type UploadImagePayload = {
  file: File;
  destination?: ImageUploadDestination;
};

export declare type UploadOutpaintingMergeImagePayload = {
  dataURL: string;
  name: string;
};

export declare type GetChallengeResponse = {
  challenge: string;
};
