import { MongoClient, ObjectId } from 'mongodb';

export async function handler(event) {
  const uri = process.env.MONGODB_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('feedbacks');
    const collection = database.collection('feedbacks');

    // Aggregate batched ratings by ID
    const aggResultByCollectionId = event.Records.reduce((acc, record) => {
      const message = JSON.parse(record.body);
      if (message.rating >= 1 && message.rating <= 5) {
        if (!acc[message.id]) {
          acc[message.id] = {
            numberOfFeedbacks: 0,
            ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          };
        }
        acc[message.id].ratings[message.rating] += 1;
        acc[message.id].numberOfFeedbacks += 1;
      }
      return acc;
    }, {});

    const aggResultByCollectionIdArr = Object.entries(aggResultByCollectionId);

    if (aggResultByCollectionIdArr.length > 0) {
      // Bulk write to DB
      const result = await collection.bulkWrite(
        aggResultByCollectionIdArr.map(([id, obj]) => ({
          updateOne: {
            filter: { _id: new ObjectId(id) },
            update: {
              $inc: {
                numberOfFeedbacks: obj.numberOfFeedbacks,
                ...Object.keys(obj.ratings).reduce((acc, rate) => {
                  acc[`ratings.${rate}`] = obj.ratings[rate];
                  return acc;
                }, {}),
              },
            },
          },
        })),
      );
      console.log('Documents updated', result);
    }
  } catch (err) {
    console.error('Error processing message', err);
  } finally {
    await client.close();
  }
}
