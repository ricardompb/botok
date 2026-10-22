import { Command } from '@nestjs/cqrs';
import type { AuthResponseDto } from '../../dto/auth-response.dto.js';
import type { LoginDto } from '../../dto/login.dto.js';

export class LoginCommand extends Command<AuthResponseDto> {
  constructor(public readonly dto: LoginDto) {
    super();
  }
}
