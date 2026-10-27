import { http } from "msw";
import { z } from "zod";
import { db, getCart, MockError, ownerFor, persist } from "../database";
import { endpoint } from "./endpoint";
import { issueQuote, validateCoupon } from "../services/quote-service";
const cartSchema = z.object({
  version: z.number().int(),
  items: z
    .array(
      z.object({
        nftId: z.string(),
        edition: z.enum(["1/1", "1/10", "1/50", "ABERTA"]),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .max(100),
});
export const cartHandlers = [
  http.get(
    "/api/cart",
    endpoint((request) => getCart(ownerFor(request))),
  ),
  http.put(
    "/api/cart",
    endpoint(async (request) => {
      const owner = ownerFor(request);
      const data = cartSchema.parse(await request.json());
      const cart = getCart(owner);
      if (cart.version !== data.version)
        throw new MockError(
          "O carrinho foi atualizado. Tente novamente.",
          409,
          "CART_CONFLICT",
        );
      const seen = new Set<string>();
      for (const line of data.items) {
        const key = `${line.nftId}:${line.edition}`;
        if (seen.has(key)) throw new MockError("Item duplicado.");
        seen.add(key);
        const nft = db.nfts.find((n) => n.id === line.nftId);
        if (!nft || line.quantity > nft.editions[line.edition])
          throw new MockError(
            "Quantidade indisponível para esta edição.",
            409,
            "STOCK_CONFLICT",
          );
      }
      cart.items = data.items;
      cart.version++;
      if (!cart.items.length) cart.coupon = "";
      persist();
      return cart;
    }),
  ),
  http.put(
    "/api/cart/coupon",
    endpoint(async (request) => {
      const cart = getCart(ownerFor(request));
      const { code } = z
        .object({ code: z.string().max(40) })
        .parse(await request.json());
      validateCoupon(code);
      cart.coupon = code;
      cart.version++;
      persist();
      return cart;
    }),
  ),
  http.post(
    "/api/quotes",
    endpoint((request) => issueQuote(ownerFor(request))),
  ),
];
