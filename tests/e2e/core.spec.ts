import { test, expect } from "@playwright/test";
import { reset, login, addItem, prepareCheckout, request } from "./helpers";
test.beforeEach(async ({ page }) => reset(page));
test("catálogo, acesso direto e carrinho persistente", async ({ page }) => {
  await addItem(page);
  await expect(page.locator(".total dd")).toHaveText("1.206 ETH");
  await page.reload();
  await expect(page.locator(".cart-row")).toHaveCount(1);
  await page.goto("/nft/inexistente");
  await expect(page.getByRole("alert")).toContainText("NFT não encontrado");
});
test("compra completa com recibo e snapshot", async ({ page }) => {
  await login(page);
  await addItem(page);
  await prepareCheckout(page);
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();
  await expect(page).toHaveURL(/\/order\//);
  await expect(
    page.getByRole("heading", {
      name: "Seus NFTs agora estão na sua carteira",
    }),
  ).toBeVisible();
  await expect(page.locator(".receipt .total dd")).toHaveText("1.206 ETH");
  await request(page, "/__demo/event", "POST", {
    type: "price",
    nftId: "042",
    price: "2.00",
  });
  await page.reload();
  await expect(page.locator(".receipt .total dd")).toHaveText("1.206 ETH");
  await page.goto("/cart");
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
});
