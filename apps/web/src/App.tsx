import { ChakraProvider, Divider, Stack, extendTheme } from '@chakra-ui/react';

import Header from './components/header/Header';
import Feedback from './components/feedback/Feedback';
import Reviews from './components/feedback/Reviews';
import Events from './components/events/Events';

const theme = extendTheme({
  styles: {
    global: {
      'html, body, #root': {
        height: '100%',
        bg: 'var(--chakra-colors-gray-50)',
      },
    },
  },
});

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <Header />
      <Stack
        spacing={8}
        pt={4}
        width="100%"
        maxW="980px"
        margin="0 auto"
        px={{ base: 2, lg: 0 }}
      >
        <Events />
        <Divider />
        <Reviews />
      </Stack>
      <Feedback />
    </ChakraProvider>
  );
};

export default App;
