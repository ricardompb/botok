export interface CreateSupportRequestDto {
  category: string;
  issue: string;
  agentId?: string;
  impact: string;
  email?: string;
}

export interface SupportReceiptDto {
  protocol: string;
  category: string;
  issue: string;
}
