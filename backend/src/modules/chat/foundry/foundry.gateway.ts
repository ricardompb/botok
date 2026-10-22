import { Inject, Injectable } from '@nestjs/common';
import { AIProjectClient } from '@azure/ai-projects';
import type { TokenCredential } from '@azure/identity';
import type OpenAI from 'openai';

/** Credencial do backend no Entra ID (o Foundry não aceita chaves). */
export const FOUNDRY_CREDENTIAL = Symbol('FOUNDRY_CREDENTIAL');

export interface AgentReference {
  name: string;
  version?: string;
}

export type ReplyEvent = { type: 'delta'; text: string } | { type: 'completed'; responseId: string };

/** Identificador cadastrado no portal: `nome` ou `nome:versão` do agente no Foundry. */
export function parseAgentReference(remoteId: string): AgentReference {
  const [name, version] = remoteId.trim().split(':');
  return version ? { name, version } : { name };
}

export class FoundryError extends Error {}

/**
 * Integração com o Microsoft Foundry Agent Service (Conversations + Responses).
 * Nenhum conteúdo de conversa é registrado em log por esta classe.
 */
@Injectable()
export class FoundryGateway {
  private readonly clients = new Map<string, OpenAI>();

  constructor(@Inject(FOUNDRY_CREDENTIAL) private readonly credential: TokenCredential) {}

  private client(endpoint: string): OpenAI {
    let client = this.clients.get(endpoint);
    if (!client) {
      client = new AIProjectClient(endpoint, this.credential).getOpenAIClient();
      this.clients.set(endpoint, client);
    }
    return client;
  }

  /** Cria a conversa remota que guarda o contexto durante a sessão. */
  async createConversation(endpoint: string): Promise<string> {
    const conversation = await this.client(endpoint).conversations.create({});
    return conversation.id;
  }

  /** Envia a mensagem ao agente e transmite a resposta conforme é gerada. */
  async *reply(
    endpoint: string,
    agent: AgentReference,
    conversationId: string,
    message: string,
    signal?: AbortSignal,
  ): AsyncGenerator<ReplyEvent> {
    const stream = await this.client(endpoint).responses.create(
      { conversation: conversationId, input: message, stream: true },
      { body: { agent: { type: 'agent_reference', ...agent } }, signal },
    );
    let responseId = '';
    for await (const event of stream) {
      switch (event.type) {
        case 'response.created':
          responseId = event.response.id;
          break;
        case 'response.output_text.delta':
          yield { type: 'delta', text: event.delta };
          break;
        case 'response.completed':
          yield { type: 'completed', responseId: event.response.id || responseId };
          return;
        case 'response.failed':
        case 'response.incomplete':
          throw new FoundryError(`Resposta não concluída (${event.type}).`);
        case 'error':
          throw new FoundryError(`Erro do Foundry (${event.code ?? 'sem código'}).`);
      }
    }
    throw new FoundryError('Resposta encerrada sem conclusão.');
  }

  /** Apaga no Foundry a conversa e as respostas geradas (sem histórico no provedor). */
  async discard(endpoint: string, conversationId: string | null, responseIds: string[]) {
    const client = this.client(endpoint);
    const ignoreMissing = (err: unknown) => {
      if ((err as { status?: number }).status !== 404) throw err;
    };
    for (const id of responseIds) await client.responses.delete(id).catch(ignoreMissing);
    if (conversationId) await client.conversations.delete(conversationId).catch(ignoreMissing);
  }
}
