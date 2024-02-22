import { Injectable, Inject } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandOutput,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SQSService {
  constructor(
    @Inject('AWS_SQS') private readonly sqsClient: SQSClient,
    private configService: ConfigService,
  ) {}

  async sendMessage(
    msgObj: Record<string, string | number>,
    msgGroupId?: string,
  ): Promise<SendMessageCommandOutput> {
    const command = new SendMessageCommand({
      MessageGroupId: msgGroupId,
      QueueUrl: this.configService.get('SQS_QUEUE_URL'),
      MessageBody: JSON.stringify(msgObj),
    });

    try {
      const response = await this.sqsClient.send(command);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}
