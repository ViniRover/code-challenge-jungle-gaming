import type { Quote } from "../../../shared/domain/models";
import { eth } from "../../../shared/domain/money";

export function Totals({ quote }: { quote: Quote }) {
  return (
    <dl className="totals">
      <div>
        <dt>Subtotal</dt>
        <dd>{eth(quote.subtotal)}</dd>
      </div>
      <div>
        <dt>Desconto do lançamento</dt>
        <dd>(−) {quote.discount}</dd>
      </div>
      <div>
        <dt>Taxa de rede</dt>
        <dd>{eth(quote.fee)}</dd>
      </div>
      <div className="fee-note">
        <dt className="sr-only">Informação sobre a taxa</dt>
        <dd>Taxa estimada</dd>
      </div>
      <div className="total">
        <dt>Total</dt>
        <dd>{eth(quote.total)}</dd>
      </div>
    </dl>
  );
}
