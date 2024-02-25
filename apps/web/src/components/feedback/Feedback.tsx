import { Flex, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import envConfig from '../../config/env-config';
import { FaStar } from 'react-icons/fa6';

const Feedback = () => {
  const QUESTION_ID = envConfig.FEEDBACK_ID;

  const { isLoading, data } = useQuery({
    queryKey: ['feedback', QUESTION_ID],
    queryFn: async () => {
      const res = await axios.get(
        `${envConfig.FEEDBACKS_SERVICE_API_URL}/feedbacks/${QUESTION_ID}`
      );
      return res.data;
    },
  });

  if (isLoading || !data) {
    return null;
  }

  return (
    <Flex
      alignItems="center"
      position="fixed"
      bottom={-1}
      right={3}
      height="40px"
      bg="purple.400"
      borderTopRadius="md"
      py={1}
      px={3}
      cursor="pointer"
      _hover={{
        bottom: 0,
      }}
    >
      <Text color="white" fontWeight="semibold">
        Feedback ({data.cumRating})
      </Text>
      <FaStar color="var(--chakra-colors-yellow-300)" />
    </Flex>
  );
};

export default Feedback;
