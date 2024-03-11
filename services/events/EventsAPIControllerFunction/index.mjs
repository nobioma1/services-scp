import { MongoClient } from 'mongodb';
import { validate as isValidUUID, v4 as uuidV4 } from 'uuid';

function generateAPIResponse(data, statusCode = 200) {
  const response = {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  return response;
}

function isValidString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function buildEventObject({ name, description, address, date, hostName }) {
  const errors = {};

  if (!isValidString(name) || name.length > 250) {
    errors.name = 'Name is required and must be less than 250 characters.';
  }

  if (
    description !== undefined &&
    (typeof description !== 'string' || description.length > 500)
  ) {
    errors.description = 'Description must be less than 500 characters.';
  }

  if (!isValidString(address)) {
    errors.address = 'Address must be a non-empty string.';
  }

  if (!isValidString(hostName)) {
    errors.hostName = 'HostName is required.';
  }

  if (date !== undefined && isNaN(Date.parse(date))) {
    errors.date = 'Date must be a valid date string.';
  }

  const hasErrors = Object.keys(errors).length > 0;

  if (hasErrors) {
    return { event: null, errors };
  }

  return {
    errors: null,
    event: {
      name,
      date: date ?? new Date(),
      description,
      location: {
        address,
      },
      eventId: uuidV4(),
      createdBy: hostName,
      createdAt: new Date(),
    },
  };
}

export async function handler(event) {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  let response;

  try {
    const { resource, httpMethod, pathParameters, body } = event;

    await client.connect();
    const database = client.db('events');
    const collection = database.collection('events');

    const key = `${httpMethod} ${resource}`;

    switch (key) {
      case 'GET /events': {
        const eventsCursor = collection.find({}).sort({ createdAt: -1 });
        response = generateAPIResponse(await eventsCursor.toArray());

        break;
      }
      case 'POST /events': {
        const { event, errors } = buildEventObject(JSON.parse(body));

        if (errors) {
          response = generateAPIResponse({ errors }, 400);
          break;
        }

        await collection.insertOne(event);
        response = generateAPIResponse({ eventId: event.eventId }, 201);
        break;
      }
      case 'GET /events/{eventId}': {
        const eventId = pathParameters.eventId;
        if (!isValidUUID(eventId)) {
          response = generateAPIResponse({ message: 'Invalid eventId' }, 400);
        } else {
          response = generateAPIResponse(await collection.findOne({ eventId }));
        }
        break;
      }
      default:
        response = generateAPIResponse({ message: 'Route not Found' }, 400);
    }

    return response;
  } catch (err) {
    console.error('API ERROR', err);
    return generateAPIResponse({ message: 'Something went wrong' }, 500);
  } finally {
    await client.close();
  }
}
