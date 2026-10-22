import axios from 'axios';
import { tokenStorage, UNAUTHORIZED_EVENT } from './token-storage';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(undefined, (error) => {
  if (error.response?.status === 401 && tokenStorage.get()) {
    tokenStorage.clear();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  return Promise.reject(error);
});
