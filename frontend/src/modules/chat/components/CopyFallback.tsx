import { useEffect, useRef } from 'react';

/** Alternativa quando a área de transferência não está disponível. */
export function CopyFallback({ text }: { text: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => ref.current?.select(), []);
  return (
    <>
      <p>Selecione e copie o texto abaixo.</p>
      <div className="field">
        <textarea id="copy-fallback" ref={ref} rows={8} readOnly value={text} />
      </div>
    </>
  );
}
