import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { FaShare } from 'react-icons/fa6';
import { MdOutlineLocationOn } from 'react-icons/md';

import ShareModal from '../ShareModal';

export interface Event {
  id: string;
  eventId: string;
  name: string;
  description: string;
  location: {
    address: string;
  };
  createdBy: string;
  date: Date;
}

const EventItem = ({
  setEvent,
  ...event
}: Event & { setEvent(event: Event): void }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { name, description, location, date } = event;

  const eventDate = dayjs(new Date(date));

  const handleGetTicketClick = () => {
    setEvent(event);
  };

  return (
    <>
      <Stack
        p={3}
        bg="white"
        spacing={3}
        borderRadius="md"
        height="220px"
        boxShadow="sm"
        cursor="pointer"
        borderWidth={1}
        borderColor="white"
        _hover={{
          borderColor: 'purple.200',
        }}
      >
        <HStack spacing={6}>
          <Flex
            bg="gray.100"
            direction="column"
            alignItems="center"
            justifyContent="center"
            borderRadius="md"
            width="60px"
            height="60px"
            px={3}
          >
            <Text fontWeight="bold" color="gray.600">
              {eventDate.format('MMM').toUpperCase()}
            </Text>
            <Text fontWeight="bold" color="gray.600">
              {eventDate.format('D')}
            </Text>
          </Flex>
          <Box>
            <Text fontWeight="semibold" color="gray.700" noOfLines={1} mb={1}>
              {name}
            </Text>
            <Flex alignItems="center">
              <MdOutlineLocationOn color="var(--chakra-colors-gray-600)" />
              <Text
                ml={2}
                fontWeight={300}
                fontSize="14px"
                color="gray.600"
                noOfLines={1}
              >
                {location.address}
              </Text>
            </Flex>
          </Box>
        </HStack>
        <Box flex={1}>
          <Text color="gray.700" noOfLines={3}>
            {description}
          </Text>
        </Box>
        <Flex justifyContent="space-between" alignItems="center">
          <Tooltip label="Share link" aria-label="Share link">
            <IconButton
              onClick={onOpen}
              variant="ghost"
              icon={<FaShare />}
              aria-label="share"
            />
          </Tooltip>

          <Button
            size="sm"
            colorScheme="purple"
            variant="outline"
            onClick={handleGetTicketClick}
          >
            Get Ticket
          </Button>
        </Flex>
      </Stack>
      <ShareModal event={event} isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default EventItem;
