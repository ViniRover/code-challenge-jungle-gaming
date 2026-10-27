import { setupWorker } from "msw/browser";
import { initializeDatabase } from "./database";
import { restoreOrders } from "./services/order-service";
import { catalogHandlers } from "./handlers/catalog";
import { authHandlers } from "./handlers/auth";
import { cartHandlers } from "./handlers/cart";
import { accountHandlers, connectionHandlers } from "./handlers/account";
import { orderHandlers } from "./handlers/orders";
import { demoHandlers } from "./handlers/demo";
import { socketHandler } from "./socket";

export async function startMocks() {
  await initializeDatabase();

  const worker = setupWorker(
    ...catalogHandlers,
    ...authHandlers,
    ...cartHandlers,
    ...accountHandlers,
    ...connectionHandlers,
    ...orderHandlers,
    ...demoHandlers,
    socketHandler,
  );

  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
  restoreOrders();

  return worker;
}
