import { beforeEach, describe, expect, it, vi } from "vitest";
import { db, getCart, resetDatabase } from "../../src/mocks/database";
import { issueQuote } from "../../src/mocks/services/quote-service";
import {
  createOrder,
  resolveOrder,
  clearOrderTimers,
} from "../../src/mocks/services/order-service";

const values = new Map<string, string>();

vi.stubGlobal("localStorage", {
  getItem: (k: string) => values.get(k) || null,
  setItem: (k: string, v: string) => values.set(k, v),
});

beforeEach(async () => {
  clearOrderTimers();
  await resetDatabase();

  getCart("collector-1").items = [
    { nftId: "042", edition: "1/50", quantity: 2 },
  ];
});

const payload = () => ({
  quoteId: issueQuote("collector-1").id,
  walletId: "collector-1-main",
  collector: { name: "Nova", email: "nova@kurio.test", note: "" },
});

describe("invariantes de compra", () => {
  it("a mesma tentativa retorna o mesmo pedido e reserva estoque uma vez", () => {
    const data = payload();
    const first = createOrder("collector-1", "attempt", data);
    const second = createOrder("collector-1", "attempt", data);

    expect(second.order.id).toBe(first.order.id);
    expect(second.created).toBe(false);
    expect(db.nfts[0].editions["1/50"]).toBe(48);
  });

  it("recusa reutilização de chave com conteúdo diferente", () => {
    const data = payload();

    createOrder("collector-1", "attempt", data);

    expect(() =>
      createOrder("collector-1", "attempt", {
        ...data,
        walletId: "collector-1-reserve",
      }),
    ).toThrow("outro conteúdo");
  });

  it("preço alterado invalida a cotação", () => {
    const data = payload();

    db.nfts[0].price = "2.00";
    db.nfts[0].version++;

    expect(() => createOrder("collector-1", "attempt", data)).toThrow(
      "mudaram",
    );

    expect(Object.keys(db.orders)).toHaveLength(0);
  });

  it("recibo é imutável e remove apenas quantidades compradas", () => {
    const { order } = createOrder("collector-1", "attempt", payload());

    getCart("collector-1").items[0].quantity = 3;
    db.nfts[0].price = "9.00";
    order.resolvesAt = 0;
    resolveOrder(order);
    expect(order.quote.total).toBe("2.396");
    expect(getCart("collector-1").items[0].quantity).toBe(1);
    resolveOrder(order);
    expect(getCart("collector-1").items[0].quantity).toBe(1);
  });

  it("pagamento recusado devolve a reserva e preserva o carrinho", () => {
    db.demo.scenario = "payment-declined";

    const { order } = createOrder("collector-1", "attempt", payload());

    order.resolvesAt = 0;
    resolveOrder(order);
    expect(order.status).toBe("declined");
    expect(getCart("collector-1").items[0].quantity).toBe(2);
    expect(db.nfts[0].editions["1/50"]).toBe(50);
  });
});
