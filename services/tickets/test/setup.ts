import { MongoMemoryServer } from 'mongodb-memory-server';

global.__MONGO_INSTANCE = null;

module.exports = async () => {
  global.__MONGO_INSTANCE = await MongoMemoryServer.create();
  process.env.MONGO_URI = global.__MONGO_INSTANCE.getUri();
  process.env.DB_NAME = 'ticket';
};
