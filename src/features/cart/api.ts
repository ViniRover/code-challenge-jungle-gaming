import { http } from "../../shared/api/client";
import type { Cart, CartLine, Quote } from "../../shared/domain/models";

export const cartApi = {
  get: (signal?: AbortSignal) =>
    http.get<Cart>("/cart", { signal }).then((r) => r.data),
  update: (items: CartLine[], version: number) =>
    http.put<Cart>("/cart", { items, version }).then((r) => r.data),
  coupon: (code: string) =>
    http.put<Cart>("/cart/coupon", { code }).then((r) => r.data),
  quote: (signal?: AbortSignal) =>
    http.post<Quote>("/quotes", {}, { signal }).then((r) => r.data),
};
