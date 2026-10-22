import { Query } from '@nestjs/cqrs';
import type { UserResponseDto } from '../../dto/user-response.dto.js';

export class ListUsersQuery extends Query<UserResponseDto[]> {
  constructor(public readonly tenantId: number) {
    super();
  }
}
