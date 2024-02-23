import { IsNotEmpty, MaxLength, IsUUID } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @MaxLength(250)
  name: string;

  @IsUUID()
  eventId: string;
}
