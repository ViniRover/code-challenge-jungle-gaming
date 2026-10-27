import { test, expect } from "@playwright/test";
import { reset, addItem } from "./helpers";

test("demo flutuante altera preço sem sair do carrinho e devolve foco ao fechar", async ({
  page,
}) => {
  await reset(page);
  await addItem(page);
  await expect(page.locator(".connection-status")).toContainText("Conectado");

  const url = page.url();
  const launcher = page.getByRole("button", { name: "Abrir demonstração" });

  await launcher.click();

  const panel = page.getByRole("dialog", { name: "Cenários da demonstração" });

  await expect(panel).toBeVisible();
  await expect(page).toHaveURL(url);

  await panel
    .getByRole("button", { name: "Alterar preço", exact: true })
    .click();

  await expect(page.locator(".total dd")).toHaveText("1.506 ETH");
  await expect(panel).toBeVisible();
  await expect(page).toHaveURL(url);

  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);

  await page.screenshot({
    path: `artifacts/preview/demo-${page.viewportSize()?.width}.png`,
  });

  await panel.getByRole("button", { name: "Fechar demonstração" }).click();
  await expect(panel).not.toBeVisible();
  await expect(launcher).toBeFocused();
  await launcher.click();
  await page.keyboard.press("Escape");
  await expect(panel).not.toBeVisible();
  await expect(launcher).toBeFocused();
});

test("link antigo de demo abre o painel e cenários podem ser restaurados", async ({
  page,
}) => {
  await reset(page);
  await page.goto("/demo");

  const panel = page.getByRole("dialog", { name: "Cenários da demonstração" });

  await expect(panel).toBeVisible();
  await panel.getByLabel("Cenário da simulação").selectOption("empty");
  await expect(page.getByText("Nenhum NFT encontrado")).toBeVisible();
  await panel.getByLabel("Cenário da simulação").selectOption("standard");
  await expect(page.locator(".nft-grid .nft-card")).toHaveCount(9);
  await expect(panel).toBeVisible();
});
