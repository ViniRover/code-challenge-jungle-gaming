import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { toast } from "sonner";
import { useSession, useIdentity } from "../../auth/hooks";
import { useWallets } from "../../account/hooks";
import { useCart, useQuote } from "../../cart/hooks";
import { cartApi } from "../../cart/api";
import { collectorSchema } from "../../../shared/domain/validation";
import type { OrderRequest, Quote } from "../../../shared/domain/models";
import { orderApi } from "../api";
import { attemptStorage, type Attempt } from "../attempt-storage";
import { Totals } from "../../cart/components/totals";
import { OrderLines } from "../components/order-lines";
import { WalletSelector } from "../components/wallet-selector";
import { Field } from "../../../shared/ui/field";
import { Button } from "../../../shared/ui/button";
import { ErrorState, Skeleton, EmptyState } from "../../../shared/ui/feedback";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../shared/ui/dialog";
import { usePageTitle } from "../../../shared/hooks/use-page-title";
import { draftStorage } from "../draft-storage";

export default function CheckoutPage() {
  usePageTitle("Pagamento");

  const owner = useIdentity();
  const { data: session } = useSession();
  const cart = useCart();
  const quote = useQuote();
  const wallets = useWallets();

  const [selected, setSelected] = useState(
    () => draftStorage.get(owner)?.walletId || "",
  );

  const [connected, setConnected] = useState(false);
  const [review, setReview] = useState<Quote | null>(null);

  const [recovery, setRecovery] = useState<Attempt | null>(() =>
    attemptStorage.get(owner),
  );

  const [recoveryError, setRecoveryError] = useState<unknown>(null);
  const navigate = useNavigate();
  const submitting = useRef(false);

  const form = useForm<OrderRequest["collector"]>({
    resolver: zodResolver(collectorSchema),
    defaultValues: draftStorage.get(owner)?.collector || {
      name: session?.user.name || "",
      email: session?.user.email || "",
      note: "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) =>
      draftStorage.set(owner, {
        walletId: selected,
        collector: {
          name: values.name || "",
          email: values.email || "",
          note: values.note || "",
        },
      }),
    );

    return () => subscription.unsubscribe();
  }, [form, owner, selected]);

  useEffect(() => {
    draftStorage.set(owner, {
      walletId: selected,
      collector: form.getValues(),
    });
  }, [selected, owner, form]);

  const wallet = wallets.data?.find((w) => w.id === selected);

  const recover = async (attempt: Attempt) => {
    try {
      const order = await orderApi.attempt(attempt.key);

      navigate({ to: "/order/$id", params: { id: order.id } });
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        attemptStorage.clear(owner);
        setRecovery(null);
      } else setRecoveryError(e);
    }
  };

  useEffect(() => {
    const attempt = attemptStorage.get(owner);

    if (attempt) recover(attempt);
  }, [owner]);

  const purchase = useMutation({
    mutationFn: async () => {
      const latest = await cartApi.quote();

      if (!review || latest.fingerprint !== review.fingerprint) {
        setReview(null);
        await quote.refetch();

        throw new Error(
          "A cotação mudou. Revise os novos valores e confirme novamente.",
        );
      }

      const attempt: Attempt = {
        key: crypto.randomUUID(),
        request: {
          quoteId: latest.id,
          walletId: selected,
          collector: form.getValues(),
        },
      };

      attemptStorage.set(owner, attempt);
      setRecovery(attempt);

      try {
        return await orderApi.create(attempt.key, attempt.request);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.status < 500
        ) {
          attemptStorage.clear(owner);
          setRecovery(null);

          throw error;
        }

        return await orderApi.attempt(attempt.key);
      }
    },
    onSuccess: (order) =>
      navigate({ to: "/order/$id", params: { id: order.id } }),
    onError: () => {
      submitting.current = false;
      setReview(null);
    },
  });

  if (recovery && !purchase.isPending)
    return (
      <div className="recovery-panel">
        <h1>Recuperando sua compra</h1>
        <p>
          A tentativa anterior será consultada antes de enviar outro pedido.
        </p>
        {recoveryError ? (
          <ErrorState error={recoveryError} retry={() => recover(recovery)} />
        ) : (
          <Skeleton className="summary-skeleton" />
        )}
        {purchase.isError && (
          <ErrorState error={purchase.error} retry={() => recover(recovery)} />
        )}
      </div>
    );

  if (cart.data && !cart.data.items.length)
    return (
      <EmptyState title="Seu carrinho está vazio">
        <Link to="/">Explorar NFTs</Link>
      </EmptyState>
    );

  return (
    <>
      <p className="breadcrumb">Início / Mercado / Pagamento</p>
      <h1 className="mobile-page-title">Pagamento com carteira</h1>
      <div className="checkout-layout">
        <section>
          <h1 className="desktop-checkout-title">Perfil do colecionador</h1>
          <form
            id="checkout-form"
            onSubmit={form.handleSubmit(async () => {
              if (!connected) {
                toast.error("Conecte sua carteira para continuar.");

                return;
              }

              const latest = await quote.refetch();

              if (latest.data) setReview(latest.data);
            })}
            noValidate
          >
            <div className="form-grid collector-fields">
              <Field
                id="collector-name"
                label="Nome de exibição"
                required
                {...form.register("name")}
                error={form.formState.errors.name?.message}
              />
              <Field
                id="collector-user"
                label="Nome de usuário"
                value={session?.user.username || ""}
                readOnly
              />
              <Field
                id="collector-network"
                label="Rede"
                value={wallet?.network || "Selecione uma carteira"}
                readOnly
              />
              <Field
                id="collector-profile"
                label="Nome do perfil"
                value={wallet?.profileName || ""}
                readOnly
              />
              <Field
                id="collector-address"
                label="Endereço da carteira"
                value={wallet?.address || ""}
                readOnly
              />
              <Field
                id="collector-ens"
                label="Nome ENS"
                value={wallet?.ens || ""}
                readOnly
              />
              <Field
                id="collector-type"
                label="Tipo de carteira"
                value={wallet?.type || ""}
                readOnly
              />
              <Field
                id="collector-code"
                label="Código de indicação"
                value={wallet?.referral || ""}
                readOnly
              />
              <Field
                id="collector-email"
                label="E-mail"
                type="email"
                required
                {...form.register("email")}
                error={form.formState.errors.email?.message}
              />
            </div>
            <Field
              id="collector-note"
              label="Observação do colecionador (opcional)"
              error={form.formState.errors.note?.message}
            >
              <textarea
                id="collector-note"
                {...form.register("note")}
                rows={5}
              />
            </Field>
          </form>
          {wallets.isError ? (
            <ErrorState error={wallets.error} retry={() => wallets.refetch()} />
          ) : (
            <WalletSelector
              wallets={wallets.data || []}
              selected={selected}
              connected={connected}
              onSelect={setSelected}
              onConnection={setConnected}
            />
          )}
        </section>
        <aside className="checkout-summary">
          <h2>Seus NFTs</h2>
          {quote.isPending ? (
            <Skeleton className="summary-skeleton" />
          ) : quote.isError ? (
            <ErrorState error={quote.error} retry={() => quote.refetch()} />
          ) : (
            quote.data && (
              <>
                <OrderLines items={quote.data.items} />
                <Link to="/cart" className="coupon-link">
                  Tem um código promocional? Aplique aqui
                </Link>
                <Totals quote={quote.data} />
              </>
            )
          )}
          {purchase.isError && <ErrorState error={purchase.error} />}
          <Button
            className="w-full"
            size="lg"
            form="checkout-form"
            type="submit"
            disabled={
              !connected ||
              !quote.data ||
              quote.isError ||
              quote.isFetching ||
              purchase.isPending
            }
          >
            Revisar compra
          </Button>
        </aside>
      </div>
      <Dialog
        open={!!review}
        onOpenChange={(open) => {
          if (!open && !purchase.isPending) setReview(null);
        }}
      >
        <DialogContent className="review-dialog">
          <DialogTitle>Revise sua compra</DialogTitle>
          <DialogDescription>
            Confira os NFTs, a carteira e os valores antes de confirmar.
          </DialogDescription>
          {review && (
            <>
              <OrderLines items={review.items} />
              <Totals quote={review} />
              <p>
                Carteira: {wallet?.name} · {wallet?.network}
              </p>
              <p>Recebedor: {form.getValues("name")}</p>
              {quote.data?.fingerprint !== review.fingerprint && (
                <p role="alert" className="field-error">
                  A cotação mudou. Feche esta revisão e confira os novos
                  valores.
                </p>
              )}
              <Button
                className="w-full"
                disabled={
                  purchase.isPending ||
                  !connected ||
                  quote.data?.fingerprint !== review.fingerprint
                }
                onClick={() => {
                  if (submitting.current) return;

                  submitting.current = true;
                  purchase.mutate();
                }}
              >
                {purchase.isPending ? "Enviando pedido…" : "Confirmar compra"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
