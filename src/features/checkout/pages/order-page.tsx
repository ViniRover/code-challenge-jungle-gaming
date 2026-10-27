import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { MailCheck, Clock3, CircleX } from "lucide-react";
import { useIdentity } from "../../auth/hooks";
import { keys } from "../../../shared/api/keys";
import { orderApi } from "../api";
import { attemptStorage } from "../attempt-storage";
import { Totals } from "../../cart/components/totals";
import { OrderLines } from "../components/order-lines";
import { ErrorState, Skeleton } from "../../../shared/ui/feedback";
import { Button, buttonVariants } from "../../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../shared/ui/dialog";
import { usePageTitle } from "../../../shared/hooks/use-page-title";
import { draftStorage } from "../draft-storage";

export default function OrderPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const owner = useIdentity();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: keys.order(owner, id),
    queryFn: ({ signal }) => orderApi.get(id, signal),
    refetchInterval: (q) => (q.state.data?.status === "pending" ? 2000 : false),
  });

  const [explorer, setExplorer] = useState(false);
  const order = query.data;

  usePageTitle(
    order?.status === "confirmed"
      ? "Pedido confirmado"
      : order?.status === "declined"
        ? "Pagamento recusado"
        : "Pedido pendente",
  );

  useEffect(() => {
    if (order && order.status !== "pending") {
      attemptStorage.clear(owner);

      if (order.status === "confirmed") draftStorage.clear(owner);

      qc.invalidateQueries({ queryKey: keys.cart(owner) });
    }
  }, [order?.status, owner, qc]);

  if (query.isPending) return <Skeleton className="receipt-skeleton" />;

  if (query.isError)
    return <ErrorState error={query.error} retry={() => query.refetch()} />;

  if (!order) return null;

  return (
    <section className="receipt">
      <div className="receipt-heading">
        {order.status === "confirmed" ? (
          <MailCheck size={72} />
        ) : order.status === "pending" ? (
          <Clock3 size={60} />
        ) : (
          <CircleX size={60} />
        )}
        <h1>
          {order.status === "confirmed"
            ? "Seus NFTs agora estão na sua carteira"
            : order.status === "pending"
              ? "Seu pedido está sendo processado"
              : "Pagamento recusado"}
        </h1>
      </div>
      <div className="receipt-meta">
        <div>
          <b>ID da transação</b>
          <span>
            {order.transaction.slice(0, 6)}…{order.transaction.slice(-4)}
          </span>
        </div>
        <div>
          Data
          <span>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>
        <div>
          Total<span>{order.quote.total} ETH</span>
        </div>
        <div>
          <b>Carteira</b>
          <span>{order.wallet.type}</span>
        </div>
      </div>
      <div className="receipt-body">
        <h2>Detalhes da transação</h2>
        <div className="receipt-columns">
          <span>NFTs</span>
          <span>Edições</span>
          <span>Subtotal</span>
        </div>
        <OrderLines items={order.quote.items} />
        <Totals quote={order.quote} />
        <p role="status">
          {order.status === "confirmed"
            ? "Transação confirmada na simulação. A propriedade foi transferida para sua carteira conectada e registrada na rede simulada."
            : order.status === "pending"
              ? "Você pode recarregar esta página. Recuperaremos o estado sem criar outra compra."
              : `${order.declineReason} Seus itens foram preservados no carrinho.`}
        </p>
        {order.status === "confirmed" ? (
          <Button onClick={() => setExplorer(true)}>Ver no Etherscan</Button>
        ) : order.status === "declined" ? (
          <Link to="/cart" className={buttonVariants()}>
            Voltar ao carrinho
          </Link>
        ) : (
          <Button variant="outline" onClick={() => query.refetch()}>
            Atualizar estado
          </Button>
        )}
        <Link className="receipt-home" to="/">
          Continuar explorando
        </Link>
      </div>
      <Dialog open={explorer} onOpenChange={setExplorer}>
        <DialogContent>
          <DialogTitle>Explorador simulado</DialogTitle>
          <DialogDescription>
            Esta referência pertence à demonstração. Nenhuma transação foi
            enviada para uma blockchain real.
          </DialogDescription>
          <code className="transaction-code">{order.transaction}</code>
          <p>Total confirmado: {order.quote.total} ETH</p>
        </DialogContent>
      </Dialog>
    </section>
  );
}
