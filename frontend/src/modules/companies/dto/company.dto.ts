export interface CompanyListItemDto {
  id: number;
  name: string;
  agents: string[];
  activeUsers: number;
  licenses: number;
  quota: number;
  until: string;
}

export interface CompanyDetailDto {
  id: number;
  name: string;
  licenses: number;
  quota: number;
  until: string;
  activeUsers: number;
  allowedAgentIds: string[];
  entitlementOptions: { id: string; name: string }[];
}

export interface CreateCompanyDto {
  name: string;
  licenses: number;
}
