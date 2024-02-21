import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty({
    example: '65d675561de2e63b82add614',
    description: 'Comment id',
  })
  id: string;

  @ApiProperty({
    example: '65d67d733e2976999608bf5b',
    description: 'Feedback Id',
  })
  feedback: string;

  @ApiProperty({ example: 'Very nice!', description: 'Comment text' })
  comment: string;

  @ApiProperty({ example: 5, description: 'Rating value' })
  rating: number;

  @ApiProperty({
    example: '2024-02-21T22:47:15.113Z',
    description: 'Created comment was date',
  })
  createdAt: Date;
}
