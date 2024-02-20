import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Feedback } from './schemas/feedback.schema';
import { Comment } from './schemas/comment.schema';
import {
  CreateFeedbackDto,
  CreateQuestionDto,
} from './dto/create-question.dto';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<Feedback> {
    const createdQuestionFeedback = new this.feedbackModel(createQuestionDto);
    return createdQuestionFeedback.save();
  }

  async getQuestion(questionId: string): Promise<Feedback> {
    return this.feedbackModel.findOne({ questionId }).exec();
  }

  async createFeedback(
    feedback: Feedback,
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<{ feedbackId: string; comment: string; rating: number }> {
    const { comment, rating } = createFeedbackDto;

    console.log(rating, comment);

    if (comment) {
      const createdComment = new this.commentModel({
        feedback,
        comment,
        rating,
      });
      await createdComment.save();
    }

    // put rating update in a queue

    return { feedbackId: feedback.questionId, comment, rating };
  }

  getFeedbacksRatings(feedback: Feedback) {
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

  getComments(feedback: Feedback): Promise<Comment[]> {
    return this.commentModel.find({ feedback }).exec();
  }
}
