import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http, tokenStore } from "../../shared/api/client";
import type { DemoConfig, Scenario } from "../../shared/domain/models";
import { Button } from "../../shared/ui/button";
import { toast } from "sonner";
import { ErrorState } from "../../shared/ui/feedback";

const scenarios: Scenario[] = [
  "standard",
  "empty",
  "slow",
  "out-of-order",
  "offline",
  "server-error",
  "forbidden",
  "favorite-error",
  "expired-session",
  "coupon-expired",
  "payment-declined",
  "order-timeout",
  "pending-order",
];

export default function DemoControls() {
  const qc = useQueryClient();

  const config = useQuery({
    queryKey: ["demo"],
    queryFn: () => http.get<DemoConfig>("/__demo").then((r) => r.data),
  });

  const [nftId, setNftId] = useState("042");

  const action = useMutation({
    mutationFn: (execute: () => Promise<void>) => execute(),
  });

  const run = async (type: string) => {
    await http.post("/__demo/event", { type, nftId });
    toast.info("Evento enviado pela conexão Socket.IO simulada.");
  };

  return (
    <section className="demo-controls">
      <p>
        Controles para avaliação. Dados e conexões são simulados no navegador
        com MSW.
      </p>
      {config.isError && (
        <ErrorState error={config.error} retry={() => config.refetch()} />
      )}
      {action.isError && <ErrorState error={action.error} />}
      <fieldset disabled={action.isPending || config.isPending}>
        <label>
          Cenário
          <select
            aria-label="Cenário da simulação"
            value={config.data?.scenario || "standard"}
            onChange={(e) => {
              const scenario = e.target.value;

              action.mutate(async () => {
                await http.put("/__demo", { scenario });
                await qc.invalidateQueries();
              });
            }}
          >
            {scenarios.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          NFT afetado
          <input value={nftId} onChange={(e) => setNftId(e.target.value)} />
        </label>
        <div className="demo-actions">
          {[
            ["price", "Alterar preço"],
            ["stock", "Esgotar edição 1/50"],
            ["duplicate", "Enviar duplicata e evento antigo"],
            ["disconnect", "Interromper conexão"],
            ["resolve-order", "Resolver pedido pendente"],
          ].map(([type, label]) => (
            <Button
              key={type}
              variant="outline"
              onClick={() => action.mutate(() => run(type))}
            >
              {label}
            </Button>
          ))}
        </div>
        <Button
          onClick={() =>
            action.mutate(async () => {
              await http.post("/__demo/reset");
              tokenStore.clear();

              Object.keys(sessionStorage)
                .filter((k) => k.startsWith("kurio."))
                .forEach((k) => sessionStorage.removeItem(k));

              Object.keys(localStorage)
                .filter((k) => k.startsWith("kurio.attempt."))
                .forEach((k) => localStorage.removeItem(k));

              qc.clear();
              location.assign("/");
            })
          }
        >
          Restaurar cenário inicial
        </Button>
      </fieldset>
      <p>
        Usuários: nova@kurio.test e luna@kurio.test. Senha fictícia: Kurio123!
      </p>
      <p>Cupom válido: KURIO10. Cupom expirado: EXPIRADO.</p>
    </section>
  );
}
