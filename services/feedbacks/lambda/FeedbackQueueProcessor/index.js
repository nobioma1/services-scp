import MongoClient from 'mongodb';

exports.handler = async (event) => {
  const uri = process.env.MONGODB_URL;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const database = client.db('feedbacks');
    const collection = database.collection('feedbacks');

    const message = JSON.parse(event.Records[0].body);

    if (message.rating >= 1 && message.rating <= 5) {
      const ratingField = `rating.${message.rating}`;

      const result = await collection.updateOne(
        { _id: message.id },
        {
          $inc: {
            numberOfFeedbacks: 1,
            [ratingField]: 1,
          },
        },
      );
      console.log('Document updated', result);
    } else {
      console.log('Rating value is out of expected range (1-5)');
    }
  } catch (err) {
    console.error('Error processing message', err);
  } finally {
    await client.close();
  }
};
