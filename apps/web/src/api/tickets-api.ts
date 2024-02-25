import axios from 'axios';

import envConfig from '../config/env-config';

const ticketsAPI = axios.create({
  baseURL: envConfig.TICKETS_SERVICE_API_URL,
});

export default ticketsAPI;
