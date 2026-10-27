import { delay, http, HttpResponse } from "msw";
import { z } from "zod";
import { db, MockError, requireUser } from "../database";
import { endpoint } from "./endpoint";
import { createOrder, resolveOrder } from "../services/order-service";
import { collectorSchema } from "../../shared/domain/validation";

export const orderHandlers = [
  http.post(
    "/api/orders",
    endpoint(async (request) => {
      const user = requireUser(request);
      const key = request.headers.get("Idempotency-Key");

      if (!key || key.length > 100)
        throw new MockError("Chave de idempotência obrigatória.");

      const data = z
        .object({
          quoteId: z.string(),
          walletId: z.string(),
          collector: collectorSchema,
        })
        .parse(await request.json());

      const { order, created } = createOrder(user.id, key, data);

      if (created && db.demo.scenario === "order-timeout") await delay(9000);

      return HttpResponse.json(order, { status: created ? 201 : 200 });
    }),
  ),
  http.get(
    "/api/orders/:id",
    endpoint((request, { id }) => {
      const user = requireUser(request);
      const order = db.orders[String(id)];

      if (!order || order.userId !== user.id)
        throw new MockError("Pedido não encontrado.", 404, "NOT_FOUND");

      return resolveOrder(order);
    }),
  ),
  http.get(
    "/api/order-attempts/:key",
    endpoint((request, { key }) => {
      const user = requireUser(request);
      const attempt = db.attempts[`${user.id}:${key}`];

      if (!attempt)
        throw new MockError("Tentativa não encontrada.", 404, "NOT_FOUND");

      return resolveOrder(db.orders[attempt.orderId]);
    }),
  ),
];
