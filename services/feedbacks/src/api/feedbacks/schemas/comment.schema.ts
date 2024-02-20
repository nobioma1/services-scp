import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { Feedback } from './feedback.schema';

export type CommentDocument = mongoose.HydratedDocument<Comment>;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
  },
})
export class Comment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Feedback.name })
  feedback: Feedback;

  @Prop({ required: true })
  comment: string;

  @Prop({ required: true })
  rating: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
