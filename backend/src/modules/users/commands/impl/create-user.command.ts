import { Command } from '@nestjs/cqrs';
import type { CreateUserDto } from '../../dto/create-user.dto.js';
import type { UserResponseDto } from '../../dto/user-response.dto.js';

export class CreateUserCommand extends Command<UserResponseDto> {
  constructor(public readonly dto: CreateUserDto) {
    super();
  }
}
