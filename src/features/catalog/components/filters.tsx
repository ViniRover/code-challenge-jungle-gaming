import { useState } from "react";
import type { CatalogSearch } from "../../../shared/domain/models";
import { Button } from "../../../shared/ui/button";
const categories = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Colecionáveis",
  "Generativa",
  "Jogos",
  "Assinaturas",
  "Utilidade",
];
export function Filters({
  search,
  onChange,
}: {
  search: CatalogSearch;
  onChange: (patch: CatalogSearch) => void;
}) {
  const [min, setMin] = useState(search.min || "0.02");
  const [max, setMax] = useState(search.max || "12.30");
  return (
    <div className="filters">
      <h2>Coleções</h2>
      {categories.map((c) => (
        <button
          className={search.category === c ? "active" : ""}
          key={c}
          aria-pressed={search.category === c}
          onClick={() =>
            onChange({ category: search.category === c ? "" : c, page: 1 })
          }
        >
          <span>{c}</span>
          <span>(4)</span>
        </button>
      ))}
      <h2>Faixa de preço</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onChange({ min, max, page: 1 });
        }}
      >
        <label className="sr-only" htmlFor="min-price">
          Preço mínimo
        </label>
        <input
          id="min-price"
          type="range"
          min="0"
          max="12"
          step="0.01"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
        <div className="price-range">
          <label>
            Mín.
            <input
              aria-label="Preço mínimo em ETH"
              value={min}
              type="number"
              min="0"
              step="0.01"
              onChange={(e) => setMin(e.target.value)}
              required
            />
          </label>
          <label>
            Máx.
            <input
              aria-label="Preço máximo em ETH"
              value={max}
              type="number"
              min={min}
              step="0.01"
              onChange={(e) => setMax(e.target.value)}
              required
            />
          </label>
        </div>
        <Button size="sm" type="submit">
          Aplicar
        </Button>
      </form>
      <h2>Rede</h2>
      {["Ethereum", "Polygon", "Solana"].map((n) => (
        <button
          className={search.network === n ? "active" : ""}
          key={n}
          aria-pressed={search.network === n}
          onClick={() =>
            onChange({ network: search.network === n ? "" : n, page: 1 })
          }
        >
          <span>{n}</span>
          <span>(12)</span>
        </button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          onChange({ category: "", network: "", min: "", max: "", page: 1 })
        }
      >
        Limpar filtros
      </Button>
    </div>
  );
}
