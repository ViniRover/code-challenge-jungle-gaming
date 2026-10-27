import { http } from "../../shared/api/client";
import type { Session } from "../../shared/domain/models";

export const authApi = {
  session: (signal?: AbortSignal) =>
    http.get<Session | null>("/session", { signal }).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    http.post<Session>("/session", data).then((r) => r.data),
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirm: string;
  }) => http.post<Session>("/users", data).then((r) => r.data),
  logout: () => http.delete("/session"),
};
