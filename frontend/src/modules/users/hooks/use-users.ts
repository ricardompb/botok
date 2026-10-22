import { useAsync } from '../../../shared/hooks/use-async';
import { usersService } from '../services/users.service';

export function useUsers(companyId: number) {
  const { data, reload } = useAsync(() => usersService.listByCompany(companyId), [companyId]);
  return { users: data, reload };
}
