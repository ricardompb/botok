import { http } from '../../../shared/api/http-client';
import type { CatalogResponseDto } from '../dto/catalog.dto';

export const catalogService = {
  get: () => http.get<CatalogResponseDto>('/catalog').then((r) => r.data),
};
