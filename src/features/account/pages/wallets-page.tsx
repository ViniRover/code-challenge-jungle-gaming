import { useState } from "react";
import { useWallets } from "../hooks";
import { useSession } from "../../auth/hooks";
import { AccountLayout } from "../../../widgets/layout/account-layout";
import { WalletForm } from "../components/wallet-form";
import type { Wallet } from "../../../shared/domain/models";
import { Button } from "../../../shared/ui/button";
import { ErrorState, Skeleton } from "../../../shared/ui/feedback";
import { usePageTitle } from "../../../shared/hooks/use-page-title";

export default function WalletsPage() {
  usePageTitle("Carteiras");

  const query = useWallets();
  const { data: session } = useSession();
  const [editing, setEditing] = useState<Wallet>();

  if (query.isPending) return <Skeleton className="detail-skeleton" />;

  if (query.isError)
    return <ErrorState error={query.error} retry={() => query.refetch()} />;

  const empty = (): Wallet => ({
    id: crypto.randomUUID(),
    name: "",
    address: "",
    network: "Ethereum",
    type: "MetaMask",
    primary: query.data.length === 0,
    profileName: session?.user.username || "",
    email: session?.user.email || "",
    ens: "",
    referral: "KURIO",
  });

  const primary = query.data.find((w) => w.primary) || query.data[0];
  const current = editing || primary || empty();

  return (
    <AccountLayout>
      <div className="section-heading">
        <h1>{current.primary ? "Carteira principal" : "Carteiras"}</h1>
        <Button variant="ghost" onClick={() => setEditing(empty())}>
          Adicionar
        </Button>
      </div>
      <p className="muted">
        Estas carteiras ficam disponíveis no pagamento e para receber NFTs
        comprados.
      </p>
      <div className="wallet-tabs">
        {query.data.map((w) => (
          <button
            key={w.id}
            aria-pressed={current.id === w.id}
            onClick={() => setEditing(w)}
          >
            {w.name} · {w.network}
          </button>
        ))}
      </div>
      <WalletForm
        key={current.id}
        wallet={current}
        onSaved={() => setEditing(undefined)}
      />
      <div className="secondary-wallet">
        <h2>Carteira secundária</h2>
        <p className="muted">
          {query.data.filter((w) => !w.primary).length
            ? "Selecione uma carteira acima para editar seus dados."
            : "Você ainda não adicionou uma carteira secundária."}
        </p>
        <Button
          variant="ghost"
          onClick={() => setEditing({ ...empty(), primary: false })}
        >
          Adicionar carteira secundária
        </Button>
      </div>
    </AccountLayout>
  );
}
