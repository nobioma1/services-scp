import axios from 'axios';

import envConfig from '../config/env-config';

const feedbacksAPI = axios.create({
  baseURL: envConfig.FEEDBACKS_SERVICE_API_URL,
});

export default feedbacksAPI;
