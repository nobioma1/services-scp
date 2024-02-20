import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FeedbacksController } from './feedbacks.controller';
import { FeedbacksService } from './feedbacks.service';
import { Feedback, FeedbackSchema } from './schemas/feedback.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [FeedbacksController],
  providers: [FeedbacksService],
  exports: [FeedbacksService],
})
export class FeedbacksModule {}
