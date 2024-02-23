import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsString,
} from 'class-validator';

class LocationDto {
  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;
}

export class CreateEventDto {
  @IsNotEmpty()
  @MaxLength(250)
  name: string;

  @IsOptional()
  @MaxLength(250)
  description: string;

  @IsOptional()
  @IsDateString()
  date: Date;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsNotEmpty()
  createdBy: string;
}
