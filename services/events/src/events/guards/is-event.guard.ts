import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EventsService } from '../events.service';

@Injectable()
export class IsEventGuard implements CanActivate {
  constructor(private readonly eventsService: EventsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const eventId = request?.params?.eventId;

    try {
      const event = await this.eventsService.getEvent(eventId);

      if (!event) {
        throw new Error('Event with id does not exist');
      }

      request['event'] = event;
    } catch {
      throw new NotFoundException();
    }

    return true;
  }
}
