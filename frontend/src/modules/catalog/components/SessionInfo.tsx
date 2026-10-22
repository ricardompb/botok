import { Icon } from '../../../shared/components/Icon';
import { useModal } from '../../../shared/hooks/use-modal';

export function SessionInfo() {
  const { info } = useModal();

  const explain = () =>
    info(
      'Uma conversa temporária',
      <>
        <p>
          Você pode desenvolver suas ideias ao longo da sessão. Ao encerrar, o conteúdo da conversa será
          descartado; não haverá uma lista de conversas anteriores.
        </p>
        <p>Copie o resultado antes de sair. O protótipo também encerra a conversa após 30 minutos sem interação.</p>
        <p>
          Na plataforma real, a política será validada também nos serviços externos utilizados. Os registros
          administrativos conterão apenas os metadados definidos para acesso, segurança e consumo.
        </p>
      </>,
    );

  return (
    <div className="session-info">
      <span className="row">
        <Icon name="shield" /> Conversas sem histórico: copie o que desejar guardar antes de encerrar.
      </span>
      <button className="text-link small" id="privacy" onClick={explain}>
        Como funciona minha sessão?
      </button>
    </div>
  );
}
