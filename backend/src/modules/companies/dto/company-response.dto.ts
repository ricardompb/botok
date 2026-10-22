export class CompanyListItemDto {
  id: number;
  name: string;
  /** Nomes curtos dos assistentes contratados. */
  agents: string[];
  activeUsers: number;
  licenses: number;
  quota: number;
  until: string;
}

export class EntitlementOptionDto {
  id: string;
  name: string;
}

export class CompanyDetailDto {
  id: number;
  name: string;
  licenses: number;
  quota: number;
  until: string;
  activeUsers: number;
  allowedAgentIds: string[];
  entitlementOptions: EntitlementOptionDto[];
}

export class CreatedCompanyDto {
  id: number;
}
