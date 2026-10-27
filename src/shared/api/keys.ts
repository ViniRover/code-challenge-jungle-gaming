import type { CatalogSearch } from "../domain/models";

export const keys = {
  session: ["session"] as const,
  catalog: (search?: CatalogSearch) => ["catalog", search || {}] as const,
  nft: (id: string) => ["nft", id] as const,
  cart: (userId: string) => ["private", userId, "cart"] as const,
  quote: (userId: string, version: number) =>
    ["private", userId, "quote", version] as const,
  favorites: (userId: string) => ["private", userId, "favorites"] as const,
  wallets: (userId: string) => ["private", userId, "wallets"] as const,
  order: (userId: string, id: string) =>
    ["private", userId, "order", id] as const,
};
