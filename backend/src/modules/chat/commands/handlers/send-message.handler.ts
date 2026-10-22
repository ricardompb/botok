import { ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isAvailableTo } from '../../../agents/agent-policy.js';
import { AgentsRepository } from '../../../agents/repositories/agents.repository.js';
import { ChatSessionsRepository } from '../../repositories/chat-sessions.repository.js';
import { SendMessageCommand } from '../impl/send-message.command.js';

/**
 * Responde com o texto ilustrativo do assistente. A mensagem do usuário é
 * validada e descartada: apenas os metadados da sessão são registrados.
 */
@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<SendMessageCommand> {
  constructor(
    private readonly agents: AgentsRepository,
    private readonly sessions: ChatSessionsRepository,
  ) {}

  async execute({ user, dto }: SendMessageCommand) {
    const [agent, company] = await Promise.all([
      this.agents.findById(dto.agentId),
      this.agents.findCompany(user.tenantId!),
    ]);
    if (!agent || !company || !isAvailableTo(agent, company)) {
      throw new ForbiddenException('Assistente indisponível para esta empresa.');
    }

    const session =
      (dto.sessionId &&
        (await this.sessions.findOwned(dto.sessionId, user.id, agent.id))) ||
      (await this.sessions.create({
        agentId: agent.id,
        tenantId: company.id,
        userId: user.id,
      }));

    const reply = session.messageCount === 0 ? agent.response : agent.follow;
    session.messageCount++;
    await this.sessions.save(session);
    return { sessionId: session.id, reply };
  }
}
