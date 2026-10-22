import { http } from '../../../shared/api/http-client';
import type { CreateSupportRequestDto, SupportReceiptDto } from '../dto/support.dto';

export const supportService = {
  create: (dto: CreateSupportRequestDto) =>
    http.post<SupportReceiptDto>('/support', dto).then((r) => r.data),
};
