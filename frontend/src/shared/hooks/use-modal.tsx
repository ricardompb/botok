import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface ModalOptions {
  title: string;
  body: ReactNode;
  actions?: ReactNode;
  wide?: boolean;
  /** Executado quando o usuário cancela (Esc ou botão de fechar). */
  onCancel?: () => void;
}

interface ModalContextValue {
  current: ModalOptions | null;
  isOpen: boolean;
  open: (options: ModalOptions) => void;
  /** Fecha após uma ação concluída. */
  close: () => void;
  /** Fecha como cancelamento, executando onCancel. */
  dismiss: () => void;
  info: (title: string, body: ReactNode) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ModalOptions | null>(null);
  const currentRef = useRef(current);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const open = useCallback((options: ModalOptions) => setCurrent(options), []);
  const close = useCallback(() => setCurrent(null), []);
  const dismiss = useCallback(() => {
    currentRef.current?.onCancel?.();
    setCurrent(null);
  }, []);
  const info = useCallback(
    (title: string, body: ReactNode) =>
      open({
        title,
        body,
        actions: (
          <button className="button" onClick={dismiss}>
            Entendi
          </button>
        ),
      }),
    [open, dismiss],
  );

  const value = useMemo(
    () => ({ current, isOpen: current !== null, open, close, dismiss, info }),
    [current, open, close, dismiss, info],
  );
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('ModalProvider ausente.');
  return ctx;
}

/** <dialog> único da aplicação, como no protótipo. */
export function ModalHost() {
  const { current, dismiss, close } = useModal();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (current && !dialog.open) dialog.showModal();
    if (!current && dialog.open) dialog.close();
  }, [current]);

  return (
    <dialog
      id="modal"
      ref={dialogRef}
      aria-labelledby="modal-title"
      className={current?.wide ? 'wide-modal' : undefined}
      onCancel={(e) => {
        e.preventDefault();
        dismiss();
      }}
      onClose={close}
    >
      {current && (
        <div id="modal-content">
          <h2 id="modal-title">{current.title}</h2>
          {current.body}
          <div className="dialog-actions">{current.actions}</div>
        </div>
      )}
    </dialog>
  );
}
