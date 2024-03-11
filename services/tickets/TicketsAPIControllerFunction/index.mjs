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

function buildTicketObject({ name, eventId }) {
  const errors = {};

  if (!isValidString(name) || name.length > 250) {
    errors.name = 'Name is required and must be less than 250 characters.';
  }

  if (!isValidUUID(eventId)) {
    errors.eventId = 'EventId must be a valid UUID.';
  }

  const hasErrors = Object.keys(errors).length > 0;

  if (hasErrors) {
    return { ticket: null, errors };
  }

  return {
    errors: null,
    ticket: {
      name,
      eventId,
      ticketId: uuidV4(),
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
    const database = client.db('tickets');
    const collection = database.collection('tickets');

    const key = `${httpMethod} ${resource}`;

    switch (key) {
      case 'POST /tickets': {
        const { ticket, errors } = buildTicketObject(JSON.parse(body));

        if (errors) {
          response = generateAPIResponse({ errors }, 400);
          break;
        }

        await collection.insertOne(ticket);
        response = generateAPIResponse({ ticketId: ticket.ticketId }, 201);
        break;
      }
      case 'GET /tickets/{ticketId}': {
        const ticketId = pathParameters.ticketId;

        if (!isValidUUID(ticketId)) {
          response = generateAPIResponse({ message: 'Invalid ticketId' }, 400);
        } else {
          const ticket = await collection.findOne({ ticketId });
          response = generateAPIResponse(
            ticket ?? { message: 'Ticket does not exist' },
            ticket ? 200 : 404
          );
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
