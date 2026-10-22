import { Command } from '@nestjs/cqrs';
import type { MeResponseDto } from '../../dto/auth-response.dto.js';
import type { EntraClaims } from '../../entra/entra-claims.js';

export class StartEntraSessionCommand extends Command<MeResponseDto> {
  constructor(public readonly claims: EntraClaims) {
    super();
  }
}
