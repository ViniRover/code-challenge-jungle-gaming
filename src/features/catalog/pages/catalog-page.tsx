import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { catalogApi } from "../api";
import { keys } from "../../../shared/api/keys";
import type { CatalogSearch } from "../../../shared/domain/models";
import {
  LoadingGrid,
  EmptyState,
  ErrorState,
} from "../../../shared/ui/feedback";
import { Button } from "../../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../shared/ui/dialog";
import { NftCard } from "../components/nft-card";
import { Filters } from "../components/filters";
import { Hero } from "../components/hero";
import { Editorial } from "../components/editorial";
import { usePageTitle } from "../../../shared/hooks/use-page-title";

export default function CatalogPage() {
  usePageTitle("Marketplace de NFTs");

  const search = useSearch({ strict: false }) as CatalogSearch;
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const update = (patch: CatalogSearch) =>
    navigate({ to: "/", search: { ...search, ...patch } });

  const query = useQuery({
    queryKey: keys.catalog(search),
    queryFn: ({ signal }) => catalogApi.list(search, signal),
  });

  const pages = Math.ceil((query.data?.total || 0) / 9);

  return (
    <>
      <div className="mobile-search">
        <Search size={20} />
        <input
          aria-label="Explorar coleções"
          placeholder="Explorar coleções"
          value={search.q || ""}
          onChange={(e) => update({ q: e.target.value, page: 1 })}
        />
        <Button
          size="icon"
          aria-label="Abrir filtros"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal />
        </Button>
      </div>
      <Hero />
      <section className="catalog-layout" id="catalogo">
        <aside className="desktop-filters">
          <Filters search={search} onChange={update} />
          <div className="featured-ad">
            <h3>NFT EM DESTAQUE</h3>
            <b>OFERTA LIMITADA</b>
            <img
              src="/assets/violet.webp"
              alt="NFT em destaque"
              width="300"
              height="360"
              loading="lazy"
            />
          </div>
        </aside>
        <div className="catalog-content">
          <div className="catalog-toolbar">
            <div className="catalog-tabs" aria-label="Seleção do catálogo">
              {[
                ["all", "Todos os NFTs"],
                ["new", "Novos lançamentos"],
                ["trending", "Em alta"],
              ].map(([tab, label]) => (
                <button
                  className={(search.tab || "all") === tab ? "active" : ""}
                  aria-pressed={(search.tab || "all") === tab}
                  key={tab}
                  onClick={() => update({ tab, page: 1 })}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="sort-label">
              Ordenar por:
              <select
                aria-label="Ordenar NFTs"
                value={search.sort || "recent"}
                onChange={(e) => update({ sort: e.target.value, page: 1 })}
              >
                <option value="recent">Listados recentemente</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
              </select>
            </label>
          </div>
          <div className="catalog-search">
            <Search size={17} />
            <input
              id="catalog-search"
              aria-label="Buscar NFTs"
              placeholder="Buscar NFTs…"
              value={search.q || ""}
              onChange={(e) => update({ q: e.target.value, page: 1 })}
            />
            {query.isFetching && !query.isPending && (
              <span role="status">Atualizando…</span>
            )}
          </div>
          {query.isPending ? (
            <LoadingGrid />
          ) : query.isError ? (
            <ErrorState error={query.error} retry={() => query.refetch()} />
          ) : query.data.total === 0 ? (
            <EmptyState title="Nenhum NFT encontrado">
              <p>Experimente outra busca ou limpe os filtros.</p>
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/", search: {} })}
              >
                Limpar busca
              </Button>
            </EmptyState>
          ) : (
            <>
              <div className="nft-grid">
                {query.data.items.map((nft, i) => (
                  <NftCard key={nft.id} nft={nft} priority={i < 3} />
                ))}
              </div>
              <nav className="pagination" aria-label="Páginas do catálogo">
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    key={i}
                    aria-label={`Página ${i + 1}`}
                    aria-current={
                      (search.page || 1) === i + 1 ? "page" : undefined
                    }
                    onClick={() => update({ page: i + 1 })}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={(search.page || 1) >= pages}
                  aria-label="Próxima página"
                  onClick={() => update({ page: (search.page || 1) + 1 })}
                >
                  ›
                </button>
              </nav>
            </>
          )}
        </div>
      </section>
      <Editorial />
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="filter-drawer">
          <DialogTitle>Filtrar NFTs</DialogTitle>
          <DialogDescription>
            Combine coleção, faixa de preço e rede.
          </DialogDescription>
          <Filters search={search} onChange={update} />
          <Button className="w-full" onClick={() => setFiltersOpen(false)}>
            Ver resultados
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
