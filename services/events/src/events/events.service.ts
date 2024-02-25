import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  createEvent(createEventDto: CreateEventDto): Promise<EventDocument> {
    const createdEvent = new this.eventModel({
      ...createEventDto,
      createdBy: createEventDto.hostName,
    });
    return createdEvent.save();
  }

  getEvent(eventId: string): Promise<EventDocument> {
    return this.eventModel.findOne({ eventId }).exec();
  }

  getEvents(): Promise<Event[]> {
    return this.eventModel.find({}).sort({ createdAt: -1 }).exec();
  }
}
