import { fromWei, toWei, multiply } from "../../shared/domain/money";
import type { Quote, QuoteLine } from "../../shared/domain/models";
import { db, getCart, MockError, persist } from "../database";

export function validateCoupon(code: string) {
  if (code && code !== "KURIO10")
    throw new MockError(
      code === "EXPIRADO"
        ? "Este cupom expirou."
        : "Código promocional inválido.",
      422,
      "INVALID_COUPON",
    );

  if (code && db.demo.scenario === "coupon-expired")
    throw new MockError("Este cupom expirou.", 422, "EXPIRED_COUPON");
}

export function calculateQuote(owner: string): Quote {
  const cart = getCart(owner);

  validateCoupon(cart.coupon);

  const items: QuoteLine[] = cart.items.map((line) => {
    const nft = db.nfts.find((n) => n.id === line.nftId);

    if (!nft || line.quantity > nft.editions[line.edition])
      throw new MockError(
        `${nft?.name || "NFT"}: edição indisponível. Ajuste a quantidade no carrinho.`,
        409,
        "STOCK_CONFLICT",
      );

    return {
      ...line,
      name: nft.name,
      image: nft.image,
      unitPrice: nft.price,
      total: multiply(nft.price, line.quantity),
      network: nft.network,
      nftVersion: nft.version,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + toWei(i.total), 0n);
  const discount = cart.coupon ? subtotal / 10n : 0n;
  const fee = items.length ? toWei("0.016") : 0n;

  return {
    id: crypto.randomUUID(),
    fingerprint: JSON.stringify([
      cart.version,
      items.map((i) => [
        i.nftId,
        i.edition,
        i.quantity,
        i.nftVersion,
        i.unitPrice,
      ]),
      cart.coupon,
      fromWei(fee),
    ]),
    items,
    coupon: cart.coupon,
    subtotal: fromWei(subtotal),
    discount: fromWei(discount),
    fee: fromWei(fee),
    total: fromWei(subtotal - discount + fee),
    expiresAt: Date.now() + 300000,
  };
}

export function issueQuote(owner: string) {
  const quote = calculateQuote(owner);

  db.quotes[quote.id] = { owner, quote };
  persist();

  return quote;
}
