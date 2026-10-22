import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserResponseDto } from '../../dto/user-response.dto.js';
import { UsersRepository } from '../../repositories/users.repository.js';
import { ListUsersQuery } from '../impl/list-users.query.js';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(private readonly repo: UsersRepository) {}

  async execute({ companyId }: ListUsersQuery) {
    const users = await this.repo.listByCompany(companyId);
    return users.map(UserResponseDto.from);
  }
}
