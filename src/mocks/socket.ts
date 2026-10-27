import { ws } from "msw";
import { toSocketIo } from "@mswjs/socket.io-binding";
import { sessionFor } from "./database";
import { observeEvents } from "./events";
// MSW normalizes Socket.IO's /socket.io/ path to / before matching.
const channel = ws.link("wss://kurio.mock/");
const closers = new Set<() => void>();
export function disconnectClients() {
  closers.forEach((close) => close());
}
export const socketHandler = channel.addEventListener(
  "connection",
  (connection) => {
    const socket = toSocketIo(connection);
    const heartbeat = setInterval(() => connection.client.send("2"), 20000);
    let token: string | null = null;
    socket.client.on("subscribe", (_event, payload: { token?: string }) => {
      token = payload?.token || null;
      socket.client.emit("subscribed", {
        userId: sessionFor(token)?.userId || null,
      });
    });
    const unobserve = observeEvents((name, event) => {
      if (event.userId && event.userId !== sessionFor(token)?.userId) return;
      socket.client.emit(name, event);
    });
    const close = () => connection.client.close(1012, "Simulated reconnect");
    closers.add(close);
    connection.client.addEventListener("close", () => {
      clearInterval(heartbeat);
      unobserve();
      closers.delete(close);
    });
  },
);
