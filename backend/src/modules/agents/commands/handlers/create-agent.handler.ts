import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AgentsRepository } from '../../repositories/agents.repository.js';
import { CreateAgentCommand } from '../impl/create-agent.command.js';
import { AUDIT_AUTHOR, buildAgentFields } from './save-agent.js';

/** Textos padrão de um agente cadastrado pela administração. */
const NEW_AGENT_DEFAULTS = {
  icon: 'chat',
  tip: 'Você conduz a decisão. Utilize apenas situações fictícias nesta demonstração.',
  response:
    'Este é um agente cadastrado pela administração.\n\nNa plataforma real, a mensagem seria enviada ao agente configurado. Aqui, esta resposta fixa apenas demonstra que o novo cadastro já pode aparecer no catálogo, sem alterar o código.\n\nQual situação de comunicação você pretende trabalhar?',
  follow:
    'Continuação ilustrativa do agente cadastrado. O protótipo não executa a conexão nem interpreta as mensagens.',
};

@CommandHandler(CreateAgentCommand)
export class CreateAgentHandler implements ICommandHandler<CreateAgentCommand> {
  constructor(private readonly repo: AgentsRepository) {}

  async execute({ dto }: CreateAgentCommand) {
    const fields = await buildAgentFields(this.repo, dto, null);
    const identity = await this.repo.nextIdentity();
    const agent = await this.repo.create({ ...NEW_AGENT_DEFAULTS, ...fields, ...identity });
    const removed =
      agent.tenantId !== null
        ? await this.repo.revokeFromOtherCompanies(agent.id, agent.tenantId)
        : 0;
    await this.repo.addAudit(
      `Agente cadastrado: ${agent.internalName} · v${agent.version}` +
        (removed ? ' · permissões incompatíveis removidas' : ''),
      AUDIT_AUTHOR,
    );
    return { id: agent.id };
  }
}
