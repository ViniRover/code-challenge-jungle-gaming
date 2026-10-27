import { expect, type Page } from "@playwright/test";

export async function request(
  page: Page,
  path: string,
  method = "GET",
  body?: unknown,
) {
  await page.waitForFunction(
    () => document.documentElement.dataset.appReady === "true",
  );

  return page.evaluate(
    async ({ path, method, body }) => {
      const token = localStorage.getItem("kurio.session");

      const response = await fetch(`/api${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      return { status: response.status, data: await response.json() };
    },
    { path, method, body },
  );
}

export async function reset(page: Page) {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Ver Emerald Ape #042", exact: true }),
  ).toBeVisible();

  await request(page, "/__demo/reset", "POST");

  await page.evaluate(() => {
    localStorage.removeItem("kurio.session");

    Object.keys(localStorage)
      .filter((k) => k.startsWith("kurio.attempt."))
      .forEach((k) => localStorage.removeItem(k));
  });

  await page.reload();

  await expect(
    page.getByRole("link", { name: "Ver Emerald Ape #042", exact: true }),
  ).toBeVisible();
}

export async function login(
  page: Page,
  email = "nova@kurio.test",
  password = "Kurio123!",
  redirect = "/profile",
) {
  await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe(redirect);
}

export async function addItem(page: Page) {
  await page.goto("/nft/042");
  await page.getByRole("button", { name: "Comprar NFT", exact: true }).click();
  await expect(page).toHaveURL(/\/cart/);
  await expect(page.locator(".cart-row")).toHaveCount(1);
}

export async function prepareCheckout(page: Page) {
  await page.goto("/checkout");
  await page.getByRole("radio").first().check();

  await page
    .getByRole("button", { name: "Conectar carteira", exact: true })
    .click();

  await page.getByRole("button", { name: "Autorizar conexão" }).click();
  await page.getByRole("button", { name: "Revisar compra" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}
