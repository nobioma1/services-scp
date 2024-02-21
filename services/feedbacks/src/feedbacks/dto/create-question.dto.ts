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
  question: string;
}

export class CreateFeedbackDto {
  @MaxLength(250)
  @IsOptional()
  comment: string;

  @Min(1)
  @Max(5)
  @IsInt()
  @IsNotEmpty()
  rating: number;
}
