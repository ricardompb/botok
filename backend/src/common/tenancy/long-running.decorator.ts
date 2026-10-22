import { SetMetadata } from '@nestjs/common';

export const LONG_RUNNING_KEY = 'longRunning';

/**
 * Rota que mantém a resposta aberta (ex.: streaming): recebe o contexto de
 * tenant sem transação; o handler usa transações curtas (TenantDb.transaction).
 */
export const LongRunning = () => SetMetadata(LONG_RUNNING_KEY, true);
