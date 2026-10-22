import { useNavigate } from 'react-router-dom';
import { paths, type PageKey } from '../../routes/paths';
import { useAuth } from '../../modules/auth/hooks/use-auth';

interface Props {
  page?: PageKey;
  onPresent: () => void;
}

/**
 * Barra superior do protótipo. Assistentes aparece só para usuários de
 * empresa; Administração, só para administradores da IT’s OK.
 */
export function DemoBar({ page, onPresent }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const link = (key: PageKey, label: string, to: string) => (
    <button data-page={key} aria-current={page === key ? 'page' : 'false'} onClick={() => navigate(to)}>
      {label}
    </button>
  );

  return (
    <div className="demo-bar">
      <span>
        <strong>PROTÓTIPO INTERATIVO</strong> <span className="muted">· Dados fictícios · Sem conexão com IA</span>
      </span>
      <nav aria-label="Navegação da demonstração">
        {link('login', 'Entrada', paths.login)}
        {user?.role === 'user' && link('catalog', 'Assistentes', paths.catalog)}
        {user?.role === 'admin' && link('admin', 'Administração', paths.admin)}
        {link('brief', 'Sobre o projeto', paths.brief)}
        <button id="present" onClick={onPresent}>
          Apresentar ↗
        </button>
      </nav>
    </div>
  );
}
