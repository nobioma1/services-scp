import { Flex, Text, useDisclosure } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { FaStar } from 'react-icons/fa6';

import feedbacksAPI from '../../api/feedbacks-api';
import envConfig from '../../config/env-config';
import NewReviewModal from './NewReviewModal';

const QUESTION_ID = envConfig.FEEDBACK_ID;

const Feedback = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { isLoading, data } = useQuery({
    queryKey: ['feedback', QUESTION_ID],
    queryFn: async () => {
      const res = await feedbacksAPI.get(`/feedbacks/${QUESTION_ID}`);
      return res.data;
    },
  });

  if (isLoading || !data) {
    return null;
  }

  return (
    <>
      <Flex
        onClick={onOpen}
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
      <NewReviewModal
        feedback={data.feedback}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
};

export default Feedback;
