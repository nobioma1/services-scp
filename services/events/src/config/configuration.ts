export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 8003,
  MONGO_URI: process.env.MONGO_URI,
});
