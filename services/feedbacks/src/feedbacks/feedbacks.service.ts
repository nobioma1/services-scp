import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SQSService } from '../common/sqs/sqs.service';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { Comment, CommentDocument } from './schemas/comment.schema';
import {
  CreateFeedbackDto,
  CreateQuestionDto,
} from './dto/create-question.dto';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private readonly sqsService: SQSService,
  ) {}

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<FeedbackDocument> {
    const createdQuestionFeedback = new this.feedbackModel(createQuestionDto);
    return createdQuestionFeedback.save();
  }

  async getQuestion(questionId: string): Promise<FeedbackDocument> {
    return this.feedbackModel.findOne({ questionId }).exec();
  }

  async createFeedback(
    feedback: FeedbackDocument,
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<{ feedbackId: string; comment: string; rating: number }> {
    const { comment, rating } = createFeedbackDto;

    if (comment) {
      const createdComment = new this.commentModel({
        feedback,
        comment,
        rating,
      });
      await createdComment.save();
    }

    try {
      // put rating update in a queue
      await this.sqsService.sendMessage({
        rating,
        id: feedback._id.toString(),
        questionId: feedback.questionId,
      });
    } catch (error) {
      console.error('Error adding rating to queue ');
    }

    return { feedbackId: feedback.questionId, comment, rating };
  }

  getFeedbacksRatings(feedback: FeedbackDocument) {
    // Cumulative Rating = (Sum of (Rating * Frequency)) / Total Number of Ratings
    const { totalScore, totalRatings } = Object.entries(
      feedback.ratings,
    ).reduce(
      (acc, [rating, frequency]) => {
        const ratingNum = Number(rating);
        acc.totalScore += ratingNum * frequency;
        acc.totalRatings += frequency;
        return acc;
      },
      { totalScore: 0, totalRatings: 0 },
    );

    return {
      feedbackId: feedback.questionId,
      cummRating: totalScore / totalRatings || 0,
      numberOfFeedbacks: totalRatings,
      rating: feedback.ratings,
    };
  }

  getComments(feedback: FeedbackDocument): Promise<CommentDocument[]> {
    return this.commentModel.find({ feedback }).exec();
  }
}
