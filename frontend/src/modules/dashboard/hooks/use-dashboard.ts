import { useAsync } from '../../../shared/hooks/use-async';
import { dashboardService } from '../services/dashboard.service';

export function useDashboard() {
  const stats = useAsync(dashboardService.stats, []);
  const usage = useAsync(dashboardService.usage, []);
  return { stats: stats.data, usage: usage.data };
}
