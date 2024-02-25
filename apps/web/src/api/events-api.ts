import axios from 'axios';

import envConfig from '../config/env-config';

const eventsAPI = axios.create({
  baseURL: envConfig.EVENTS_SERVICE_API_URL,
});

export default eventsAPI;
