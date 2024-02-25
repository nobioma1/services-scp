import { Button } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa6';

export const CreateEventButton = () => {
  return (
    <Button colorScheme="purple" height="100%" px={10} rightIcon={<FaPlus />}>
      Create Event
    </Button>
  );
};
