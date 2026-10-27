import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Wallet } from "../../../shared/domain/models";
import { http, errorMessage } from "../../../shared/api/client";
import { Button } from "../../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../shared/ui/dialog";

export function WalletSelector({
  wallets,
  selected,
  connected,
  onSelect,
  onConnection,
}: {
  wallets: Wallet[];
  selected: string;
  connected: boolean;
  onSelect: (id: string) => void;
  onConnection: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  const m = useMutation({
    mutationFn: (decision: string) =>
      http.post("/connections", { walletId: selected, decision }),
    onSuccess: () => {
      onConnection(true);
      setOpen(false);
      toast.success("Carteira conectada na simulação.");
    },
    onError: (e) => {
      onConnection(false);
      toast.error(errorMessage(e));
      setOpen(false);
    },
  });

  return (
    <section className="wallet-selector">
      <div className="section-heading">
        <h2>{connected ? "Carteira conectada" : "Selecione sua carteira"}</h2>
        <Link to="/wallets">Trocar carteira</Link>
      </div>
      {!wallets.length ? (
        <p>
          Cadastre uma carteira para continuar.{" "}
          <Link to="/wallets">Adicionar carteira</Link>
        </p>
      ) : (
        wallets.map((w) => (
          <label
            className={`wallet-option ${selected === w.id ? "selected" : ""}`}
            key={w.id}
          >
            <input
              type="radio"
              name="wallet"
              checked={selected === w.id}
              onChange={() => {
                onSelect(w.id);
                onConnection(false);
              }}
            />
            <span>
              <b>{w.name}</b>
              <small>
                {w.ens || `${w.address.slice(0, 6)}…${w.address.slice(-4)}`}
              </small>
              <small>Rede {w.network}</small>
            </span>
            <span className="wallet-type">{w.type}</span>
          </label>
        ))
      )}
      {selected && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => (connected ? onConnection(false) : setOpen(true))}
        >
          {connected ? "Desconectar carteira" : "Conectar carteira"}
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Conectar carteira</DialogTitle>
          <DialogDescription>
            Conexão simulada. Nenhuma extensão ou transação real será utilizada.
          </DialogDescription>
          <div className="dialog-actions">
            <Button
              variant="outline"
              disabled={m.isPending}
              onClick={() => m.mutate("decline")}
            >
              Recusar conexão
            </Button>
            <Button disabled={m.isPending} onClick={() => m.mutate("accept")}>
              Autorizar conexão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
