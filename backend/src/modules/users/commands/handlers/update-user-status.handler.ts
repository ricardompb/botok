import { ConflictException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserResponseDto } from '../../dto/user-response.dto.js';
import { UsersRepository } from '../../repositories/users.repository.js';
import { UpdateUserStatusCommand } from '../impl/update-user-status.command.js';

@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler
  implements ICommandHandler<UpdateUserStatusCommand>
{
  constructor(private readonly repo: UsersRepository) {}

  async execute({ id, active }: UpdateUserStatusCommand) {
    const user = await this.repo.findById(id);
    if (!user || user.role !== 'user' || !user.company) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    if (
      active &&
      !user.active &&
      (await this.repo.countActive(user.company.id)) >= user.company.licenses
    ) {
      throw new ConflictException('Não há vaga disponível para reativação.');
    }
    user.active = active;
    return UserResponseDto.from(await this.repo.save(user));
  }
}
