import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Stack,
  Text,
  Flex,
  ScaleFade,
  ModalCloseButton,
  Spinner,
} from '@chakra-ui/react';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';

import { Event } from './events/EventItem';

interface ShareModalProps {
  onClose(): void;
  isOpen: boolean;
  event: Event;
}

const ShareModal = ({ isOpen, onClose, event }: ShareModalProps) => {
  const url = '';

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
        <ModalHeader>
          {event.name}
          <Text fontSize="sm" color="gray.600">
            Share event with your friends
          </Text>
        </ModalHeader>

        <ModalBody pb={6}>
          <ScaleFade initialScale={0.9} in={true}>
            <Stack spacing={3}>
              <Stack alignItems="center" spacing={3}>
                <IoIosCheckmarkCircleOutline size={50} color="green" />
                <Text fontSize="xl" fontWeight="bold">
                  Event URL
                </Text>
              </Stack>
              <Flex
                bg="gray.200"
                alignItems="center"
                height="50px"
                justifyContent="center"
                borderRadius="md"
              >
                {!url ? (
                  <Spinner />
                ) : (
                  <Text fontWeight="bold" fontSize="24px">
                    url
                  </Text>
                )}
              </Flex>
            </Stack>
          </ScaleFade>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ShareModal;
