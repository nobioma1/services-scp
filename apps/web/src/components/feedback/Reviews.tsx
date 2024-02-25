import { Box, Stack, Text, Wrap, WrapItem } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

import feedbacksAPI from '../../api/feedbacks-api';
import envConfig from '../../config/env-config';
import ReviewItem, { Review } from './ReviewItem';

const Reviews = () => {
  const QUESTION_ID = envConfig.FEEDBACK_ID;

  const { isLoading, data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['feedbacks-comments', QUESTION_ID],
    queryFn: async () => {
      const res = await feedbacksAPI.get(`/feedbacks/${QUESTION_ID}/comments`);
      return res.data;
    },
  });

  if (isLoading || reviews.length === 0) {
    return null;
  }

  return (
    <Stack spacing="20px">
      <Text fontSize="20px" fontWeight={600} color="gray.700">
        See what others think of our product
      </Text>
      <Wrap spacing="20px">
        {reviews.map((review) => (
          <WrapItem>
            <Box width="320px">
              <ReviewItem key={review.id} {...review} />
            </Box>
          </WrapItem>
        ))}
      </Wrap>
    </Stack>
  );
};

export default Reviews;
