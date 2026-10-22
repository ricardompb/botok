import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsersRepository } from '../../../users/repositories/users.repository.js';
import { accessDenial } from '../../account-policy.js';
import { MeResponseDto } from '../../dto/auth-response.dto.js';
import { LoginCommand } from '../impl/login.command.js';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async execute({ dto }: LoginCommand) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }
    const denial = accessDenial(user);
    if (denial) throw new ForbiddenException(denial);

    await this.users.touchLastAccess(user.id);
    return {
      accessToken: await this.jwt.signAsync({ sub: user.id }),
      user: MeResponseDto.from(user),
    };
  }
}
