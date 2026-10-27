import { http } from "../../shared/api/client";
import type {
  CatalogPage,
  CatalogSearch,
  Nft,
} from "../../shared/domain/models";
export const catalogApi = {
  list: (params: CatalogSearch, signal?: AbortSignal) =>
    http.get<CatalogPage>("/nfts", { params, signal }).then((r) => r.data),
  detail: (id: string, signal?: AbortSignal) =>
    http.get<Nft>(`/nfts/${id}`, { signal }).then((r) => r.data),
};
