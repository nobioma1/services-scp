import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { FeedbacksService } from '../feedbacks.service';

@Injectable()
export class IsQuestionGuard implements CanActivate {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const questionId = request?.params?.questionId;

    try {
      const question = await this.feedbacksService.getQuestion(questionId);

      if (!question) {
        throw new Error('Question not found');
      }

      request['question'] = question;
    } catch {
      throw new NotFoundException();
    }

    return true;
  }
}
