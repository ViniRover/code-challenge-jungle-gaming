import { Minus, Plus } from "lucide-react";

export function Quantity({
  value,
  max,
  onChange,
  disabled = false,
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="quantity">
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={16} />
      </button>
      <output aria-label="Quantidade">{value}</output>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
