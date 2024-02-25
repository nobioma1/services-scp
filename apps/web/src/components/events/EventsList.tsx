import { Stack, Text } from '@chakra-ui/react';

import EventItem, { Event } from './EventItem';

interface EventsListProps {
  events: Event[];
}

const EventsList = ({ events }: EventsListProps) => {
  return (
    <Stack spacing={4} width="100%">
      {events.length === 0 ? (
        <Text textAlign="center">No Event found</Text>
      ) : (
        events.map((event) => <EventItem key={event.id} {...event} />)
      )}
    </Stack>
  );
};

export default EventsList;
