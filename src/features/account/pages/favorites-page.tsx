import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useFavorites } from "../hooks";
import { AccountLayout } from "../../../widgets/layout/account-layout";
import { catalogApi } from "../../catalog/api";
import { NftCard } from "../../catalog/components/nft-card";
import { keys } from "../../../shared/api/keys";
import {
  EmptyState,
  ErrorState,
  LoadingGrid,
} from "../../../shared/ui/feedback";
import { usePageTitle } from "../../../shared/hooks/use-page-title";

export default function FavoritesPage() {
  usePageTitle("Lista de interesse");

  const favorites = useFavorites();

  const queries = useQueries({
    queries: (favorites.data || []).map((id) => ({
      queryKey: keys.nft(id),
      queryFn: () => catalogApi.detail(id),
    })),
  });

  return (
    <AccountLayout>
      <h1>Lista de interesse</h1>
      {favorites.isPending ? (
        <LoadingGrid />
      ) : favorites.isError ? (
        <ErrorState error={favorites.error} retry={() => favorites.refetch()} />
      ) : !favorites.data.length ? (
        <EmptyState title="Sua lista está vazia">
          <Link to="/">Explorar NFTs</Link>
        </EmptyState>
      ) : (
        <div className="nft-grid">
          {queries.map((q, i) =>
            q.data ? (
              <NftCard key={q.data.id} nft={q.data} />
            ) : q.isError ? (
              <ErrorState key={i} error={q.error} />
            ) : null,
          )}
        </div>
      )}
    </AccountLayout>
  );
}
