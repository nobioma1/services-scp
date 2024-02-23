import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { TicketsService } from '../tickets.service';

@Injectable()
export class IsTicketGuard implements CanActivate {
  constructor(private readonly ticketsService: TicketsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const ticketId = request?.params?.ticketId;

    try {
      const ticket = await this.ticketsService.getTicket(ticketId);

      if (!ticket) {
        throw new Error('Ticket with id does not exist');
      }

      request['ticket'] = ticket;
    } catch {
      throw new NotFoundException();
    }

    return true;
  }
}
