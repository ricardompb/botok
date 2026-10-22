import { SetMetadata } from '@nestjs/common';

export const TENANT_PARAM_KEY = 'tenantParam';

/**
 * Rota administrativa que opera dados de uma empresa específica: o tenant vem
 * do parâmetro informado e o acesso da IT’s OK fica registrado em auditoria.
 */
export const TenantParam = (param: string) => SetMetadata(TENANT_PARAM_KEY, param);
