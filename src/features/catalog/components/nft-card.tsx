import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingCart, Search } from "lucide-react";
import { toast } from "sonner";
import type { Nft } from "../../../shared/domain/models";
import { eth } from "../../../shared/domain/money";
import { useFavoriteMutation, useFavorites } from "../../account/hooks";
import { useIdentity } from "../../auth/hooks";
import { errorMessage } from "../../../shared/api/client";
export function NftCard({
  nft,
  priority = false,
}: {
  nft: Nft;
  priority?: boolean;
}) {
  const owner = useIdentity();
  const favorites = useFavorites();
  const favorite = useFavoriteMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const selected = favorites.data?.includes(nft.id) || false;
  return (
    <article className="nft-card">
      <div className="nft-art">
        <Link
          to="/nft/$id"
          params={{ id: nft.id }}
          aria-label={`Ver ${nft.name}`}
        >
          <img
            src={nft.image}
            alt={nft.name}
            width="400"
            height="400"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </Link>
        {nft.previousPrice && <span className="rarity">RARO</span>}
        <button
          className={`favorite-icon ${selected ? "selected" : ""}`}
          aria-label={`${selected ? "Remover" : "Adicionar"} ${nft.name} ${selected ? "dos" : "aos"} favoritos`}
          aria-pressed={selected}
          disabled={favorite.isPending}
          onClick={() => {
            if (owner === "guest") {
              navigate({ to: "/login", search: { redirect: location.href } });
              return;
            }
            favorite.mutate(
              { id: nft.id, selected: !selected },
              { onError: (error) => toast.error(errorMessage(error)) },
            );
          }}
        >
          <Heart size={20} fill={selected ? "currentColor" : "none"} />
        </button>
        <div className="card-actions">
          <Link
            to="/nft/$id"
            params={{ id: nft.id }}
            aria-label={`Comprar ${nft.name}`}
          >
            <ShoppingCart size={20} />
          </Link>
          <Link
            to="/nft/$id"
            params={{ id: nft.id }}
            aria-label={`Ampliar ${nft.name}`}
          >
            <Search size={20} />
          </Link>
        </div>
      </div>
      <Link to="/nft/$id" params={{ id: nft.id }} className="nft-name">
        {nft.name}
      </Link>
      <div className="card-price">
        <strong>{eth(nft.price)}</strong>
        {nft.previousPrice && <del>{eth(nft.previousPrice)}</del>}
      </div>
    </article>
  );
}
