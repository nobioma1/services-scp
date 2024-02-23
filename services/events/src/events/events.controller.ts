import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { IsEventGuard } from './guards/is-event.guard';
import { Event } from './decorators/event.decorator';
import { EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.createEvent(createEventDto);
  }

  @Get()
  getEvents() {
    return this.eventsService.getEvents();
  }

  @UseGuards(IsEventGuard)
  @Get(':eventId')
  getTicket(@Event() event: EventDocument) {
    return event;
  }
}
