import {
  Flex,
  HStack,
  Icon,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { FaGlobeEurope } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import eventsAPI from '../../api/events-api';
import Search from '../Search';
import EventsList from './EventsList';
import { Event } from './EventItem';
import NewEventModal from './NewEventModal';
import { CreateEventButton } from './CreateEventButton';

const Events = () => {
  const [searchText, setSearchText] = useState('');
  const { isOpen, onClose, onOpen } = useDisclosure();

  const { isLoading, data: events = [] } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await eventsAPI.get('/events');
      return res.data;
    },
  });

  const filteredEvents: Event[] = events.filter((event) =>
    event.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <Stack spacing={5}>
        <Stack spacing={6}>
          <HStack spacing={6} height="50px">
            <Search handleChange={setSearchText} />
            <CreateEventButton onClickNewEvent={onOpen} />
          </HStack>
          <HStack
            borderRadius="full"
            color="purple.700"
            fontWeight="semibold"
            bg="purple.100"
            paddingY={3}
            paddingX={5}
            spacing={3}
            width="fit-content"
            cursor="pointer"
            _hover={{
              bg: 'purple.200',
            }}
          >
            <Icon as={FaGlobeEurope} aria-label="globe" />
            <Text>Public Events</Text>
          </HStack>
        </Stack>
        <Flex
          width="100%"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
        >
          {isLoading ? (
            <Spinner color="purple.500" />
          ) : (
            <EventsList events={filteredEvents} />
          )}
        </Flex>
      </Stack>
      <NewEventModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default Events;
