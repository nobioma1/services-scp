import { Button } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa6';

interface CreateEventButton {
  onClickNewEvent(): void;
}

export const CreateEventButton = ({ onClickNewEvent }: CreateEventButton) => {
  return (
    <Button
      px={10}
      colorScheme="purple"
      height="100%"
      rightIcon={<FaPlus />}
      onClick={onClickNewEvent}
    >
      Create Event
    </Button>
  );
};
