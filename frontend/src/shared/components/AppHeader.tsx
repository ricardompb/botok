import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-itsok.png';
import { homePath, paths } from '../../routes/paths';
import { useAuth } from '../../modules/auth/hooks/use-auth';
import { useSupport } from '../../modules/support/hooks/use-support';
import { initials } from '../utils/format';
import { Icon } from './Icon';

interface Props {
  /** Assistente aberto na conversa, sugerido no “Fale conosco”. */
  chatAgentId?: string;
}

export function AppHeader({ chatAgentId }: Props) {
  const { user } = useAuth();
  const openSupport = useSupport();
  const navigate = useNavigate();
  const admin = user?.role === 'admin';

  return (
    <header className="app-header" id="header">
      <button className="brand" data-page="catalog" aria-label="IT’s OK — início" onClick={() => navigate(homePath(user?.role))}>
        <img src={logo} alt="IT’s OK" />
        <span className="brand-word">BOTOK</span>
      </button>
      <div className="row">
        <button className="button ghost small" data-support onClick={() => openSupport({ contextAgentId: chatAgentId })}>
          Fale conosco
        </button>
        {user && (
          <>
            <span className="company-chip" id="header-company">
              {admin ? 'Administração IT’s OK' : user.company?.name}
            </span>
            <div className="row">
              <span className="avatar" id="avatar">
                {admin ? 'OK' : initials(user.name)}
              </span>
              <span className="small user-name" id="user-name">
                {user.name}
              </span>
            </div>
            <button
              className="icon-button"
              id="logout"
              aria-label="Sair da plataforma"
              title="Sair"
              onClick={() => navigate(paths.login, { state: { signOut: true } })}
            >
              <Icon name="exit" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
