import { http } from "../../shared/api/client";
import type { Order, OrderRequest } from "../../shared/domain/models";

export const orderApi = {
  create: (key: string, data: OrderRequest) =>
    http
      .post<Order>("/orders", data, { headers: { "Idempotency-Key": key } })
      .then((r) => r.data),
  get: (id: string, signal?: AbortSignal) =>
    http.get<Order>(`/orders/${id}`, { signal }).then((r) => r.data),
  attempt: (key: string) =>
    http.get<Order>(`/order-attempts/${key}`).then((r) => r.data),
};
