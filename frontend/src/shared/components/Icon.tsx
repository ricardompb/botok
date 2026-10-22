export type IconName =
  | 'shield'
  | 'arrow'
  | 'exit'
  | 'expand'
  | 'close'
  | 'info'
  | 'route'
  | 'crisis'
  | 'mic'
  | 'chat'
  | 'pen';

export function Icon({ name }: { name: IconName | string }) {
  return (
    <svg className="ico">
      <use href={`#i-${name}`} />
    </svg>
  );
}
