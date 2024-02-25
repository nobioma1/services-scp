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
} from '@chakra-ui/react';
import { useRef } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import eventsAPI from '../../api/events-api';
import TextAreaInput from '../TextareaInput';
import Input from '../Input';

interface NewEventModalProps {
  isOpen: boolean;
  onClose(): void;
  finalRef?: React.MutableRefObject<null>;
}

interface FormValues {
  name: string;
  description: string;
  address: string;
  date: string;
  hostName: string;
}

const eventSchema = Yup.object().shape({
  name: Yup.string()
    .max(50, 'Event name should not be more than 50 characters')
    .required('Event name is required'),
  description: Yup.string().max(
    500,
    'Description should not be more 255 characters.'
  ),
  address: Yup.string().required('Address is required'),
  date: Yup.date().required('Date is required'),
  hostName: Yup.string().required('Host name is required'),
});

const NewEventModal = ({ isOpen, onClose, finalRef }: NewEventModalProps) => {
  const initialRef = useRef(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose();
    },
    mutationFn: ({ address, ...newEvent }: FormValues) => {
      return eventsAPI.post(`/events`, {
        ...newEvent,
        date: new Date(values.date),
        location: {
          address,
        },
      });
    },
  });

  const { handleSubmit, handleChange, handleBlur, values, ...formik } =
    useFormik({
      initialValues: {
        name: '',
        description: '',
        address: '',
        hostName: '',
        date: dayjs(new Date()).format('YYYY-MM-DD'),
      },
      validationSchema: eventSchema,
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
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onClose}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a new event</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6}>
            <Stack spacing={3}>
              <Input
                label="Name"
                name="name"
                ref={initialRef}
                placeholder="eg. Disco Party..."
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.name}
                errorText={
                  formik.touched.name && formik.errors.name
                    ? formik.errors.name
                    : ''
                }
              />
              <TextAreaInput
                name="description"
                label="Description"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.description}
                errorText={
                  formik.touched.description && formik.errors.description
                    ? formik.errors.description
                    : ''
                }
              />
              <Input
                name="address"
                label="Address"
                placeholder="eg. 28 Dancing Avenue, West Lon..."
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.address}
                errorText={
                  formik.touched.address && formik.errors.address
                    ? formik.errors.address
                    : ''
                }
              />
              <Input
                name="hostName"
                label="Host Name"
                placeholder="eg. Johnny Bravo..."
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.hostName}
                errorText={
                  formik.touched.hostName && formik.errors.hostName
                    ? formik.errors.hostName
                    : ''
                }
              />
              <Input
                name="date"
                label="Date"
                type="date"
                value={values.date}
                onChange={handleChange}
              />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="purple" type="submit">
              Create Event
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NewEventModal;
