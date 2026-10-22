import { UnauthorizedException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/repositories/users.repository.js';
import { MeResponseDto } from '../../dto/auth-response.dto.js';
import { GetMeQuery } from '../impl/get-me.query.js';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  constructor(private readonly users: UsersRepository) {}

  async execute({ userId }: GetMeQuery) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return MeResponseDto.from(user);
  }
}
