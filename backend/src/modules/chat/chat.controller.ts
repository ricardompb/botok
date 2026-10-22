import { Body, Controller, HttpCode, Param, ParseUUIDPipe, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { LongRunning } from '../../common/tenancy/long-running.decorator.js';
import { EndChatSessionCommand } from './commands/impl/end-chat-session.command.js';
import { SendMessageCommand } from './commands/impl/send-message.command.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@Controller('chat')
@Roles('user')
@LongRunning()
export class ChatController {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Resposta do agente em Server-Sent Events: `session`, `delta`*, `done`
   * (ou `error`). Erros antes do início do fluxo voltam como JSON.
   */
  @Post('messages')
  async send(
    @CurrentUser() user: AuthUser,
    @Body() dto: SendMessageDto,
    @Res() res: Response,
  ) {
    const abort = new AbortController();
    res.on('close', () => abort.abort());
    const write = (event: string, data: unknown) =>
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    const sink = {
      session: (sessionId: string) => {
        res.status(200).set({
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'X-Accel-Buffering': 'no',
        });
        res.flushHeaders();
        write('session', { sessionId });
      },
      delta: (text: string) => write('delta', { text }),
    };
    try {
      await this.commandBus.execute(new SendMessageCommand(user, dto, sink, abort.signal));
      if (abort.signal.aborted) return;
      if (!res.headersSent) return res.status(204).end();
      write('done', {});
      res.end();
    } catch (err) {
      if (!res.headersSent) throw err;
      if (!abort.signal.aborted) write('error', { message: (err as Error).message });
      res.end();
    }
  }

  /** Encerramento explícito (botão, troca de assistente, saída da tela). */
  @Post('sessions/:id/end')
  @HttpCode(204)
  end(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.commandBus.execute(new EndChatSessionCommand(user, id));
  }
}
