import type { Nft, Order, ResourceEvent } from "../shared/domain/models";
type EventPayload = ResourceEvent<Nft> | ResourceEvent<Order>;
type Sink = (
  name: "nft.updated" | "order.updated",
  event: EventPayload,
) => void;
const sinks = new Set<Sink>();
export function observeEvents(sink: Sink) {
  sinks.add(sink);
  return () => sinks.delete(sink);
}
export function publish(
  name: "nft.updated" | "order.updated",
  data: Nft | Order,
  overrides: Partial<EventPayload> = {},
) {
  const event = {
    id: crypto.randomUUID(),
    resourceId: data.id,
    version: data.version,
    userId: "userId" in data ? data.userId : undefined,
    data: structuredClone(data),
    ...overrides,
  } as EventPayload;
  sinks.forEach((s) => s(name, event));
  return event;
}
