import { http } from '../../../shared/api/http-client';
import type { SendMessageDto, SendMessageResponseDto } from '../dto/chat.dto';

export const chatService = {
  send: (dto: SendMessageDto) =>
    http.post<SendMessageResponseDto>('/chat/messages', dto).then((r) => r.data),
};
