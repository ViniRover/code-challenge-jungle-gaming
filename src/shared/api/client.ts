import axios from "axios";
import type { ApiError } from "../domain/models";
export const tokenStore = {
  get: () => localStorage.getItem("kurio.session"),
  set: (token: string) => localStorage.setItem("kurio.session", token),
  clear: () => localStorage.removeItem("kurio.session"),
};
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 8000,
});
http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
http.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && tokenStore.get()) {
      tokenStore.clear();
      window.dispatchEvent(new Event("kurio:session-expired"));
    }
    return Promise.reject(error);
  },
);
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error))
    return (
      error.response?.data.message ||
      (error.code === "ECONNABORTED"
        ? "A solicitação demorou mais que o esperado. Tente novamente."
        : "Sem conexão. Verifique a rede e tente novamente.")
    );
  return error instanceof Error ? error.message : "Não foi possível concluir.";
}
