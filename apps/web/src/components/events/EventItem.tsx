import {
  Box,
  Flex,
  HStack,
  IconButton,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { FaShare } from 'react-icons/fa6';
import dayjs from 'dayjs';
import { MdOutlineLocationOn } from 'react-icons/md';

export interface Event {
  id: string;
  name: string;
  date: Date;
}

const EventItem = () => {
  const date = dayjs(new Date());

  return (
    <Stack
      p={3}
      bg="white"
      spacing={3}
      borderRadius="md"
      height="220px"
      boxShadow="sm"
      cursor="pointer"
      borderWidth={1}
      borderColor="white"
      _hover={{
        borderColor: 'purple.200',
      }}
    >
      <HStack spacing={6}>
        <Flex
          bg="gray.100"
          direction="column"
          alignItems="center"
          justifyContent="center"
          borderRadius="md"
          width="60px"
          height="60px"
          px={3}
        >
          <Text fontWeight="bold" color="gray.600">
            {date.format('MMM').toUpperCase()}
          </Text>
          <Text fontWeight="bold" color="gray.600">
            {date.format('D')}
          </Text>
        </Flex>
        <Box>
          <Text fontWeight="semibold" color="gray.700" noOfLines={1} mb={1}>
            Title
          </Text>
          <Flex alignItems="center">
            <MdOutlineLocationOn color="var(--chakra-colors-gray-600)" />
            <Text
              ml={2}
              fontWeight={300}
              fontSize="14px"
              color="gray.600"
              noOfLines={1}
            >
              address
            </Text>
          </Flex>
        </Box>
      </HStack>
      <Box flex={1}>
        <Text color="gray.700" noOfLines={3}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eget arcu
          ut purus facilisis convallis. Sed at sagittis lorem. Maecenas pharetra
          lacinia efficitur. Pellentesque tempor nulla quis euismod
          sollicitudin. Donec efficitur augue id aliquet tempus. Morbi dignissim
          libero orci. Vivamus quis elementum sapien. Vestibulum pharetra
          porttitor magna. Donec vel ex vel tellus porta euismod ut vel arcu.
          Phasellus ultrices hendrerit quam, a pulvinar lacus efficitur quis.
          Praesent eget felis interdum, tincidunt mauris nec, fermentum tortor.
          Vivamus in purus fermentum, aliquet dui sed, pretium mauris. Ut auctor
          malesuada congue. Aliquam erat volutpat. Mauris tempus fringilla
          ipsum, et sodales est elementum id. Quisque non tempor justo. Mauris
          blandit eget metus eu volutpat. In vel lectus et mi vulputate varius
          ut at augue. In faucibus sodales libero, vel congue tellus lobortis
          eu. Praesent consectetur sem at diam dignissim viverra. Suspendisse
          potenti. Nullam iaculis nec est a iaculis. In sed quam malesuada,
          posuere elit in, sodales tortor. Aenean diam risus, lobortis in eros
          et, porttitor posuere turpis. Pellentesque ornare, ante quis varius
          laoreet, lectus lacus suscipit lorem, et sodales erat ipsum in mauris.
          Cras hendrerit tortor sollicitudin, volutpat orci ac, sodales metus.
          Nam fermentum facilisis diam. Pellentesque volutpat nunc quis magna
          placerat, in tristique ligula molestie. Praesent ultrices luctus
          ultrices. Sed eget tellus in tellus iaculis auctor a id metus.
          Praesent eu ligula fermentum, sollicitudin orci at, lobortis justo.
          Donec at orci tincidunt, pharetra neque nec, dictum ante. Vestibulum
          at tincidunt ante. Nulla fringilla felis viverra ex bibendum, id
          sodales lectus vestibulum. Donec gravida est a ligula interdum, ac.
        </Text>
      </Box>
      <Flex justifyContent="flex-end">
        <Tooltip label="Copy link" aria-label="Copy link">
          <IconButton variant="ghost" icon={<FaShare />} aria-label="share" />
        </Tooltip>
      </Flex>
    </Stack>
  );
};

export default EventItem;
