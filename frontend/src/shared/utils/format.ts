/** 2027-10-31 → 31/10/2027 */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

/** Último acesso relativo, como no protótipo: Hoje, Ontem, Há N dias. */
export function lastAccessLabel(iso: string | null): string {
  if (!iso) return 'Ainda não acessou';
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((day(new Date()) - day(new Date(iso))) / 86_400_000);
  if (days <= 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  return `Há ${days} dias`;
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
