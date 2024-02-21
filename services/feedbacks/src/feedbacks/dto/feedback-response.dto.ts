import { ApiProperty } from '@nestjs/swagger';

export class FeedbackResponseDto {
  @ApiProperty({
    example: '06e8081a-b2f7-4e7d-82a0-ce024e01b47b',
    description: 'Question Id',
  })
  feedbackId: string;

  @ApiProperty({
    example: 4.5,
    description: 'Cumulative average of ratings',
  })
  cumRating: number;

  @ApiProperty({
    example: 12,
    description: 'Number of feedbacks received',
  })
  numberOfFeedbacks: number;

  @ApiProperty({
    example: {
      '1': 12,
      '2': 4,
      '4': 50,
      '5': 3,
    },
    description: 'Number of ratings',
  })
  'rating': Record<string, number>;
}

export class FeedbackQuestionResponseDto {
  @ApiProperty({
    example: '06e8081a-b2f7-4e7d-82a0-ce024e01b47b',
    description: 'Feedback or Question identifier',
  })
  feedbackId: string;

  @ApiProperty({
    example:
      'On a scale of 1-10, how likely are you to recommend this to to someone you know?',
    description: 'Question requiring feedback',
  })
  question: string;
}

export class NewFeedbackResponseDto {
  @ApiProperty({
    example: '06e8081a-b2f7-4e7d-82a0-ce024e01b47b',
    description: 'Feedback or Question identifier',
  })
  feedbackId: string;

  @ApiProperty({
    example: '5',
    description: 'Newly added rating',
  })
  rating: number;

  @ApiProperty({
    example: 'Very good website',
    description: 'Newly added comment, if any',
    required: false,
  })
  comment?: string;
}
