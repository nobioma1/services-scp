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
import { useEffect, useState } from 'react';

import eventsAPI from '../../api/events-api';
import Search from '../Search';
import EventsList from './EventsList';
import { Event } from './EventItem';
import NewEventModal from './NewEventModal';
import { CreateEventButton } from './CreateEventButton';
import NewTicketModal from '../tickets/NewTicketModal';

const updateUrlParam = (key: string, value: string) => {
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  window.history.pushState({ path: url.href }, '', url.href);
};

const readUrlParam = (key: string) => {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
};

const Events = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { isOpen, onClose, onOpen } = useDisclosure();

  const handleSearchTextChange = (val: string) => {
    if (searchText !== val) {
      setSearchText(val);
      updateUrlParam('search', val);
    }
  };

  useEffect(() => {
    const value = readUrlParam('search');
    if (value) setSearchText(value);
  }, []);

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
            <Search handleChange={handleSearchTextChange} />
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
            <EventsList events={filteredEvents} setEvent={setSelectedEvent} />
          )}
        </Flex>
      </Stack>

      <NewEventModal isOpen={isOpen} onClose={onClose} />

      {selectedEvent && (
        <NewTicketModal
          isOpen
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
};

export default Events;
