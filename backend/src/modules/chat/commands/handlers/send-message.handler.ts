import { ForbiddenException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TenantDb } from '../../../../common/tenancy/tenant-db.js';
import { isAvailableTo } from '../../../agents/agent-policy.js';
import { AgentsRepository } from '../../../agents/repositories/agents.repository.js';
import { FoundryGateway, parseAgentReference } from '../../foundry/foundry.gateway.js';
import { ChatSessionsRepository } from '../../repositories/chat-sessions.repository.js';
import { SendMessageCommand } from '../impl/send-message.command.js';

const UNAVAILABLE = 'O assistente não está disponível no momento. Tente novamente em instantes.';

/**
 * Um turno da conversa: valida o acesso, garante a conversa no Foundry e
 * transmite a resposta do agente. A mensagem não é gravada no portal; apenas
 * metadados (contagem, atividade, identificadores remotos para o descarte).
 * Rota longa: o banco é acessado só em transações curtas.
 */
@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<SendMessageCommand> {
  private readonly logger = new Logger(SendMessageHandler.name);

  constructor(
    private readonly db: TenantDb,
    private readonly agents: AgentsRepository,
    private readonly sessions: ChatSessionsRepository,
    private readonly foundry: FoundryGateway,
  ) {}

  async execute({ user, dto, sink, signal }: SendMessageCommand) {
    const { agent, session } = await this.db.transaction(async () => {
      const agent = await this.agents.findById(dto.agentId);
      const company = await this.agents.findCompany(user.tenantId!);
      if (!agent || !company || !isAvailableTo(agent, company)) {
        throw new ForbiddenException('Assistente indisponível para esta empresa.');
      }
      const session =
        (dto.sessionId && (await this.sessions.findOpen(dto.sessionId, user.id, agent.id))) ||
        (await this.sessions.create({
          agentId: agent.id,
          tenantId: company.id,
          userId: user.id,
          remoteEndpoint: agent.endpoint,
        }));
      return { agent, session };
    });

    let answered = false;
    try {
      if (!session.remoteConversationId) {
        const conversationId = await this.foundry.createConversation(session.remoteEndpoint!);
        await this.db.transaction(async () => {
          session.remoteConversationId = conversationId;
          await this.sessions.save(session);
        });
      }
      sink.session(session.id);

      const reference = parseAgentReference(agent.remoteId);
      for await (const event of this.foundry.reply(
        session.remoteEndpoint!,
        reference,
        session.remoteConversationId!,
        dto.message,
        signal,
      )) {
        if (event.type === 'delta') sink.delta(event.text);
        else {
          session.remoteResponseIds = [...session.remoteResponseIds, event.responseId];
          answered = true;
        }
      }
    } catch (err) {
      if (signal?.aborted) return;
      this.logger.warn(`Falha no Foundry (agente ${agent.id}, sessão ${session.id}): ${(err as Error).message}`);
      throw new ServiceUnavailableException(UNAVAILABLE);
    } finally {
      await this.db.transaction(async () => {
        if (answered) session.messageCount++;
        session.lastActivityAt = new Date();
        await this.sessions.save(session);
      });
    }
  }
}
