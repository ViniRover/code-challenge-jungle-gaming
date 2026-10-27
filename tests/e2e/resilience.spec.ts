import { test, expect } from "@playwright/test";
import { reset, login, request, addItem, prepareCheckout } from "./helpers";
test.beforeEach(async ({ page }) => reset(page));
test("respostas fora de ordem não substituem a busca mais recente", async ({
  page,
  isMobile,
}) => {
  await request(page, "/__demo", "PUT", { scenario: "out-of-order" });
  const search = page.getByRole("textbox", {
    name: isMobile ? "Explorar coleções" : "Buscar NFTs",
    exact: true,
  });
  await search.fill("E");
  await search.fill("Ivory");
  await expect(page.locator(".nft-grid .nft-card")).toHaveCount(4);
  await expect(page.locator(".nft-grid .nft-name").first()).toContainText(
    "Ivory",
  );
  await page.reload();
  await expect(page.locator(".nft-grid .nft-name").first()).toContainText(
    "Ivory",
  );
});
test("falha de conexão recupera após nova tentativa", async ({ page }) => {
  await request(page, "/__demo", "PUT", { scenario: "offline" });
  await page.goto("/nft/042");
  await expect(page.getByRole("alert")).toContainText("Sem conexão");
  await request(page, "/__demo", "PUT", { scenario: "standard" });
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042" }),
  ).toBeVisible();
});
test("edição esgotada e limite de quantidade", async ({ page }) => {
  await page.goto("/nft/042");
  await page.getByRole("button", { name: "1/1", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Aumentar quantidade" }),
  ).toBeDisabled();
  await request(page, "/__demo/event", "POST", { type: "stock", nftId: "042" });
  await expect(
    page.getByRole("button", { name: "1/50", exact: true }),
  ).toBeDisabled();
});
test("cliques repetidos não criam pedidos duplicados e pedidos são privados", async ({
  page,
}) => {
  await login(page);
  await addItem(page);
  await prepareCheckout(page);
  let calls = 0;
  page.on("request", (r) => {
    if (
      !r.serviceWorker() &&
      r.method() === "POST" &&
      r.url().endsWith("/api/orders")
    )
      calls++;
  });
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click({ clickCount: 2 });
  await expect(
    page.getByRole("heading", {
      name: "Seus NFTs agora estão na sua carteira",
    }),
  ).toBeVisible();
  expect(calls).toBe(1);
  const orderPath = new URL(page.url()).pathname;
  await page.goto("/profile");
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await login(page, "luna@kurio.test");
  await page.goto(orderPath);
  await expect(page.getByRole("alert")).toContainText("Pedido não encontrado");
});
test("avatar é salvo e restaurado após refresh", async ({ page }) => {
  await login(page);
  await page.locator("#avatar").setInputFiles("public/assets/emerald.webp");
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(
    page.getByText("Perfil atualizado.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByAltText("Seu avatar")).toBeVisible();
  await page.getByRole("button", { name: "Remover", exact: true }).click();
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(
    page.getByText("Perfil atualizado.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByAltText("Seu avatar")).not.toBeVisible();
});
