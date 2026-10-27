import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api";
import { keys } from "../../shared/api/keys";
import { tokenStore } from "../../shared/api/client";
import type { Session } from "../../shared/domain/models";
export function useSession() {
  return useQuery({
    queryKey: keys.session,
    queryFn: ({ signal }) => authApi.session(signal),
    retry: false,
    staleTime: 30000,
  });
}
export function useIdentity() {
  const { data } = useSession();
  return data?.user.id || "guest";
}
export function useSessionActions() {
  const qc = useQueryClient();
  return {
    accept: async (session: Session) => {
      await qc.cancelQueries();
      qc.removeQueries({ queryKey: ["private"] });
      tokenStore.set(session.token);
      qc.setQueryData(keys.session, session);
    },
    logout: async () => {
      await authApi.logout();
      tokenStore.clear();
      await qc.cancelQueries();
      qc.removeQueries({ queryKey: ["private"] });
      qc.setQueryData(keys.session, null);
    },
  };
}
