export interface SendMessageDto {
  agentId: string;
  sessionId?: string;
  message: string;
}

export interface SendMessageResponseDto {
  sessionId: string;
  reply: string;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}
