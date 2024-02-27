const env = import.meta.env;

const envConfig = {
  EVENTS_SERVICE_API_URL: `${env.VITE_EVENTS_SERVICE_DOMAIN}/api/v1`,
  TICKETS_SERVICE_API_URL: `${env.VITE_TICKETS_SERVICE_DOMAIN}/api/v1`,
  FEEDBACKS_SERVICE_API_URL: `${env.VITE_FEEDBACKS_SERVICE_DOMAIN}/api/v1`,
  URL_SHORTENER_SERVICE_API_URL: env.VITE_URL_SHORTENER_SERVICE_URL,
  FEEDBACK_ID: 'cb878e0c-9a53-4820-bcfe-1ce0415a9d54',
};

export default envConfig;
