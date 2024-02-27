import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  Text,
  Flex,
  ScaleFade,
} from '@chakra-ui/react';
import { useState } from 'react';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';

import { Event } from '../events/EventItem';
import NewTicketForm from './NewTicketForm';

interface NewTicketModalProps {
  onClose(): void;
  isOpen: boolean;
  event: Event;
  finalRef?: React.MutableRefObject<null>;
}

interface NewTicketSuccessProps {
  event: Event;
  referenceId: string;
}

const NewTicketSuccess = ({ event, referenceId }: NewTicketSuccessProps) => {
  return (
    <>
      <ModalHeader>
        {event.name}
        <Text fontSize="sm" color="gray.600">
          Save your ticket ID.
        </Text>
      </ModalHeader>

      <ModalBody pb={6}>
        <ScaleFade initialScale={0.9} in={true}>
          <Stack spacing={3}>
            <Stack alignItems="center" spacing={3}>
              <IoIosCheckmarkCircleOutline size={150} color="green" />
              <Text fontSize="xl" fontWeight="bold">
                Ticket Order Complete
              </Text>
              <Text fontSize="md" fontWeight="bold">
                Please save your ticket ID
              </Text>
            </Stack>
            <Flex
              bg="gray.200"
              alignItems="center"
              height="50px"
              justifyContent="center"
              borderRadius="md"
            >
              <Text fontWeight="bold" fontSize="24px">
                {referenceId}
              </Text>
            </Flex>
          </Stack>
        </ScaleFade>
      </ModalBody>
    </>
  );
};

const NewTicketModal = ({ isOpen, onClose, event }: NewTicketModalProps) => {
  const [referenceId, setReferenceId] = useState('');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        {!referenceId && (
          <NewTicketForm
            event={event}
            onClose={onClose}
            onSuccess={setReferenceId}
          />
        )}

        {referenceId && (
          <NewTicketSuccess
            event={event}
            referenceId={referenceId
              .split('-')
              .slice(0, 2)
              .join('-')
              .toUpperCase()}
          />
        )}
      </ModalContent>
    </Modal>
  );
};

export default NewTicketModal;
