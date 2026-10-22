import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { FoundryGateway, parseAgentReference } from './foundry.gateway.js';

interface Recorded {
  method: string;
  path: string;
  auth?: string;
  body?: Record<string, unknown>;
}

/** Foundry simulado: Conversations + Responses (streaming SSE) do projeto `p`. */
function fakeFoundry(deltas: string[], fail = false) {
  const requests: Recorded[] = [];
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const path = (req.url ?? '').split('?')[0];
      requests.push({ method: req.method!, path, auth: req.headers.authorization, body: raw ? JSON.parse(raw) : undefined });
      const json = (data: unknown) => res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(data));
      if (req.method === 'POST' && path.endsWith('/openai/v1/conversations')) {
        return json({ id: 'conv_1', object: 'conversation', created_at: 0, metadata: {} });
      }
      if (req.method === 'POST' && path.endsWith('/openai/v1/responses')) {
        res.writeHead(200, { 'content-type': 'text/event-stream' });
        const send = (data: Record<string, unknown>) => res.write(`event: ${data.type}\ndata: ${JSON.stringify(data)}\n\n`);
        const response = { id: 'resp_1', object: 'response', status: 'in_progress', output: [] };
        send({ type: 'response.created', sequence_number: 0, response });
        deltas.forEach((delta, i) =>
          send({ type: 'response.output_text.delta', sequence_number: i + 1, item_id: 'm', output_index: 0, content_index: 0, delta }),
        );
        send(
          fail
            ? { type: 'response.failed', sequence_number: 99, response: { ...response, status: 'failed' } }
            : { type: 'response.completed', sequence_number: 99, response: { ...response, status: 'completed' } },
        );
        return res.end();
      }
      if (req.method === 'DELETE') return json({ id: path.split('/').pop(), deleted: true });
      res.writeHead(404).end();
    });
  });
  return { server, requests };
}

async function withGateway(deltas: string[], fail: boolean, fn: (g: FoundryGateway, endpoint: string, r: Recorded[]) => Promise<void>) {
  const { server, requests } = fakeFoundry(deltas, fail);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const endpoint = `http://localhost:${(server.address() as AddressInfo).port}/api/projects/p`;
  const credential = { getToken: async () => ({ token: 'token-entra', expiresOnTimestamp: Date.now() + 3_600_000 }) };
  try {
    await fn(new FoundryGateway(credential), endpoint, requests);
  } finally {
    server.close();
  }
}

describe('FoundryGateway', () => {
  it('cria a conversa, transmite a resposta do agente e descarta tudo', async () => {
    await withGateway(['Olá, ', 'Ana.'], false, async (gateway, endpoint, requests) => {
      const conversationId = await gateway.createConversation(endpoint);
      const events = [];
      for await (const e of gateway.reply(endpoint, parseAgentReference('itsok-rota:3'), conversationId, 'Preciso falar com o board.')) {
        events.push(e);
      }
      await gateway.discard(endpoint, conversationId, ['resp_1']);

      expect(events).toEqual([
        { type: 'delta', text: 'Olá, ' },
        { type: 'delta', text: 'Ana.' },
        { type: 'completed', responseId: 'resp_1' },
      ]);
      expect(requests.map((r) => `${r.method} ${r.path}`)).toEqual([
        'POST /api/projects/p/openai/v1/conversations',
        'POST /api/projects/p/openai/v1/responses',
        'DELETE /api/projects/p/openai/v1/responses/resp_1',
        'DELETE /api/projects/p/openai/v1/conversations/conv_1',
      ]);
      expect(requests.every((r) => r.auth === 'Bearer token-entra')).toBe(true);
      expect(requests[1].body).toMatchObject({
        conversation: 'conv_1',
        input: 'Preciso falar com o board.',
        stream: true,
        agent: { type: 'agent_reference', name: 'itsok-rota', version: '3' },
      });
    });
  });

  it('falha quando o Foundry não conclui a resposta', async () => {
    await withGateway(['parcial'], true, async (gateway, endpoint) => {
      const run = async () => {
        for await (const _ of gateway.reply(endpoint, { name: 'a' }, 'conv_1', 'oi')) void _;
      };
      await expect(run()).rejects.toThrow('Resposta não concluída');
    });
  });

  it('interpreta nome e versão do agente', () => {
    expect(parseAgentReference('itsok-rota')).toEqual({ name: 'itsok-rota' });
    expect(parseAgentReference(' itsok-rota:2 ')).toEqual({ name: 'itsok-rota', version: '2' });
  });
});
