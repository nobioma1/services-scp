import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import appConfig from '../src/config/app-config';
import { AppModule } from '../src/app.module';
import { SQSService } from '../src/common/sqs/sqs.service';

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
    const TEST_QUESTION =
      'On a scale of 1-10, how likely are you to recommend this to to someone you know?';

    return request(app.getHttpServer())
      .post('/api/v1/feedbacks')
      .send({ question: TEST_QUESTION })
      .expect(201)
      .expect((res) => {
        expect(res.body.question).toEqual(TEST_QUESTION);
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
    const TEST_QUESTION = 'How much do you like test?';
    const TEST_COMMENT = 'Very well';

    const req = request(app.getHttpServer());
    const feedbackRes = await req
      .post('/api/v1/feedbacks')
      .send({ question: TEST_QUESTION });

    return req
      .post(`/api/v1/feedbacks/${feedbackRes.body.feedbackId}`)
      .send({ comment: TEST_COMMENT, rating: 4 })
      .expect(201)
      .expect((res) => {
        expect(res.body.rating).toEqual(4);
        expect(res.body.comment).toEqual(TEST_COMMENT);
        expect(res.body.feedbackId).toEqual(feedbackRes.body.feedbackId);
      });
  });

  it('(POST) /api/v1/feedbacks/:feedbackId - record feedback only rating', async () => {
    const TEST_QUESTION = 'How much do you like code?';

    const req = request(app.getHttpServer());
    const feedbackRes = await req
      .post('/api/v1/feedbacks')
      .send({ question: TEST_QUESTION });

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
          id: expect.any(String),
          questionId: feedbackRes.body.feedbackId,
          timestamp: expect.any(Number),
        });
      });
  });

  it('(POST) /api/v1/feedbacks/:feedbackId - validate feedback', async () => {
    const TEST_QUESTION = 'How much do you like food?';

    const req = request(app.getHttpServer());
    const feedbackRes = await req
      .post('/api/v1/feedbacks')
      .send({ question: TEST_QUESTION });

    return req
      .post(`/api/v1/feedbacks/${feedbackRes.body.feedbackId}`)
      .send({ rating: 100 })
      .expect(400);
  });

  it('(GET) /api/v1/feedbacks/:feedbackId - get feedback summary', async () => {
    const TEST_QUESTION = 'Rate question?';

    const req = request(app.getHttpServer());
    const fbRes = await req
      .post('/api/v1/feedbacks')
      .send({ question: TEST_QUESTION });

    return req
      .get(`/api/v1/feedbacks/${fbRes.body.feedbackId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.feedback.feedbackId).toEqual(fbRes.body.feedbackId);
        expect(res.body.feedback.question).toEqual(TEST_QUESTION);
        expect(res.body.cumRating).toBeDefined();
        expect(res.body.numberOfFeedbacks).toBeDefined();
        expect(res.body.rating).toBeDefined();
      });
  });

  it('(GET) /api/v1/feedbacks/:feedbackId/comments - get feedback comments', async () => {
    const TEST_QUESTION = 'comment question?';

    const req = request(app.getHttpServer());
    const feedbackRes = await req
      .post('/api/v1/feedbacks')
      .send({ question: TEST_QUESTION });

    const rates = [1, 2, 5, 5, 2, 4, 1, 4];
    await Promise.all(
      rates.map((rate, idx) =>
        req.post(`/api/v1/feedbacks/${feedbackRes.body.feedbackId}`).send({
          rating: rate,
          comment:
            rate % 2 === 0 ? `${idx + 1}. comment res-${rate} ` : undefined,
        }),
      ),
    );

    return req
      .get(`/api/v1/feedbacks/${feedbackRes.body.feedbackId}/comments`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(4);
      });
  });
});
