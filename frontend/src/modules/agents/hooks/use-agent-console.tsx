import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../../routes/paths';
import { useModal } from '../../../shared/hooks/use-modal';

interface AgentConsoleValue {
  verified: boolean;
  lock: () => void;
  /** Exige a verificação adicional antes de abrir o console de agentes. */
  openConsole: () => void;
}

const AgentConsoleContext = createContext<AgentConsoleValue | null>(null);

export function AgentConsoleProvider({ children }: { children: ReactNode }) {
  const [verified, setVerified] = useState(false);
  const { open, close, dismiss } = useModal();
  const navigate = useNavigate();

  const lock = useCallback(() => setVerified(false), []);

  const openConsole = useCallback(() => {
    if (verified) {
      navigate(paths.agents);
      return;
    }
    open({
      title: 'Verificação adicional',
      body: (
        <>
          <p>
            O console de agentes é reservado a administradores autorizados. Na plataforma real, operações
            sensíveis exigirão nova verificação de identidade.
          </p>
          <div className="notice">Nesta demonstração, use o botão abaixo. Não digite senha, token ou chave real.</div>
        </>
      ),
      actions: (
        <>
          <button className="button secondary" onClick={dismiss}>
            Cancelar
          </button>
          <button
            className="button"
            id="verify-agent-console"
            onClick={() => {
              close();
              setVerified(true);
              navigate(paths.agents);
            }}
          >
            Simular verificação →
          </button>
        </>
      ),
    });
  }, [verified, open, close, dismiss, navigate]);

  const value = useMemo(() => ({ verified, lock, openConsole }), [verified, lock, openConsole]);
  return <AgentConsoleContext.Provider value={value}>{children}</AgentConsoleContext.Provider>;
}

export function useAgentConsole() {
  const ctx = useContext(AgentConsoleContext);
  if (!ctx) throw new Error('AgentConsoleProvider ausente.');
  return ctx;
}
