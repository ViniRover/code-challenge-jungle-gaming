import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useCart, useCartMutation, useQuote } from "../hooks";
import { CartRow } from "../components/cart-row";
import { Totals } from "../components/totals";
import { CouponForm } from "../components/coupon-form";
import { buttonVariants, Button } from "../../../shared/ui/button";
import { EmptyState, ErrorState, Skeleton } from "../../../shared/ui/feedback";
import { RelatedNfts } from "../../catalog/components/related-nfts";
import { usePageTitle } from "../../../shared/hooks/use-page-title";
export default function CartPage() {
  usePageTitle("Carrinho de NFTs");
  const cart = useCart();
  const quote = useQuote();
  const m = useCartMutation();
  if (cart.isPending)
    return (
      <div role="status" aria-label="Carregando carrinho">
        <Skeleton className="cart-skeleton" />
      </div>
    );
  if (cart.isError)
    return <ErrorState error={cart.error} retry={() => cart.refetch()} />;
  return (
    <>
      <p className="breadcrumb">Início / Mercado / Carrinho</p>
      <h1 className="mobile-page-title">
        <Link to="/" aria-label="Voltar">
          <ArrowLeft />
        </Link>
        Carrinho de NFTs
      </h1>
      {!cart.data.items.length ? (
        <EmptyState title="Seu carrinho está vazio">
          <p>Encontre a próxima peça da sua coleção.</p>
          <Link to="/" className={buttonVariants()}>
            Explorar NFTs
          </Link>
        </EmptyState>
      ) : (
        <div className="cart-layout">
          <section aria-label="Itens do carrinho">
            <div className="cart-table-head">
              <span>NFTs</span>
              <span>Preço</span>
              <span>Edições</span>
              <span>Total</span>
            </div>
            {cart.data.items.map((line) => (
              <CartRow
                key={`${line.nftId}:${line.edition}`}
                line={line}
                pending={m.isPending}
                onChange={(quantity) =>
                  m.mutate({
                    version: cart.data.version,
                    items: cart.data.items.map((i) =>
                      i === line ? { ...i, quantity } : i,
                    ),
                  })
                }
                onRemove={() =>
                  m.mutate({
                    version: cart.data.version,
                    items: cart.data.items.filter((i) => i !== line),
                  })
                }
              />
            ))}
            {m.isError && <ErrorState error={m.error} />}
          </section>
          <aside className="cart-summary">
            <h2>Resumo da carteira</h2>
            <CouponForm applied={cart.data.coupon} />
            {quote.isPending ? (
              <Skeleton className="summary-skeleton" />
            ) : quote.isError ? (
              <ErrorState error={quote.error} retry={() => quote.refetch()} />
            ) : (
              quote.data && <Totals quote={quote.data} />
            )}
            {quote.isFetching && (
              <span className="sr-only" role="status">
                Atualizando cotação
              </span>
            )}
            {quote.data && !quote.isError ? (
              <Link
                to="/checkout"
                className={buttonVariants({ className: "w-full", size: "lg" })}
              >
                Conectar e finalizar
              </Link>
            ) : (
              <Button className="w-full" disabled>
                Revise seu carrinho
              </Button>
            )}
            <Link to="/" className="continue-shopping">
              Continuar explorando
            </Link>
          </aside>
        </div>
      )}
      <RelatedNfts title="Colecionadores também viram" />
    </>
  );
}
