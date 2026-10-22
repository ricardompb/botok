import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../../../shared/api/api-error';
import { entraEnabled, signInWithMicrosoft } from '../../../shared/auth/entra';
import { Icon } from '../../../shared/components/Icon';
import { useModal } from '../../../shared/hooks/use-modal';
import { homePath, paths } from '../../../routes/paths';
import { useSupport } from '../../support/hooks/use-support';
import { useAuth } from '../hooks/use-auth';
import { authService } from '../services/auth.service';

export function LoginBox() {
  const [email, setEmail] = useState('ana@horizonte.example');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, loginError } = useAuth();
  const { open, close, dismiss, info } = useModal();
  const openSupport = useSupport();
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    if (entraEnabled) {
      // A senha e a verificação adicional (MFA) ficam na página da Microsoft.
      await signInWithMicrosoft(email).catch(() => {
        setError('Não foi possível abrir o login da Microsoft. Tente novamente.');
        setSubmitting(false);
      });
      return;
    }
    try {
      const auth = await authService.login({ email, password });
      setPassword('');
      open({
        title: 'Verificação de acesso',
        body: (
          <>
            <p>
              Na plataforma, uma verificação adicional ajudará a proteger sua conta. Neste protótipo, a
              etapa é apenas ilustrativa.
            </p>
            <div className="notice">
              Você entrará como {auth.user.name}, da {auth.user.company?.name ?? 'Administração IT’s OK'}.
            </div>
          </>
        ),
        actions: (
          <>
            <button className="button secondary" onClick={dismiss}>
              Voltar
            </button>
            <button
              className="button"
              id="verify"
              onClick={() => {
                close();
                signIn(auth);
                navigate(homePath(auth.user.role));
              }}
            >
              Simular verificação →
            </button>
          </>
        ),
      });
    } catch (err) {
      setPassword('');
      setError(apiErrorMessage(err, 'Não foi possível entrar. Tente novamente.'));
    } finally {
      setSubmitting(false);
    }
  }

  const forgot = () =>
    info(
      'Recuperar acesso',
      <>
        <p>
          Na versão em produção, a recuperação dependerá do serviço de identidade escolhido e usará um
          canal previamente verificado.
        </p>
        <p>Nenhum e-mail será enviado nesta demonstração.</p>
      </>,
    );

  return (
    <div className="login-box">
      <span className="eyebrow">Seu espaço de comunicação</span>
      <h2>É bom ter você aqui.</h2>
      <p className="muted" style={{ fontSize: 14 }}>
        Entre para acessar os assistentes disponibilizados pela sua empresa.
      </p>
      <form id="login-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">E-mail profissional</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        {!entraEnabled && (
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Demonstração — não informe sua senha real"
              autoComplete="off"
            />
          </div>
        )}
        {(error || loginError) && (
          <p className="error" role="alert">
            {error || loginError}
          </p>
        )}
        <div className="row between" style={{ margin: '16px 0 23px' }}>
          <span className="small muted">Acesso individual</span>
          {!entraEnabled && (
            <button type="button" className="text-link small" id="forgot" onClick={forgot}>
              Esqueci minha senha
            </button>
          )}
        </div>
        <button className="button" type="submit" disabled={submitting}>
          {entraEnabled ? 'Entrar com Microsoft' : 'Entrar na demonstração'} <span>→</span>
        </button>
      </form>
      <div className="rule">proteção de acesso</div>
      <div className="notice">
        <Icon name="shield" />
        <p>Acesso pessoal, com verificação adicional e controle de sessões previstos para a plataforma.</p>
      </div>
      <p className="login-note">
        Esta tela simula a entrada. Não há autenticação real.
        <br />
        <button className="text-link small" data-page="brief" onClick={() => navigate(paths.brief)}>
          Conhecer o escopo do projeto
        </button>
        <br />
        <button
          className="text-link small"
          data-support
          style={{ marginTop: 10 }}
          onClick={() => openSupport({ email })}
        >
          Fale conosco
        </button>
      </p>
    </div>
  );
}
