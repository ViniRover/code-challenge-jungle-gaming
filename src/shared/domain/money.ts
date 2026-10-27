const UNIT = 10n ** 18n;
export function toWei(value: string): bigint {
  if (!/^\d+(\.\d{1,18})?$/.test(value)) throw new Error("Valor ETH inválido");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * UNIT + BigInt(fraction.padEnd(18, "0"));
}
export function fromWei(value: bigint): string {
  if (value < 0n) throw new Error("Valor negativo");
  const fraction = (value % UNIT)
    .toString()
    .padStart(18, "0")
    .replace(/0+$/, "");
  return `${value / UNIT}.${fraction || "00"}`;
}
export const multiply = (value: string, quantity: number) => {
  if (!Number.isSafeInteger(quantity) || quantity < 0)
    throw new Error("Quantidade inválida");
  return fromWei(toWei(value) * BigInt(quantity));
};
export const eth = (value: string) => `${value} ETH`;
