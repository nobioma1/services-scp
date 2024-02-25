import { Flex, Heading } from '@chakra-ui/react';

const Header = () => {
  return (
    <Flex
      width="100%"
      height="60px"
      alignItems="center"
      justifyContent="center"
      borderBottomWidth={1}
      bg="white"
      position="fixed"
      top={0}
      left={0}
      zIndex={999}
    >
      <Heading fontWeight="semibold" fontSize="xl" color="purple.600">
        Open Events
      </Heading>
    </Flex>
  );
};

export default Header;
