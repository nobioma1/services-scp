import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  createTicket(createTicketDto: CreateTicketDto): Promise<TicketDocument> {
    const createdTicket = new this.ticketModel(createTicketDto);
    return createdTicket.save();
  }

  getTicket(ticketId: string): Promise<TicketDocument> {
    return this.ticketModel.findOne({ ticketId }).exec();
  }
}
