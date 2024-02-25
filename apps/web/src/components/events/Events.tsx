import { Flex, HStack, Icon, Spinner, Stack, Text } from '@chakra-ui/react';
import { FaGlobeEurope } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

import envConfig from '../../config/env-config';
import Search from '../Search';
import { CreateEventButton } from './CreateEventButton';
import EventsList from './EventsList';
import { Event } from './EventItem';

const Events = () => {
  const [searchText, setSearchText] = useState('');

  const { isLoading, data: events = [] } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await axios.get(`${envConfig.EVENTS_SERVICE_API_URL}/events`);
      return res.data;
    },
  });

  const filteredEvents: Event[] = events.filter((event) =>
    event.name.includes(searchText)
  );

  return (
    <Stack spacing={5}>
      <Stack spacing={6}>
        <HStack spacing={6} height="50px">
          <Search handleChange={setSearchText} />
          <CreateEventButton />
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
  );
};

export default Events;
