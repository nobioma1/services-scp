import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

import appConfig from '../src/config/app-config';
import { AppModule } from '../src/app.module';

describe('EventsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appConfig(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('(GET) /api/v1/tickets/123 - Should return 404 for invalid ticket Id', () => {
    return request(app.getHttpServer()).get('/api/v1/ticket/12345').expect(404);
  });

  it('(POST) /api/v1/tickets - Should create a new ticket for an event', () => {
    return request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send({ name: 'Test user', eventId: uuidv4() })
      .expect(201);
  });

  it('(POST) /api/v1/tickets - validate ticket creation', () => {
    return request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send({ invalid: '' })
      .expect(400);
  });

  it('(GET) /api/v1/tickets/:ticketId - Should get ticket by Id', async () => {
    const ticketRes = await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send({ name: 'Test user', eventId: uuidv4() });

    return request(app.getHttpServer())
      .get(`/api/v1/tickets/${ticketRes.body.ticketId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.ticketId).toEqual(ticketRes.body.ticketId);
      });
  });
});
