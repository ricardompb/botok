import { useCallback } from 'react';
import { useModal } from '../../../shared/hooks/use-modal';
import { SupportForm } from '../components/SupportForm';

/** Abre o “Fale conosco” estruturado. */
export function useSupport() {
  const { open } = useModal();
  return useCallback(
    (options: { email?: string; contextAgentId?: string } = {}) =>
      open({ title: 'Fale conosco', body: <SupportForm {...options} /> }),
    [open],
  );
}
