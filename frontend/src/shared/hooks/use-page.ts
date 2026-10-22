import { useMatches } from 'react-router-dom';
import type { PageKey } from '../../routes/paths';

interface PageHandle {
  page?: PageKey;
}

/** Página atual (equivalente ao `current` do protótipo) e seus parâmetros. */
export function usePage() {
  const matches = useMatches();
  const match = [...matches].reverse().find((m) => (m.handle as PageHandle | undefined)?.page);
  return {
    page: (match?.handle as PageHandle | undefined)?.page,
    params: match?.params ?? {},
  };
}
