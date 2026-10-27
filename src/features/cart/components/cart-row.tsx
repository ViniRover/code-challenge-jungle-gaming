import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { CartLine } from "../../../shared/domain/models";
import { catalogApi } from "../../catalog/api";
import { keys } from "../../../shared/api/keys";
import { eth, multiply } from "../../../shared/domain/money";
import { Quantity } from "../../../shared/ui/quantity";
import { Skeleton } from "../../../shared/ui/feedback";
export function CartRow({
  line,
  onChange,
  onRemove,
  pending,
}: {
  line: CartLine;
  onChange: (q: number) => void;
  onRemove: () => void;
  pending: boolean;
}) {
  const { data: nft } = useQuery({
    queryKey: keys.nft(line.nftId),
    queryFn: ({ signal }) => catalogApi.detail(line.nftId, signal),
  });
  if (!nft) return <Skeleton className="cart-row-skeleton" />;
  return (
    <article className="cart-row">
      <Link to="/nft/$id" params={{ id: nft.id }}>
        <img src={nft.image} alt={nft.name} width="80" height="80" />
      </Link>
      <div className="cart-item-name">
        <Link to="/nft/$id" params={{ id: nft.id }}>
          <b>{nft.name}</b>
        </Link>
        <p>Edição: {line.edition}</p>
        <span className="mobile-item-total">
          {eth(multiply(nft.price, line.quantity))}
        </span>
        {line.quantity > nft.editions[line.edition] && (
          <span className="field-error">Disponibilidade alterada</span>
        )}
      </div>
      <span className="cart-unit-price">{eth(nft.price)}</span>
      <Quantity
        value={line.quantity}
        max={nft.editions[line.edition]}
        onChange={onChange}
        disabled={pending}
      />
      <strong className="cart-line-total">
        {eth(multiply(nft.price, line.quantity))}
      </strong>
      <button
        className="remove-item"
        aria-label={`Remover ${nft.name}`}
        onClick={onRemove}
        disabled={pending}
      >
        <Trash2 size={19} />
      </button>
    </article>
  );
}
