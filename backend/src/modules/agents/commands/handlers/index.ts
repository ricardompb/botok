import { ChangeAgentStatusHandler } from './change-agent-status.handler.js';
import { CreateAgentHandler } from './create-agent.handler.js';
import { DeleteAgentHandler } from './delete-agent.handler.js';
import { UpdateAgentHandler } from './update-agent.handler.js';

export const CommandHandlers = [
  CreateAgentHandler,
  UpdateAgentHandler,
  ChangeAgentStatusHandler,
  DeleteAgentHandler,
];
