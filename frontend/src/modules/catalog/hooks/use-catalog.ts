import { useEffect, useState } from 'react';
import { tokenStorage } from '../../../shared/api/token-storage';
import type { CatalogResponseDto } from '../dto/catalog.dto';
import { catalogService } from '../services/catalog.service';

// Último catálogo carregado, por sessão, para exibição imediata ao trocar de tela.
let cache: { token: string | null; data: CatalogResponseDto } | null = null;
const cached = () => (cache && cache.token === tokenStorage.get() ? cache.data : null);

/** Assistentes liberados para o usuário e demais especialidades. */
export function useCatalog(enabled = true) {
  const [catalog, setCatalog] = useState<CatalogResponseDto | null>(cached);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const token = tokenStorage.get();
    catalogService
      .get()
      .then((data) => {
        cache = { token, data };
        if (alive) setCatalog(data);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [enabled]);

  return { catalog, failed };
}
