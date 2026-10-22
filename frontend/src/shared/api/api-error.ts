import { isAxiosError } from 'axios';

/** Mensagem de erro retornada pela API, ou o texto padrão informado. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message) && message.length) return String(message[0]);
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}

export function apiErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}
