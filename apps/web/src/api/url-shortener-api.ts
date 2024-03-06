import axios from 'axios';

import envConfig from '../config/env-config';

const urlShortenerAPI = axios.create({
  baseURL: envConfig.URL_SHORTENER_SERVICE_API_URL,
});

export const getShareURL = async (url: string) => {
  const res = await urlShortenerAPI.post('/shortLink', { URL: url });
  return res.data;
};

export default urlShortenerAPI;
