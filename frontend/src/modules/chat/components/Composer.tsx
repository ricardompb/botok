import { forwardRef, type FormEvent, type KeyboardEvent } from 'react';
import { Icon } from '../../../shared/components/Icon';

interface Props {
  value: string;
  sending: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}

export const Composer = forwardRef<HTMLTextAreaElement, Props>(function Composer(
  { value, sending, onChange, onSend },
  ref,
) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSend();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="composer-wrap">
      <form className="composer" id="composer" onSubmit={submit}>
        <textarea
          ref={ref}
          id="message-input"
          rows={2}
          maxLength={6000}
          placeholder="Conte a situação, para quem você vai falar e o que pretende alcançar…"
          aria-label="Sua mensagem"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="composer-bottom">
          <small>Enter envia · Shift + Enter cria uma nova linha</small>
          <button className="button small" id="send" type="submit" disabled={sending}>
            Enviar <Icon name="arrow" />
          </button>
        </div>
      </form>
      <p className="composer-note">
        Respostas ilustrativas neste protótipo. Não informe dados reais ou confidenciais. Revise o conteúdo antes
        de utilizá-lo.
      </p>
    </div>
  );
});
