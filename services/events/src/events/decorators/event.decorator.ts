import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Event = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.event;
  },
);
