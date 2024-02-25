import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Stack,
  Text,
  HStack,
} from '@chakra-ui/react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaStar } from 'react-icons/fa6';

import feedbacksAPI from '../../api/feedbacks-api';
import TextAreaInput from '../TextareaInput';

interface NewReviewModalProps {
  feedback: { feedbackId: string; question: string };
  isOpen: boolean;
  onClose(): void;
}

interface FormValues {
  rating: number;
  comment: string;
}

const reviewSchema = Yup.object().shape({
  rating: Yup.number().required(),
  comment: Yup.string(),
});

const NewReviewModal = ({ isOpen, onClose, feedback }: NewReviewModalProps) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feedback', feedback.feedbackId],
      });
      queryClient.invalidateQueries({
        queryKey: ['feedback-comments', feedback.feedbackId],
      });
      onClose();
    },
    mutationFn: (values: FormValues) => {
      return feedbacksAPI.post(`/feedbacks/${feedback.feedbackId}`, values);
    },
  });

  const { handleSubmit, handleChange, handleBlur, values, ...formik } =
    useFormik({
      initialValues: {
        rating: 5,
        comment: '',
      },
      validationSchema: reviewSchema,
      onSubmit: async (values) => {
        try {
          await mutation.mutateAsync(values);
          formik.resetForm();
        } catch (error) {
          console.error(error);
        }
      },
    });

  return (
    <Modal
      size="sm"
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      closeOnEsc={false}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send a Feedback</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6}>
            <Stack spacing={3}>
              <Text fontStyle="italic" color="gray.700">
                {feedback.question}
              </Text>
              <HStack>
                {Array(5)
                  .fill(1)
                  .map((_, idx) => (
                    <FaStar
                      key={idx}
                      cursor="pointer"
                      size="22px"
                      onClick={() => {
                        formik.setFieldValue('rating', idx + 1);
                      }}
                      color={
                        values.rating < idx + 1
                          ? 'lightgray'
                          : 'var(--chakra-colors-yellow-400)'
                      }
                    />
                  ))}
              </HStack>
              <TextAreaInput
                name="comment"
                label="Comment (optional)"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.comment}
                errorText={
                  formik.touched.comment && formik.errors.comment
                    ? formik.errors.comment
                    : ''
                }
              />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button type="submit" colorScheme="purple">
              Send Feedback
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NewReviewModal;
