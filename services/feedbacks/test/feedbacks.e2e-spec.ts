import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import appConfig from '../src/config/app-config';
import { AppModule } from '../src/app.module';
import { SQSService } from '../src/common/sqs/sqs.service';

const TEST_DATA = {
  question:
    'On a scale of 1-10, how likely are you to recommend this to to someone you know?',
  comment: 'This is a test comment',
};

describe('FeedbacksController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SQSService)
      .useValue({
        sendMessage: jest.fn().mockResolvedValue({
          MessageId: 'sqs-message-id',
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    appConfig(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('(GET) /api/v1/feedbacks/123 - Should return 404 for invalid feedback Id', () => {
    return request(app.getHttpServer())
      .get('/api/v1/feedbacks/12345')
      .expect(404);
  });

  it('(POST) /api/v1/feedbacks - Should register question', () => {
    return request(app.getHttpServer())
      .post('/api/v1/feedbacks')
      .send({ question: TEST_DATA.question })
      .expect(201)
      .expect((res) => {
        expect(res.body.question).toEqual(TEST_DATA.question);
        expect(res.body.feedbackId).toEqual(expect.any(String));
      });
  });

  it('(POST) /api/v1/feedbacks - validate register question', () => {
    return request(app.getHttpServer())
      .post('/api/v1/feedbacks')
      .send({ question: '' })
      .expect(400);
  });

  it('(POST) /api/v1/feedbacks/:feedbackId - record feedback', async () => {
    const req = request(app.getHttpServer());
    const feedbackRes = await req
      .post('/api/v1/feedbacks')
      .send({ question: TEST_DATA.question });

    return req
      .post(`/api/v1/feedbacks/${feedbackRes.body.feedbackId}`)
      .send({ comment: TEST_DATA.comment, rating: 4 })
      .expect(201)
      .expect((res) => {
        expect(res.body.rating).toEqual(4);
        expect(res.body.comment).toEqual(TEST_DATA.comment);
        expect(res.body.feedbackId).toEqual(feedbackRes.body.feedbackId);
      });
  });

  it('(POST) /api/v1/feedbacks/:feedbackId - record feedback only rating', async () => {
    const req = request(app.getHttpServer());
    const feedbackRes = await req
      .post('/api/v1/feedbacks')
      .send({ question: TEST_DATA.question });

    return req
      .post(`/api/v1/feedbacks/${feedbackRes.body.feedbackId}`)
      .send({ rating: 3 })
      .expect(201)
      .expect((res) => {
        expect(res.body.rating).toEqual(3);
        expect(res.body.feedbackId).toEqual(feedbackRes.body.feedbackId);
      })
      .then(() => {
        const sqsService = app.get(SQSService);
        expect(sqsService.sendMessage).toHaveBeenCalledWith({
          rating: 3,
          feedbackId: feedbackRes.body.feedbackId,
        });
      });
  });

  it('(POST) /api/v1/feedbacks/:feedbackId - validate feedback', async () => {
    const req = request(app.getHttpServer());
    const feedbackRes = await req
      .post('/api/v1/feedbacks')
      .send({ question: TEST_DATA.question });

    return req
      .post(`/api/v1/feedbacks/${feedbackRes.body.feedbackId}`)
      .send({ rating: 100 })
      .expect(400);
  });

  it('(GET) /api/v1/feedbacks/:feedbackId - get feedback summary', async () => {
    const req = request(app.getHttpServer());
    const feedbackRes = await req
      .post('/api/v1/feedbacks')
      .send({ question: TEST_DATA.question });

    return req
      .get(`/api/v1/feedbacks/${feedbackRes.body.feedbackId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.feedbackId).toEqual(feedbackRes.body.feedbackId);
        expect(res.body.cummRating).toBeDefined();
        expect(res.body.numberOfFeedbacks).toBeDefined();
        expect(res.body.rating).toBeDefined();
      });
  });

  it('(GET) /api/v1/feedbacks/:feedbackId/comments - get feedback comments', async () => {
    const req = request(app.getHttpServer());
    const feedbackRes = await req
      .post('/api/v1/feedbacks')
      .send({ question: TEST_DATA.question });

    const rates = [1, 2, 5, 5, 2, 4, 1, 4];
    await Promise.all(
      rates.map((rate, idx) =>
        req.post(`/api/v1/feedbacks/${feedbackRes.body.feedbackId}`).send({
          rating: rate,
          comment:
            rate % 2 === 0
              ? `${idx + 1}. ${TEST_DATA.comment}-${rate} `
              : undefined,
        }),
      ),
    );

    return req
      .get(`/api/v1/feedbacks/${feedbackRes.body.feedbackId}/comments`)
      .expect(200)
      .expect((res) => {
        console.log(res.body);
      });
  });
});
