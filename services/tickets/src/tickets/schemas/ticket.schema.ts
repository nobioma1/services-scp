import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type TicketDocument = HydratedDocument<Ticket>;

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
export class Ticket {
  @Prop({ default: uuidv4 })
  ticketId: string;

  @Prop({ type: String })
  eventId: string;

  @Prop({ required: true })
  name: string;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
