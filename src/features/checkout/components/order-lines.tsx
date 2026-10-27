import type { QuoteLine } from "../../../shared/domain/models";
import { eth } from "../../../shared/domain/money";
export function OrderLines({ items }: { items: QuoteLine[] }) {
  return (
    <div className="order-lines">
      {items.map((line) => (
        <div className="order-line" key={`${line.nftId}:${line.edition}`}>
          <img src={line.image} alt="" width="70" height="70" />
          <div>
            <b>{line.name}</b>
            <small>ID do token: #{line.nftId}</small>
            <small>Edição: {line.edition}</small>
          </div>
          <span>(× {line.quantity})</span>
          <strong>{eth(line.total)}</strong>
        </div>
      ))}
    </div>
  );
}
