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

http.interceptors.response.use(undefined, (error) => {
  if (error.response?.status === 401 && sessionKey()) {
    tokenStorage.clear();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  return Promise.reject(error);
});
