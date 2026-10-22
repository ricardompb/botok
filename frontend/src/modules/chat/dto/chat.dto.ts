export interface SendMessageDto {
  agentId: string;
  sessionId?: string;
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  /** Resposta ainda sendo transmitida pelo assistente. */
  pending?: boolean;
}
