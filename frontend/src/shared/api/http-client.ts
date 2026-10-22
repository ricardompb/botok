import axios from 'axios';
import { getAccessToken, sessionKey } from '../auth/access-token';
import { tokenStorage, UNAUTHORIZED_EVENT } from './token-storage';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

http.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Sessão expirada ou inválida: volta para a entrada. */
export function handleUnauthorized(status: number | undefined) {
  if (status === 401 && sessionKey()) {
    tokenStorage.clear();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
}

http.interceptors.response.use(undefined, (error) => {
  handleUnauthorized(error.response?.status);
  return Promise.reject(error);
});
