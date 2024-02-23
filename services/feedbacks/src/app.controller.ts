import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Get, Controller, Render } from '@nestjs/common';

import { FeedbacksService } from './feedbacks/feedbacks.service';

@Controller()
export class AppController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @ApiExcludeEndpoint()
  @Get()
  @Render('index')
  async root() {
    const QUESTION_ID = '8d445052-5ab9-4628-8fb1-cf7e4111af87';

    try {
      const feedbackQuestion =
        await this.feedbacksService.getQuestion(QUESTION_ID);
      const [comments, ratings] = await Promise.all([
        this.feedbacksService.getComments(feedbackQuestion),
        this.feedbacksService.getFeedbacksRatings(
          QUESTION_ID,
          feedbackQuestion.ratings,
        ),
      ]);

      return {
        question: feedbackQuestion.question,
        questionId: feedbackQuestion.questionId,
        cumRating: ratings.cumRating,
        comments: comments.slice(0, 10),
      };
    } catch (error) {
      console.error('Something went wrong');
      return {};
    }
  }
}
