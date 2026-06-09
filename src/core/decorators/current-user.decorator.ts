/**
 * File: src/core/decorators/current-user.decorator.ts
 * Purpose: Extract the authenticated user (or a nested property) from the request.
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    const user = (request as any).user;
    return data ? user?.[data] : user;
  },
);
