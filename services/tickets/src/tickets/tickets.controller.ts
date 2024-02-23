import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { IsTicketGuard } from './guards/is-ticket.guard';
import { Ticket } from './decorators/ticket.decorator';
import { TicketDocument } from './schemas/ticket.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.createTicket(createTicketDto);
  }

  @UseGuards(IsTicketGuard)
  @Get(':ticketId')
  getTicket(@Ticket() ticket: TicketDocument) {
    return ticket;
  }
}
