import { Module } from '@nestjs/common';
import { SQSClient } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';

import { SQSService } from './sqs.service';

const SQSProvider = {
  inject: [ConfigService],
  provide: 'AWS_SQS',
  useFactory: (configService: ConfigService) => {
    const region = configService.get('AWS_REGION');
    return new SQSClient({ region });
  },
};

@Module({
  providers: [SQSProvider, SQSService],
  exports: [SQSService],
})
export class SQSModule {}
