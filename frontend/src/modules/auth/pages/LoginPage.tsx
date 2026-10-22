import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../../shared/hooks/use-document-title';
import { LoginBox } from '../components/LoginBox';
import { LoginStory } from '../components/LoginStory';
import { useAuth } from '../hooks/use-auth';

export function LoginPage() {
  useDocumentTitle('Bem-vindo');
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // “Sair” chega aqui com signOut: a sessão só termina após a navegação ser confirmada.
  useEffect(() => {
    if ((location.state as { signOut?: boolean } | null)?.signOut) {
      signOut();
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate, signOut]);

  return (
    <section id="view-login" className="view login">
      <LoginStory />
      <div className="login-form">
        <LoginBox />
      </div>
    </section>
  );
}
