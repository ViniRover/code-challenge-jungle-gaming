import type { Order, OrderRequest } from "../../shared/domain/models";
import { db, getCart, MockError, persist } from "../database";
import { calculateQuote } from "./quote-service";
import { publish } from "../events";
const timers = new Map<string, ReturnType<typeof setTimeout>>();
export function resolveOrder(order: Order) {
  if (order.status !== "pending" || Date.now() < order.resolvesAt) return order;
  order.status = order.declineReason ? "declined" : "confirmed";
  order.version++;
  if (order.status === "declined") {
    for (const line of order.quote.items) {
      const nft = db.nfts.find((n) => n.id === line.nftId)!;
      nft.editions[line.edition] += line.quantity;
      nft.version++;
      publish("nft.updated", nft);
    }
  } else {
    const cart = getCart(order.userId);
    for (const line of order.quote.items) {
      const item = cart.items.find(
        (i) => i.nftId === line.nftId && i.edition === line.edition,
      );
      if (item) item.quantity = Math.max(0, item.quantity - line.quantity);
    }
    cart.items = cart.items.filter((i) => i.quantity > 0);
    cart.version++;
    if (!cart.items.length) cart.coupon = "";
  }
  persist();
  publish("order.updated", order);
  return order;
}
export function scheduleOrder(order: Order) {
  if (order.status !== "pending") return;
  clearTimeout(timers.get(order.id));
  timers.set(
    order.id,
    setTimeout(
      () => {
        resolveOrder(order);
        timers.delete(order.id);
      },
      Math.max(0, order.resolvesAt - Date.now()),
    ),
  );
}
export function restoreOrders() {
  Object.values(db.orders).forEach((order) => {
    resolveOrder(order);
    scheduleOrder(order);
  });
}
export function clearOrderTimers() {
  timers.forEach(clearTimeout);
  timers.clear();
}
export function createOrder(
  owner: string,
  key: string,
  request: OrderRequest,
): { order: Order; created: boolean } {
  const attemptKey = `${owner}:${key}`;
  const body = JSON.stringify(request);
  const previous = db.attempts[attemptKey];
  if (previous) {
    if (previous.body !== body)
      throw new MockError(
        "Esta chave já foi utilizada com outro conteúdo.",
        409,
        "IDEMPOTENCY_CONFLICT",
      );
    return { order: resolveOrder(db.orders[previous.orderId]), created: false };
  }
  const quote = db.quotes[request.quoteId];
  if (!quote || quote.owner !== owner)
    throw new MockError(
      "Cotação não encontrada. Revise a compra.",
      409,
      "STALE_QUOTE",
    );
  const current = calculateQuote(owner);
  if (
    quote.quote.expiresAt < Date.now() ||
    current.fingerprint !== quote.quote.fingerprint
  )
    throw new MockError(
      "Preço, disponibilidade ou taxas mudaram. Revise a nova cotação.",
      409,
      "STALE_QUOTE",
    );
  if (!current.items.length) throw new MockError("Seu carrinho está vazio.");
  if (
    Object.values(db.orders).some(
      (o) => o.userId === owner && o.status === "pending",
    )
  )
    throw new MockError(
      "Há um pedido pendente. Aguarde sua conclusão.",
      409,
      "PENDING_ORDER",
    );
  const wallet = db.wallets[owner]?.find((w) => w.id === request.walletId);
  if (!wallet)
    throw new MockError(
      "Selecione uma carteira cadastrada.",
      422,
      "WALLET_REQUIRED",
    );
  const order: Order = {
    id: crypto.randomUUID(),
    userId: owner,
    status: "pending",
    version: 1,
    quote: structuredClone(quote.quote),
    wallet: structuredClone(wallet),
    collector: request.collector,
    createdAt: Date.now(),
    resolvesAt:
      Date.now() +
      (db.demo.scenario === "pending-order" ? 60000 : db.demo.paymentDelay),
    transaction: `0x${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`,
    declineReason:
      db.demo.scenario === "payment-declined"
        ? "A carteira recusou o pagamento simulado."
        : undefined,
  };
  for (const line of current.items) {
    const nft = db.nfts.find((n) => n.id === line.nftId)!;
    nft.editions[line.edition] -= line.quantity;
    nft.version++;
    publish("nft.updated", nft);
  }
  db.orders[order.id] = order;
  db.attempts[attemptKey] = { orderId: order.id, body };
  persist();
  scheduleOrder(order);
  return { order, created: true };
}
