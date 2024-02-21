import { MongoMemoryServer } from 'mongodb-memory-server';

global.__MONGO_INSTANCE = null;

module.exports = async () => {
  global.__MONGO_INSTANCE = await MongoMemoryServer.create();
  process.env.MONGO_URI = global.__MONGO_INSTANCE.getUri();
  process.env.DB_NAME = 'feedbacks';
  process.env.SQS_QUEUE_URL = 'https://test-sqs-url';
  process.env.AWS_REGION = 'ng-test-1';
};
