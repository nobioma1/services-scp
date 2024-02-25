import { Stack } from '@chakra-ui/react';

import EventItem, { Event } from './EventItem';

interface EventsListProps {
  events: Event[];
}

const EventsList = ({ events }: EventsListProps) => {
  return (
    <Stack spacing={4}>
      {events.map((event) => (
        <EventItem key={event.id} {...event} />
      ))}
    </Stack>
  );
};

export default EventsList;
