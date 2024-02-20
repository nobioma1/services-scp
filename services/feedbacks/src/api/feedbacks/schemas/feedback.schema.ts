import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type FeedbackDocument = HydratedDocument<Feedback>;

const DEFAULT_RATING = {
  5: 0,
  4: 0,
  2: 0,
  1: 0,
};

@Schema({
  timestamps: {
    createdAt: 'createdAt',
  },
})
export class Feedback {
  @Prop({ default: uuidv4() })
  questionId: string;

  @Prop({ required: true })
  question: string;

  @Prop({ type: Object, default: DEFAULT_RATING })
  ratings: Record<string, number>;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
