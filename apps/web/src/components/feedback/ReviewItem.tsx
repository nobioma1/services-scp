import dayjs from 'dayjs';
import { HStack, Stack, Text } from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';

export interface Review {
  id: string;
  feedback: string;
  comment: string;
  rating: number;
  createdAt: Date;
}

const ReviewItem = (review: Review) => {
  return (
    <Stack bg="white" p={3} borderRadius="md">
      <Text color="gray.700" fontSize="14px">
        {review.comment}
      </Text>
      <HStack>
        {Array(5)
          .fill(1)
          .map((_, idx) => (
            <FaStar
              key={idx}
              color={
                review.rating < idx + 1
                  ? 'lightgray'
                  : 'var(--chakra-colors-yellow-400)'
              }
            />
          ))}
      </HStack>
      <Text as="small">
        {dayjs(new Date(review.createdAt)).format('DD MMMM YYYY')}
      </Text>
    </Stack>
  );
};

export default ReviewItem;
