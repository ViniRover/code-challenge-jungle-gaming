import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "./api";
import { useIdentity } from "../auth/hooks";
import { keys } from "../../shared/api/keys";
export function useWallets() {
  const owner = useIdentity();
  return useQuery({
    queryKey: keys.wallets(owner),
    queryFn: ({ signal }) => accountApi.wallets(signal),
    enabled: owner !== "guest",
  });
}
export function useFavorites() {
  const owner = useIdentity();
  return useQuery({
    queryKey: keys.favorites(owner),
    queryFn: ({ signal }) => accountApi.favorites(signal),
    enabled: owner !== "guest",
  });
}
export function useFavoriteMutation() {
  const owner = useIdentity();
  const qc = useQueryClient();
  const key = keys.favorites(owner);
  return useMutation({
    mutationFn: ({ id, selected }: { id: string; selected: boolean }) =>
      accountApi.favorite(id, selected),
    onMutate: async ({ id, selected }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<string[]>(key);
      qc.setQueryData<string[]>(key, (old) =>
        selected
          ? [...new Set([...(old || []), id])]
          : (old || []).filter((i) => i !== id),
      );
      return { previous };
    },
    onError: (_e, _v, context) => qc.setQueryData(key, context?.previous || []),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
