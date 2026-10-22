/** Identidade extraída de um access token v2 do Microsoft Entra ID já validado. */
export interface EntraClaims {
  tenantId: string;
  objectId: string;
  /** UPN da conta (domínio verificado do tenant para contas membro). */
  username: string;
  name: string;
  /** Conta convidada (B2B) ou de outro provedor, autenticada fora do tenant. */
  isGuest: boolean;
}
