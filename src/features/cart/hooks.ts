import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "./api";
import { keys } from "../../shared/api/keys";
import { useIdentity, useSession } from "../auth/hooks";
import type { Cart, CartLine } from "../../shared/domain/models";
export function useCart() {
  const owner = useIdentity();
  const session = useSession();
  return useQuery({
    queryKey: keys.cart(owner),
    queryFn: ({ signal }) => cartApi.get(signal),
    enabled: !session.isPending,
  });
}
export function useCartMutation() {
  const owner = useIdentity();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ items, version }: { items: CartLine[]; version: number }) =>
      cartApi.update(items, version),
    onSuccess: (cart: Cart) => {
      qc.setQueryData(keys.cart(owner), cart);
      qc.invalidateQueries({ queryKey: ["private", owner, "quote"] });
    },
    onError: () => qc.invalidateQueries({ queryKey: keys.cart(owner) }),
  });
}
export function useQuote() {
  const owner = useIdentity();
  const { data: cart } = useCart();
  return useQuery({
    queryKey: keys.quote(owner, cart?.version || 0),
    queryFn: ({ signal }) => cartApi.quote(signal),
    enabled: !!cart?.items.length,
    retry: false,
  });
}
