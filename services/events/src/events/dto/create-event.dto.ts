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
  @IsOptional()
  state: string;

  @IsString()
  @IsOptional()
  country: string;
}

export class CreateEventDto {
  @IsNotEmpty()
  @MaxLength(250)
  name: string;

  @IsOptional()
  @MaxLength(500)
  description: string;

  @IsOptional()
  @IsDateString()
  date: Date;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsNotEmpty()
  hostName: string;
}
