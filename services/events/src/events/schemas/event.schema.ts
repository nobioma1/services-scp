import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type EventDocument = HydratedDocument<Event>;

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: false,
  },
  toJSON: {
    versionKey: false,
    transform: function (_, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Event {
  @Prop({ default: uuidv4 })
  eventId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Date })
  date: string;

  @Prop({
    type: Object,
    default: {
      address: '',
      city: '',
      state: '',
      country: '',
    },
  })
  location: Record<string, string>;
}

export const EventSchema = SchemaFactory.createForClass(Event);
