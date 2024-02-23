import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import appConfig from '../src/config/app-config';
import { AppModule } from '../src/app.module';

const TEST_DATA = {
  name: 'Test Event Name',
  description: 'This is test',
  date: new Date().toISOString(),
  createdBy: 'Test User',
  location: {
    address: '127.0.0.1',
    state: 'Lagos',
    country: 'Nigeria',
  },
};

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

  it('(GET) /api/v1/events/123 - Should return 404 for invalid event Id', () => {
    return request(app.getHttpServer()).get('/api/v1/events/12345').expect(404);
  });

  it('(POST) /api/v1/events - Should create a new event', () => {
    return request(app.getHttpServer())
      .post('/api/v1/events')
      .send(TEST_DATA)
      .expect(201);
  });

  it('(POST) /api/v1/events - validate event creation', () => {
    return request(app.getHttpServer())
      .post('/api/v1/events')
      .send({ invalid: '' })
      .expect(400);
  });

  it('(GET) /api/v1/events/ - should get all events', async () => {
    const req = request(app.getHttpServer());

    const count = [1, 2, 3, 4, 5];
    await Promise.all(
      count.map((num) =>
        req.post(`/api/v1/events`).send({
          ...TEST_DATA,
          name: `TEST_DATA.name  ${num}`,
        }),
      ),
    );

    return req
      .get(`/api/v1/events`)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThanOrEqual(count.length);
      });
  });
});
