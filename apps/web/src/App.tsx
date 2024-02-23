import { ChakraProvider, Divider, Stack, extendTheme } from '@chakra-ui/react';

import Header from './components/header/Header';
import EventsList from './components/events/EventsList';
import Feedback from './components/feedback/Feedback';
import Reviews from './components/feedback/Reviews';

const theme = extendTheme({
  styles: {
    global: {
      'html, body, #root': {
        height: '100%',
      },
    },
  },
});

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <Header />
      <Stack
        pt={4}
        width="100%"
        maxW="980px"
        margin="0 auto"
        spacing={4}
        px={{ base: 2, lg: 0 }}
      >
        <EventsList />
        <Divider />
        <Reviews />
      </Stack>
      <Feedback />
    </ChakraProvider>
  );
};

export default App;
