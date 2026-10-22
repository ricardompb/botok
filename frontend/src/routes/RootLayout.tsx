import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AgentConsoleProvider, useAgentConsole } from '../modules/agents/hooks/use-agent-console';
import { AuthProvider } from '../modules/auth/hooks/use-auth';
import { AppHeader } from '../shared/components/AppHeader';
import { DemoBar } from '../shared/components/DemoBar';
import { Footer } from '../shared/components/Footer';
import { IconSprite } from '../shared/components/IconSprite';
import { ModalHost, ModalProvider, useModal } from '../shared/hooks/use-modal';
import { usePage } from '../shared/hooks/use-page';
import { ToastProvider, ToastViewport, useToast } from '../shared/hooks/use-toast';

export function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ModalProvider>
          <AgentConsoleProvider>
            <Shell />
          </AgentConsoleProvider>
        </ModalProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

function Shell() {
  const { page, params } = usePage();
  const { pathname } = useLocation();
  const { isOpen } = useModal();
  const { lock } = useAgentConsole();
  const toast = useToast();
  const [presenting, setPresenting] = useState(false);
  const previousPage = useRef(page);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Sair do console de agentes exige nova verificação ao voltar.
  useEffect(() => {
    if (previousPage.current === 'agents' && page !== 'agents') lock();
    previousPage.current = page;
  }, [page, lock]);

  useEffect(() => {
    document.body.classList.toggle('presentation', presenting);
  }, [presenting]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isOpen) setPresenting(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <>
      <a className="skip" href="#main">
        Ir para o conteúdo
      </a>
      <DemoBar
        page={page}
        onPresent={() => {
          setPresenting(true);
          toast('Modo apresentação. Use Esc para mostrar a navegação.');
        }}
      />
      {page !== 'login' && <AppHeader chatAgentId={page === 'chat' ? params.agentId : undefined} />}
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      {page !== 'login' && page !== 'chat' && <Footer />}
      <button className="present-exit" id="exit-present" onClick={() => setPresenting(false)}>
        Sair da apresentação · Esc
      </button>
      <ToastViewport />
      <ModalHost />
      <IconSprite />
    </>
  );
}
