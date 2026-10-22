import { Query } from '@nestjs/cqrs';
import type { MeResponseDto } from '../../dto/auth-response.dto.js';

export class GetMeQuery extends Query<MeResponseDto> {
  constructor(public readonly userId: string) {
    super();
  }
}
