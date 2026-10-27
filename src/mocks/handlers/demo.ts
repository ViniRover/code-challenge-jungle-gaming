import { http } from "msw";
import { endpoint } from "./endpoint";
import { db, persist, resetDatabase, tokenFrom } from "../database";
import { clearOrderTimers, resolveOrder } from "../services/order-service";
import { disconnectClients } from "../socket";
import { publish } from "../events";
import type { DemoConfig } from "../../shared/domain/models";
export const demoHandlers = [
  http.get(
    "/api/__demo",
    endpoint(() => db.demo),
  ),
  http.post(
    "/api/__demo/reset",
    endpoint(async () => {
      clearOrderTimers();
      disconnectClients();
      await resetDatabase();
      return { ok: true };
    }),
  ),
  http.put(
    "/api/__demo",
    endpoint(async (request) => {
      const data = (await request.json()) as Partial<DemoConfig>;
      db.demo = { ...db.demo, ...data };
      if (data.scenario === "expired-session") {
        const token = tokenFrom(request);
        if (token && db.sessions[token]) db.sessions[token].expiresAt = 0;
      }
      persist();
      return db.demo;
    }),
  ),
  http.post(
    "/api/__demo/event",
    endpoint(async (request) => {
      const {
        type,
        nftId = "042",
        price = "1.49",
        edition = "1/50",
      } = (await request.json()) as {
        type: string;
        nftId?: string;
        price?: string;
        edition?: "1/50";
      };
      if (type === "disconnect") {
        disconnectClients();
        return { ok: true };
      }
      if (type === "resolve-order") {
        Object.values(db.orders)
          .filter((o) => o.status === "pending")
          .forEach((o) => {
            o.resolvesAt = Date.now();
            resolveOrder(o);
          });
        return { ok: true };
      }
      const nft = db.nfts.find((n) => n.id === nftId)!;
      if (type === "price") nft.price = price;
      if (type === "stock") nft.editions[edition] = 0;
      nft.version++;
      persist();
      const event = publish("nft.updated", nft);
      if (type === "duplicate") {
        publish("nft.updated", nft, { id: event.id });
        publish(
          "nft.updated",
          { ...nft, price: "0.01", version: nft.version - 1 },
          { version: nft.version - 1 },
        );
      }
      return event;
    }),
  ),
];
