export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 8003,
  MONGO_URI: process.env.MONGO_URI,
  DB_NAME: process.env.DB_NAME,
  SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,
  AWS_REGION: process.env.AWS_REGION,
});
