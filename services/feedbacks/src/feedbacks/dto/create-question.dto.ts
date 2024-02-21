import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @MaxLength(250)
  @ApiProperty({
    description: 'Question for feedback',
    example:
      'On a scale of 1-10, how likely are you to recommend this to to someone you know?',
    maxLength: 250,
  })
  question: string;
}

export class CreateFeedbackDto {
  @MaxLength(250)
  @IsOptional()
  @ApiProperty({
    description: 'Detailed comment from the user',
    example: 'This product was great!',
    required: false,
    maxLength: 250,
  })
  comment?: string;

  @Min(1)
  @Max(5)
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The rating given by the user',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  rating: number;
}
