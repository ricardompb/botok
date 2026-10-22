/** Aceita apenas URLs HTTPS sem credenciais embutidas (mesma regra do protótipo). */
export function isSafeHttps(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}
