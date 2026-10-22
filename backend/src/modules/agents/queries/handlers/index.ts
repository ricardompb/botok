import { GetCatalogHandler } from './get-catalog.handler.js';
import { ListAgentAuditHandler } from './list-agent-audit.handler.js';
import { ListAgentsHandler } from './list-agents.handler.js';

export const QueryHandlers = [ListAgentsHandler, ListAgentAuditHandler, GetCatalogHandler];
