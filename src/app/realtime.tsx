import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "../features/auth/hooks";
import { keys } from "../shared/api/keys";
import type { Nft, Order, ResourceEvent } from "../shared/domain/models";

export function Realtime() {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const owner = session?.user.id || "guest";
    let socket: Socket | undefined;
    let active = true;

    void import("socket.io-client").then(({ io }) => {
      if (!active) return;

      socket = io(import.meta.env.VITE_SOCKET_URL || "https://kurio.mock", {
        transports: ["websocket"],
        reconnectionDelay: 500,
        reconnectionDelayMax: 1500,
      });

      const versions = new Map<string, number>();

      socket.on("connect", () => {
        if (!active) return;

        setConnected(true);
        socket?.emit("subscribe", { token: session?.token });
        qc.invalidateQueries({ queryKey: ["catalog"] });
        qc.invalidateQueries({ queryKey: ["nft"] });
        qc.invalidateQueries({ queryKey: ["private", owner] });
      });

      socket.on("disconnect", () => {
        if (active) setConnected(false);
      });

      socket.on("nft.updated", (event: ResourceEvent<Nft>) => {
        if (!active) return;

        const cached = qc.getQueryData<Nft>(keys.nft(event.resourceId));

        const last = Math.max(
          versions.get(event.resourceId) || 0,
          cached?.version || 0,
        );

        if (event.version <= last) return;

        versions.set(event.resourceId, event.version);
        qc.setQueryData(keys.nft(event.resourceId), event.data);
        qc.invalidateQueries({ queryKey: ["catalog"] });
        qc.invalidateQueries({ queryKey: ["private", owner, "quote"] });

        toast.info(
          "Preço ou disponibilidade atualizados. Revise seu carrinho.",
          {
            id: `nft-${event.resourceId}`,
          },
        );
      });

      socket.on("order.updated", (event: ResourceEvent<Order>) => {
        if (!active || event.userId !== owner) return;

        const key = keys.order(owner, event.resourceId);
        const old = qc.getQueryData<Order>(key);

        if (old && (old.version >= event.version || old.status !== "pending"))
          return;

        qc.setQueryData(key, event.data);
        qc.invalidateQueries({ queryKey: keys.cart(owner) });
      });
    });

    return () => {
      active = false;
      socket?.removeAllListeners();
      socket?.disconnect();
    };
  }, [session?.token, session?.user.id, qc]);

  return (
    <span className="connection-status" role="status">
      <i className={connected ? "online" : ""} />
      {connected ? "Conectado" : "Reconectando…"}
    </span>
  );
}
