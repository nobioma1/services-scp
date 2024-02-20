import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { FeedbacksService } from './feedbacks.service';
import {
  CreateFeedbackDto,
  CreateQuestionDto,
} from './dto/create-question.dto';
import { IsQuestionGuard } from './guards/is-question.guard';
import { Question } from './decorators/question.decorator';
import { Feedback } from './schemas/feedback.schema';

@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  async registerQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    const { questionId, question } =
      await this.feedbacksService.createQuestion(createQuestionDto);

    return { feedbackId: questionId, question };
  }

  @UseGuards(IsQuestionGuard)
  @Post(':questionId')
  postFeedback(
    @Question() feedback: Feedback,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    return this.feedbacksService.createFeedback(feedback, createFeedbackDto);
  }

  @UseGuards(IsQuestionGuard)
  @Get(':questionId')
  getFeedbacksRatings(@Question() feedback: Feedback) {
    return this.feedbacksService.getFeedbacksRatings(feedback);
  }

  @UseGuards(IsQuestionGuard)
  @Get(':questionId/comments')
  getComments(@Question() feedback: Feedback) {
    return this.feedbacksService.getComments(feedback);
  }
}
