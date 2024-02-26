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
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import ticketsAPI from '../../api/tickets-api';
import { Event } from '../events/EventItem';
import Input from '../Input';

interface NewTicketModalProps {
  onClose(): void;
  isOpen: boolean;
  event: Event;
  finalRef?: React.MutableRefObject<null>;
}

interface FormValues {
  name: string;
}

const ticketSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
});

const NewTicketModal = ({
  isOpen,
  onClose,
  finalRef,
  event,
}: NewTicketModalProps) => {
  const initialRef = useRef(null);
  const queryClient = useQueryClient();
  const [referenceId, setReferenceId] = useState('');

  const mutation = useMutation({
    onSuccess: (ticket) => {
      setReferenceId(ticket.data.ticketId);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    mutationFn: (values: FormValues) => {
      return ticketsAPI.post(`/tickets`, {
        eventId: event.eventId,
        ...values,
      });
    },
  });

  const { handleSubmit, handleChange, handleBlur, values, ...formik } =
    useFormik({
      initialValues: {
        name: '',
      },
      validationSchema: ticketSchema,
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
        <ModalHeader>
          {event.name}
          <Text fontSize="sm" color="gray.600">
            Save your spot by registering and getting your ticket ID.
          </Text>
        </ModalHeader>

        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6}>
            <Stack spacing={3}>
              <Input
                label="Name"
                name="name"
                ref={initialRef}
                placeholder="eg. John Doe..."
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.name}
                errorText={
                  formik.touched.name && formik.errors.name
                    ? formik.errors.name
                    : ''
                }
              />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="purple"
              isLoading={mutation.status === 'pending'}
            >
              Get My Ticket
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NewTicketModal;
