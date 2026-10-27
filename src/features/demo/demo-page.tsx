import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { http, tokenStore } from "../../shared/api/client";
import type { DemoConfig, Scenario } from "../../shared/domain/models";
import { Button } from "../../shared/ui/button";
import { toast } from "sonner";
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
export default function DemoPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["demo"],
    queryFn: () => http.get<DemoConfig>("/__demo").then((r) => r.data),
  });
  const [nftId, setNftId] = useState("042");
  const run = async (type: string) => {
    await http.post("/__demo/event", { type, nftId });
    toast.info("Evento enviado pela conexão Socket.IO simulada.");
  };
  return (
    <section className="demo-page">
      <h1>Cenários da demonstração</h1>
      <p>
        Controles para avaliação. Dados e conexões são simulados no navegador
        com MSW.
      </p>
      <label>
        Cenário
        <select
          aria-label="Cenário da simulação"
          value={data?.scenario || "standard"}
          onChange={async (e) => {
            await http.put("/__demo", { scenario: e.target.value });
            qc.invalidateQueries();
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
          <Button key={type} variant="outline" onClick={() => run(type)}>
            {label}
          </Button>
        ))}
      </div>
      <Button
        onClick={async () => {
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
        }}
      >
        Restaurar cenário inicial
      </Button>
      <p>
        Usuários: nova@kurio.test e luna@kurio.test. Senha fictícia: Kurio123!
      </p>
      <p>Cupom válido: KURIO10. Cupom expirado: EXPIRADO.</p>
      <Link to="/">Voltar ao marketplace</Link>
    </section>
  );
}
