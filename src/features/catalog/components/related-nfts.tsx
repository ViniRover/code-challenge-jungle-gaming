import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../api";
import { keys } from "../../../shared/api/keys";
import { NftCard } from "./nft-card";

export function RelatedNfts({
  exclude = "",
  title = "Mais desta coleção",
}: {
  exclude?: string;
  title?: string;
}) {
  const { data } = useQuery({
    queryKey: keys.catalog({}),
    queryFn: ({ signal }) => catalogApi.list({}, signal),
  });

  return (
    <section className="related">
      <h2>{title}</h2>
      <div className="related-grid">
        {data?.items
          .filter((n) => n.id !== exclude)
          .slice(3, 8)
          .map((n) => (
            <NftCard key={n.id} nft={n} />
          ))}
      </div>
      <div className="carousel-dots" aria-hidden="true">
        ○ ● ○
      </div>
    </section>
  );
}
