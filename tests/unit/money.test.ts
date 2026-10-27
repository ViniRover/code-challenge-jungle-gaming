import { describe, it, expect } from "vitest";
import { fromWei, toWei, multiply } from "../../src/shared/domain/money";

describe("precisão ETH", () => {
  it("soma 0.1 + 0.2 sem erro de ponto flutuante", () =>
    expect(fromWei(toWei("0.1") + toWei("0.2"))).toBe("0.3"));

  it("preserva o wei e grandes valores", () =>
    expect(fromWei(toWei("999999999999.000000000000000001"))).toBe(
      "999999999999.000000000000000001",
    ));

  it("multiplica quantidades inteiras", () =>
    expect(multiply("1.19", 2)).toBe("2.38"));

  it("rejeita valores negativos e frações de quantidade", () => {
    expect(() => toWei("-1")).toThrow();
    expect(() => multiply("1.00", 1.5)).toThrow();
  });
});
