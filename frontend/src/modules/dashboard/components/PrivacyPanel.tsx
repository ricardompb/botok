import { Icon } from '../../../shared/components/Icon';

export function PrivacyPanel() {
  return (
    <div className="panel">
      <h2>Privacidade como parte do produto</h2>
      <p className="muted small">A administração acompanha o uso, sem acesso ao conteúdo das conversas.</p>
      <div className="notice">
        <Icon name="shield" />
        <p>O painel apresenta empresas, licenças, consumo e eventos de acesso. Não oferece consulta a mensagens.</p>
      </div>
      <p className="small muted" style={{ margin: '16px 0 0' }}>
        Contratos e faturamento são administrados fora da plataforma.
      </p>
    </div>
  );
}
