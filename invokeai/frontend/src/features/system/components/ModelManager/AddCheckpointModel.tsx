import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';

import IAIButton from 'common/components/IAIButton';
import IAICheckbox from 'common/components/IAICheckbox';
import IAIInput from 'common/components/IAIInput';
import IAINumberInput from 'common/components/IAINumberInput';
import React from 'react';

import SearchModels from './SearchModels';

import { addNewModel } from 'app/socketio/actions';

import { useAppDispatch, useAppSelector } from 'app/storeHooks';

import { Field, Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import type { InvokeModelConfigProps } from 'app/invokeai';
import type { RootState } from 'app/store';
import IAIIconButton from 'common/components/IAIIconButton';
import { setAddNewModelUIOption } from 'features/ui/store/uiSlice';
import type { FieldInputProps, FormikProps } from 'formik';
import { BiArrowBack } from 'react-icons/bi';

const MIN_MODEL_SIZE = 64;
const MAX_MODEL_SIZE = 2048;

export default function AddCheckpointModel() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const isProcessing = useAppSelector(
    (state: RootState) => state.system.isProcessing
  );

  function hasWhiteSpace(s: string) {
    return /\s/.test(s);
  }

  function baseValidation(value: string) {
    let error;
    if (hasWhiteSpace(value)) error = t('modelManager.cannotUseSpaces');
    return error;
  }

  const addModelFormValues: InvokeModelConfigProps = {
    name: '',
    description: '',
    config: 'configs/stable-diffusion/v1-inference.yaml',
    weights: '',
    vae: '',
    width: 512,
    height: 512,
    format: 'ckpt',
    default: false,
  };

  const addModelFormSubmitHandler = (values: InvokeModelConfigProps) => {
    dispatch(addNewModel(values));
    dispatch(setAddNewModelUIOption(null));
  };

  const [addManually, setAddmanually] = React.useState<boolean>(false);

  return (
    <>
      <IAIIconButton
        aria-label={t('common.back')}
        tooltip={t('common.back')}
        onClick={() => dispatch(setAddNewModelUIOption(null))}
        width="max-content"
        position="absolute"
        zIndex={1}
        size="sm"
        right={12}
        top={3}
        icon={<BiArrowBack />}
      />

      <SearchModels />
      <IAICheckbox
        label={t('modelManager.addManually')}
        isChecked={addManually}
        onChange={() => setAddmanually(!addManually)}
      />

      {addManually && (
        <Formik
          initialValues={addModelFormValues}
          onSubmit={addModelFormSubmitHandler}
        >
          {({ handleSubmit, errors, touched }) => (
            <form onSubmit={handleSubmit}>
              <VStack rowGap="0.5rem">
                <Text fontSize={20} fontWeight="bold" alignSelf="start">
                  {t('modelManager.manual')}
                </Text>
                {/* Name */}
                <FormControl
                  isInvalid={!!errors.name && touched.name}
                  isRequired
                >
                  <FormLabel htmlFor="name" fontSize="sm">
                    {t('modelManager.name')}
                  </FormLabel>
                  <VStack alignItems="start">
                    <Field
                      as={IAIInput}
                      id="name"
                      name="name"
                      type="text"
                      validate={baseValidation}
                      width="2xl"
                    />
                    {!!errors.name && touched.name ? (
                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    ) : (
                      <FormHelperText margin={0}>
                        {t('modelManager.nameValidationMsg')}
                      </FormHelperText>
                    )}
                  </VStack>
                </FormControl>

                {/* Description */}
                <FormControl
                  isInvalid={!!errors.description && touched.description}
                  isRequired
                >
                  <FormLabel htmlFor="description" fontSize="sm">
                    {t('modelManager.description')}
                  </FormLabel>
                  <VStack alignItems="start">
                    <Field
                      as={IAIInput}
                      id="description"
                      name="description"
                      type="text"
                      width="2xl"
                    />
                    {!!errors.description && touched.description ? (
                      <FormErrorMessage>{errors.description}</FormErrorMessage>
                    ) : (
                      <FormHelperText margin={0}>
                        {t('modelManager.descriptionValidationMsg')}
                      </FormHelperText>
                    )}
                  </VStack>
                </FormControl>

                {/* Config */}
                <FormControl
                  isInvalid={!!errors.config && touched.config}
                  isRequired
                >
                  <FormLabel htmlFor="config" fontSize="sm">
                    {t('modelManager.config')}
                  </FormLabel>
                  <VStack alignItems="start">
                    <Field
                      as={IAIInput}
                      id="config"
                      name="config"
                      type="text"
                      width="2xl"
                    />
                    {!!errors.config && touched.config ? (
                      <FormErrorMessage>{errors.config}</FormErrorMessage>
                    ) : (
                      <FormHelperText margin={0}>
                        {t('modelManager.configValidationMsg')}
                      </FormHelperText>
                    )}
                  </VStack>
                </FormControl>

                {/* Weights */}
                <FormControl
                  isInvalid={!!errors.weights && touched.weights}
                  isRequired
                >
                  <FormLabel htmlFor="config" fontSize="sm">
                    {t('modelManager.modelLocation')}
                  </FormLabel>
                  <VStack alignItems="start">
                    <Field
                      as={IAIInput}
                      id="weights"
                      name="weights"
                      type="text"
                      width="2xl"
                    />
                    {!!errors.weights && touched.weights ? (
                      <FormErrorMessage>{errors.weights}</FormErrorMessage>
                    ) : (
                      <FormHelperText margin={0}>
                        {t('modelManager.modelLocationValidationMsg')}
                      </FormHelperText>
                    )}
                  </VStack>
                </FormControl>

                {/* VAE */}
                <FormControl isInvalid={!!errors.vae && touched.vae}>
                  <FormLabel htmlFor="vae" fontSize="sm">
                    {t('modelManager.vaeLocation')}
                  </FormLabel>
                  <VStack alignItems="start">
                    <Field
                      as={IAIInput}
                      id="vae"
                      name="vae"
                      type="text"
                      width="2xl"
                    />
                    {!!errors.vae && touched.vae ? (
                      <FormErrorMessage>{errors.vae}</FormErrorMessage>
                    ) : (
                      <FormHelperText margin={0}>
                        {t('modelManager.vaeLocationValidationMsg')}
                      </FormHelperText>
                    )}
                  </VStack>
                </FormControl>

                <HStack width="100%">
                  {/* Width */}
                  <FormControl isInvalid={!!errors.width && touched.width}>
                    <FormLabel htmlFor="width" fontSize="sm">
                      {t('modelManager.width')}
                    </FormLabel>
                    <VStack alignItems="start">
                      <Field id="width" name="width">
                        {({
                          field,
                          form,
                        }: {
                          field: FieldInputProps<number>;
                          form: FormikProps<InvokeModelConfigProps>;
                        }) => (
                          <IAINumberInput
                            id="width"
                            name="width"
                            min={MIN_MODEL_SIZE}
                            max={MAX_MODEL_SIZE}
                            step={64}
                            width="90%"
                            value={form.values.width}
                            onChange={(value) =>
                              form.setFieldValue(field.name, Number(value))
                            }
                          />
                        )}
                      </Field>

                      {!!errors.width && touched.width ? (
                        <FormErrorMessage>{errors.width}</FormErrorMessage>
                      ) : (
                        <FormHelperText margin={0}>
                          {t('modelManager.widthValidationMsg')}
                        </FormHelperText>
                      )}
                    </VStack>
                  </FormControl>

                  {/* Height */}
                  <FormControl isInvalid={!!errors.height && touched.height}>
                    <FormLabel htmlFor="height" fontSize="sm">
                      {t('modelManager.height')}
                    </FormLabel>
                    <VStack alignItems="start">
                      <Field id="height" name="height">
                        {({
                          field,
                          form,
                        }: {
                          field: FieldInputProps<number>;
                          form: FormikProps<InvokeModelConfigProps>;
                        }) => (
                          <IAINumberInput
                            id="height"
                            name="height"
                            min={MIN_MODEL_SIZE}
                            max={MAX_MODEL_SIZE}
                            width="90%"
                            step={64}
                            value={form.values.height}
                            onChange={(value) =>
                              form.setFieldValue(field.name, Number(value))
                            }
                          />
                        )}
                      </Field>

                      {!!errors.height && touched.height ? (
                        <FormErrorMessage>{errors.height}</FormErrorMessage>
                      ) : (
                        <FormHelperText margin={0}>
                          {t('modelManager.heightValidationMsg')}
                        </FormHelperText>
                      )}
                    </VStack>
                  </FormControl>
                </HStack>

                <IAIButton
                  type="submit"
                  className="modal-close-btn"
                  isLoading={isProcessing}
                >
                  {t('modelManager.addModel')}
                </IAIButton>
              </VStack>
            </form>
          )}
        </Formik>
      )}
    </>
  );
}
