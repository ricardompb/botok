import { today } from '../../common/utils/dates.js';
import type { User } from '../users/entities/user.entity.js';

/** Motivo pelo qual a conta não pode acessar a plataforma, ou null. */
export function accessDenial(user: User): string | null {
  if (!user.active) return 'Usuário suspenso. Procure a administração da sua empresa.';
  if (user.role === 'user') {
    if (!user.company) return 'Usuário sem empresa vinculada.';
    if (user.company.until < today()) {
      return 'A vigência do contrato da sua empresa foi encerrada.';
    }
  }
  return null;
}
