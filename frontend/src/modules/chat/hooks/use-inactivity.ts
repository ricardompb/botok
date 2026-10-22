import { useEffect, useRef } from 'react';

const EVENTS = ['pointerdown', 'keydown', 'input', 'wheel', 'touchstart'] as const;

/** Chama onTimeout após `limitMs` sem interação (verificação a cada 10 s). */
export function useInactivity(limitMs: number, onTimeout: () => void) {
  const lastActivity = useRef(0);
  const callback = useRef(onTimeout);

  useEffect(() => {
    callback.current = onTimeout;
  });

  useEffect(() => {
    lastActivity.current = Date.now();
    const touch = () => (lastActivity.current = Date.now());
    EVENTS.forEach((type) => document.addEventListener(type, touch, { passive: true }));
    const timer = window.setInterval(() => {
      if (Date.now() - lastActivity.current > limitMs) callback.current();
    }, 10_000);
    return () => {
      EVENTS.forEach((type) => document.removeEventListener(type, touch));
      clearInterval(timer);
    };
  }, [limitMs]);
}
