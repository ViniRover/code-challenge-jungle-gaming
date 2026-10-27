import { test, expect } from "@playwright/test";
import { reset, login, addItem } from "./helpers";

test("regressão visual de início, detalhe, carrinho e pagamento", async ({
  page,
}) => {
  await reset(page);
  await page.clock.setFixedTime(new Date("2026-07-29T12:00:00Z"));

  await expect(page).toHaveScreenshot("home.png", {
    fullPage: true,
    animations: "disabled",
    style: "[data-sonner-toast] { visibility: hidden !important; }",
    mask: [page.locator(".site-status")],
  });

  await page.goto("/nft/042");

  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042" }),
  ).toBeVisible();

  await expect(page).toHaveScreenshot("detail.png", {
    fullPage: true,
    animations: "disabled",
    style: "[data-sonner-toast] { visibility: hidden !important; }",
    mask: [page.locator(".site-status")],
  });

  await addItem(page);
  await expect(page.locator(".total dd")).toHaveText("1.206 ETH");

  await expect(page).toHaveScreenshot("cart.png", {
    fullPage: true,
    animations: "disabled",
    style: "[data-sonner-toast] { visibility: hidden !important; }",
    mask: [page.locator(".site-status"), page.locator("[data-sonner-toaster]")],
  });

  await login(page, "nova@kurio.test", "Kurio123!", "/checkout");
  await expect(page.getByRole("radio").first()).toBeVisible();

  await expect(page).toHaveScreenshot("checkout.png", {
    fullPage: true,
    animations: "disabled",
    style: "[data-sonner-toast] { visibility: hidden !important; }",
    mask: [page.locator(".site-status"), page.locator("[data-sonner-toaster]")],
  });
});
