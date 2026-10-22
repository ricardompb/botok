import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { EntraClaims } from './entra-claims.js';

/** Claims do token Entra validado pelo guard, mesmo sem usuário vinculado. */
export const CurrentEntraClaims = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): EntraClaims | undefined =>
    ctx.switchToHttp().getRequest().entraClaims,
);
