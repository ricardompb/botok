import { useAsync } from '../../../shared/hooks/use-async';
import { companiesService } from '../services/companies.service';

export function useCompanies() {
  const { data, reload } = useAsync(companiesService.list, []);
  return { companies: data, reload };
}

export function useCompany(id: number) {
  const { data, error, reload } = useAsync(() => companiesService.findById(id), [id]);
  return { company: data, error, reload };
}
