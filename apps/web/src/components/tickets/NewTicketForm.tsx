import {
  ModalHeader,
  ModalBody,
  Stack,
  ModalFooter,
  Button,
  Text,
} from '@chakra-ui/react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import ticketsAPI from '../../api/tickets-api';
import { Event } from '../events/EventItem';
import Input from '../Input';

interface FormValues {
  name: string;
}

interface NewTicketFormProps {
  event: Event;
  onClose(): void;
  onSuccess(ticketId: string): void;
}

const ticketSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
});

const NewTicketForm = ({ event, onClose, onSuccess }: NewTicketFormProps) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    onSuccess: (ticket) => {
      onSuccess(ticket.data.ticketId);
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
    <>
      <ModalHeader>
        {event.name}
        <Text fontSize="sm" color="gray.600">
          Save your spot by registering and getting your ticket ID.
        </Text>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody pb={6}>
          <Stack spacing={3}>
            <Input
              label="Name"
              name="name"
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
    </>
  );
};

export default NewTicketForm;
