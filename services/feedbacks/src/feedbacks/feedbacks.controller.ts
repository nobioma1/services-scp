import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { IsQuestionGuard } from './guards/is-question.guard';
import { Question } from './decorators/question.decorator';
import { FeedbackDocument } from './schemas/feedback.schema';
import { BadRequestResponseDto } from './dto/bad-request-response.dto';
import {
  CreateFeedbackDto,
  CreateQuestionDto,
} from './dto/create-question.dto';
import {
  FeedbackResponseDto,
  NewFeedbackResponseDto,
  FeedbackQuestionResponseDto,
} from './dto/feedback-response.dto';
import { FeedbacksService } from './feedbacks.service';
import { CommentResponseDto } from './dto/comment-response.dto';

@ApiTags('Feedbacks')
@Controller('api/v1/feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The feedback question has been successfully created.',
  })
  @ApiResponse({
    type: BadRequestResponseDto,
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data. Failed to create question.',
  })
  @ApiOperation({ summary: 'Create a new question for feedback' })
  @Post()
  async registerQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<FeedbackQuestionResponseDto> {
    const { questionId, question } =
      await this.feedbacksService.createQuestion(createQuestionDto);

    return { feedbackId: questionId, question };
  }

  @UseGuards(IsQuestionGuard)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The feedback has been successfully created.',
    type: CreateFeedbackDto,
  })
  @ApiResponse({
    type: BadRequestResponseDto,
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data. Failed to create feedback.',
  })
  @ApiParam({
    name: 'questionId',
    required: true,
    description: 'Identifier of question for feedback',
    type: String,
  })
  @ApiOperation({ summary: 'Create a new feedback response' })
  @Post(':questionId')
  postFeedback(
    @Question() feedback: FeedbackDocument,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<NewFeedbackResponseDto> {
    return this.feedbacksService.createFeedback(feedback, createFeedbackDto);
  }

  @UseGuards(IsQuestionGuard)
  @ApiResponse({ status: HttpStatus.OK, description: 'Ok' })
  @ApiOperation({ summary: 'Get a feedback cumulative and count' })
  @ApiParam({
    name: 'questionId',
    required: true,
    description: 'Identifier of question for feedback',
    type: String,
  })
  @Get(':questionId')
  getFeedbacksRatings(
    @Question() feedback: FeedbackDocument,
  ): Promise<FeedbackResponseDto> {
    return this.feedbacksService.getFeedbacksRatings(
      feedback.questionId,
      feedback.ratings,
    );
  }

  @UseGuards(IsQuestionGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ok',
    type: [CommentResponseDto],
  })
  @ApiOperation({ summary: 'Get a feedback comments' })
  @ApiParam({
    name: 'questionId',
    required: true,
    description: 'Identifier of question for feedback',
    type: String,
  })
  @Get(':questionId/comments')
  getComments(@Question() feedback: FeedbackDocument) {
    return this.feedbacksService.getComments(feedback);
  }
}
