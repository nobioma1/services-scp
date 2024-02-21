import { ApiProperty } from '@nestjs/swagger';

export class BadRequestResponseDto {
  @ApiProperty({
    description: 'The HTTP status code of the error response.',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'A short description of the error type.',
    example: 'Bad Request',
  })
  errors: string;

  @ApiProperty({
    description: 'A more detailed message about the error.',
    example: 'Validation failed for the given input data.',
  })
  message: string[];
}
