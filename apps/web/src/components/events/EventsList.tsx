import { Stack, Text } from '@chakra-ui/react';

import EventItem, { Event } from './EventItem';

interface EventsListProps {
  events: Event[];
  setEvent(event: Event): void;
}

const EventsList = ({ events, setEvent }: EventsListProps) => {
  return (
    <Stack spacing={4} width="100%">
      {events.length === 0 ? (
        <Text textAlign="center">No Event found</Text>
      ) : (
        events.map((event) => (
          <EventItem key={event.id} {...event} setEvent={setEvent} />
        ))
      )}
    </Stack>
  );
};

export default EventsList;
