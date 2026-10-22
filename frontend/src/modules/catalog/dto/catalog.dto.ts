export interface AgentPublicDto {
  id: string;
  name: string;
  short: string;
  icon: string;
  description: string;
  title: string;
  intro: string;
  prompts: string[];
  tip: string;
  manualUrl: string;
  manualVersion: string;
}

export interface AgentSummaryDto {
  id: string;
  name: string;
  description: string;
}

export interface CatalogResponseDto {
  available: AgentPublicDto[];
  others: AgentSummaryDto[];
}
