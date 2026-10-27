import { applyFormErrors } from "../../../shared/api/form-errors";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Wallet } from "../../../shared/domain/models";
import { walletSchema } from "../../../shared/domain/validation";
import { accountApi } from "../api";
import { useIdentity } from "../../auth/hooks";
import { keys } from "../../../shared/api/keys";
import { Field } from "../../../shared/ui/field";
import { Button } from "../../../shared/ui/button";
import { ErrorState } from "../../../shared/ui/feedback";
export function WalletForm({
  wallet,
  onSaved,
}: {
  wallet: Wallet;
  onSaved: () => void;
}) {
  const owner = useIdentity();
  const qc = useQueryClient();
  const form = useForm<Wallet>({
    resolver: zodResolver(walletSchema),
    defaultValues: wallet,
  });
  const m = useMutation({
    mutationFn: accountApi.saveWallet,
    onError: (error) => applyFormErrors(error, form.setError),
    onSuccess: (wallets) => {
      qc.setQueryData(keys.wallets(owner), wallets);
      toast.success("Carteira salva.");
      onSaved();
    },
  });
  return (
    <form onSubmit={form.handleSubmit((data) => m.mutate(data))} noValidate>
      <div className="form-grid">
        <Field
          label="Nome de exibição"
          id="wallet-name"
          required
          {...form.register("name")}
          error={form.formState.errors.name?.message}
        />
        <Field
          label="Nome do perfil"
          id="wallet-profile"
          required
          {...form.register("profileName")}
          error={form.formState.errors.profileName?.message}
        />
        <Field label="Rede" id="wallet-network">
          <select id="wallet-network" {...form.register("network")}>
            <option>Ethereum</option>
            <option>Polygon</option>
            <option>Solana</option>
          </select>
        </Field>
        <Field
          label="Endereço da carteira"
          id="wallet-address"
          required
          placeholder="Endereço 0x da carteira"
          {...form.register("address")}
          error={form.formState.errors.address?.message}
        />
        <Field label="Tipo de carteira" id="wallet-type">
          <select id="wallet-type" {...form.register("type")}>
            <option>MetaMask</option>
            <option>WalletConnect</option>
            <option>Coinbase Wallet</option>
          </select>
        </Field>
        <Field
          label="Código de indicação"
          id="wallet-referral"
          required
          {...form.register("referral")}
          error={form.formState.errors.referral?.message}
        />
        <Field
          label="E-mail"
          id="wallet-email"
          required
          type="email"
          {...form.register("email")}
          error={form.formState.errors.email?.message}
        />
        <Field
          label="Nome ENS (opcional)"
          id="wallet-ens"
          {...form.register("ens")}
          error={form.formState.errors.ens?.message}
        />
      </div>
      <label className="checkbox-label">
        <input type="checkbox" {...form.register("primary")} />
        Usar como carteira principal
      </label>
      {m.isError && <ErrorState error={m.error} />}
      <Button type="submit" disabled={m.isPending}>
        Salvar carteira
      </Button>
    </form>
  );
}
