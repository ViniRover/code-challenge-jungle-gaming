import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api";
import { useIdentity } from "../../auth/hooks";
import { keys } from "../../../shared/api/keys";
import { Button } from "../../../shared/ui/button";
import { ErrorState } from "../../../shared/ui/feedback";
import { toast } from "sonner";

export function CouponForm({ applied }: { applied: string }) {
  const [code, setCode] = useState(applied);
  const owner = useIdentity();
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: cartApi.coupon,
    onSuccess: (cart) => {
      qc.setQueryData(keys.cart(owner), cart);
      toast.success(cart.coupon ? "Cupom aplicado." : "Cupom removido.");
    },
  });

  return (
    <div className="coupon-section">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate(code.trim().toUpperCase());
        }}
      >
        <label htmlFor="coupon">Código promocional</label>
        <div className="coupon-input">
          <input
            id="coupon"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Digite o código promocional…"
          />
          <Button type="submit" disabled={m.isPending}>
            Aplicar
          </Button>
        </div>
      </form>
      {applied && (
        <div className="coupon-applied">
          <span>{applied}</span>
          <button
            onClick={() => {
              setCode("");
              m.mutate("");
            }}
            disabled={m.isPending}
          >
            Remover cupom
          </button>
        </div>
      )}
      {m.isError && <ErrorState error={m.error} />}
    </div>
  );
}
