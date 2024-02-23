module.exports = async () => {
  if (global.__MONGO_INSTANCE) {
    await global.__MONGO_INSTANCE.stop();
  }
};
