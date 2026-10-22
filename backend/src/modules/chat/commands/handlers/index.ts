import { EndChatSessionHandler } from './end-chat-session.handler.js';
import { SendMessageHandler } from './send-message.handler.js';

export const CommandHandlers = [SendMessageHandler, EndChatSessionHandler];
