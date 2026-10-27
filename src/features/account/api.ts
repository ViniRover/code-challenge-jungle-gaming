import { http } from "../../shared/api/client";
import type { User, Wallet } from "../../shared/domain/models";
export const accountApi = {
  profile: () => http.get<User>("/profile").then((r) => r.data),
  update: (data: Omit<User, "id">) =>
    http.put<User>("/profile", data).then((r) => r.data),
  password: (data: {
    currentPassword: string;
    password: string;
    confirm: string;
  }) => http.put("/profile/password", data),
  wallets: (signal?: AbortSignal) =>
    http.get<Wallet[]>("/wallets", { signal }).then((r) => r.data),
  saveWallet: (data: Wallet) =>
    http.put<Wallet[]>("/wallets", data).then((r) => r.data),
  favorites: (signal?: AbortSignal) =>
    http.get<string[]>("/favorites", { signal }).then((r) => r.data),
  favorite: (id: string, selected: boolean) =>
    http.put<string[]>(`/favorites/${id}`, { selected }).then((r) => r.data),
};
