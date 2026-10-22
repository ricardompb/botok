import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

interface ToastState {
  text: string;
  visible: boolean;
}

interface ToastContextValue extends ToastState {
  toast: (text: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToastState>({ text: '', visible: false });
  const timer = useRef<number | undefined>(undefined);

  const toast = useCallback((text: string) => {
    setState({ text, visible: true });
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState((s) => ({ ...s, visible: false })), 4000);
  }, []);

  const value = useMemo(() => ({ ...state, toast }), [state, toast]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('ToastProvider ausente.');
  return ctx;
}

export function useToast() {
  return useToastContext().toast;
}

export function ToastViewport() {
  const { text, visible } = useToastContext();
  return (
    <div className={'toast' + (visible ? ' show' : '')} id="toast" role="status">
      {text}
    </div>
  );
}
