import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WsUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    return client.data.user;
  },
);
