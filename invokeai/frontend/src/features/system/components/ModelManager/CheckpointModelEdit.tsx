import { createSelector } from '@reduxjs/toolkit';

import IAIButton from 'common/components/IAIButton';
import IAIInput from 'common/components/IAIInput';
import IAINumberInput from 'common/components/IAINumberInput';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import { systemSelector } from 'features/system/store/systemSelectors';

import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';

import { addNewModel } from 'app/socketio/actions';
import { Field, Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import type { InvokeModelConfigProps } from 'app/invokeai';
import type { RootState } from 'app/store';
import type { FieldInputProps, FormikProps } from 'formik';
import { isEqual, pickBy } from 'lodash';
import ModelConvert from './ModelConvert';

const selector = createSelector(
  [systemSelector],
  (system) => {
    const { openModel, model_list } = system;
    return {
      model_list,
      openModel,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  }
);

const MIN_MODEL_SIZE = 64;
const MAX_MODEL_SIZE = 2048;

export default function CheckpointModelEdit() {
  const { openModel, model_list } = useAppSelector(selector);
  const isProcessing = useAppSelector(
    (state: RootState) => state.system.isProcessing
  );

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [editModelFormValues, setEditModelFormValues] =
    useState<InvokeModelConfigProps>({
      name: '',
      description: '',
      config: 'configs/stable-diffusion/v1-inference.yaml',
      weights: '',
      vae: '',
      width: 512,
      height: 512,
      default: false,
      format: 'ckpt',
    });

  useEffect(() => {
    if (openModel) {
      const retrievedModel = pickBy(model_list, (_val, key) => {
        return isEqual(key, openModel);
      });
      setEditModelFormValues({
        name: openModel,
        description: retrievedModel[openModel]?.description,
        config: retrievedModel[openModel]?.config,
        weights: retrievedModel[openModel]?.weights,
        vae: retrievedModel[openModel]?.vae,
        width: retrievedModel[openModel]?.width,
        height: retrievedModel[openModel]?.height,
        default: retrievedModel[openModel]?.default,
        format: 'ckpt',
      });
    }
  }, [model_list, openModel]);

  const editModelFormSubmitHandler = (values: InvokeModelConfigProps) => {
    dispatch(
      addNewModel({
        ...values,
        width: Number(values.width),
        height: Number(values.height),
      })
    );
  };

  return openModel ? (
    <Flex flexDirection="column" rowGap="1rem" width="100%">
      <Flex alignItems="center" gap={4} justifyContent="space-between">
        <Text fontSize="lg" fontWeight="bold">
          {openModel}
        </Text>
        <ModelConvert model={openModel} />
      </Flex>
      <Flex
        flexDirection="column"
        maxHeight={window.innerHeight - 270}
        overflowY="scroll"
        paddingRight="2rem"
      >
        <Formik
          enableReinitialize={true}
          initialValues={editModelFormValues}
          onSubmit={editModelFormSubmitHandler}
        >
          {({ handleSubmit, errors, touched }) => (
            <form onSubmit={handleSubmit}>
              <VStack rowGap="0.5rem" alignItems="start">
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
                      width="lg"
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
                      width="lg"
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
                      width="lg"
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
                      width="lg"
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
                  {t('modelManager.updateModel')}
                </IAIButton>
              </VStack>
            </form>
          )}
        </Formik>
      </Flex>
    </Flex>
  ) : (
    <Flex
      width="100%"
      justifyContent="center"
      alignItems="center"
      backgroundColor="var(--background-color)"
      borderRadius="0.5rem"
    >
      <Text fontWeight="bold" color="var(--subtext-color-bright)">
        Pick A Model To Edit
      </Text>
    </Flex>
  );
}
