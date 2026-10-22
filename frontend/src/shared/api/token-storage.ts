const KEY = 'itsok.token';

export const UNAUTHORIZED_EVENT = 'itsok:unauthorized';

export const tokenStorage = {
  get: () => localStorage.getItem(KEY),
  set: (token: string) => localStorage.setItem(KEY, token),
  clear: () => localStorage.removeItem(KEY),
};
