import { test, expect } from "@playwright/test";
import { reset, login, addItem, prepareCheckout, request } from "./helpers";

test.beforeEach(async ({ page }) => reset(page));

test("busca, filtros combinados, ordenação, paginação e histórico", async ({
  page,
  isMobile,
}) => {
  await page.getByRole("button", { name: "Página 2", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator(".nft-grid .nft-card")).toHaveCount(9);
  await page.reload();
  await expect(page).toHaveURL(/page=2/);

  if (isMobile)
    await page.getByRole("button", { name: "Abrir filtros" }).click();

  await page
    .getByRole("button", { name: "Arte digital (4)", exact: true })
    .click();

  await page
    .getByRole("button", { name: "Ethereum (12)", exact: true })
    .click();

  if (isMobile)
    await page.getByRole("button", { name: "Ver resultados" }).click();

  await expect(page).toHaveURL(/page=1/);
  await expect(page.locator(".nft-grid .nft-card")).toHaveCount(4);
  await page.goto("/?sort=price-asc");

  await expect(page.locator(".nft-grid .card-price strong").first()).toHaveText(
    "0.39 ETH",
  );

  await page
    .getByRole("textbox", {
      name: isMobile ? "Explorar coleções" : "Buscar NFTs",
      exact: true,
    })
    .fill("xyz-não-existe");

  await expect(page.getByText("Nenhum NFT encontrado")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".nft-grid .nft-card")).toHaveCount(9);
});

test("cadastro, conflito e senha com validação", async ({ page }) => {
  await page.goto("/register");
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();

  await expect(
    page.getByText("Informe pelo menos 2 caracteres."),
  ).toBeVisible();

  await page
    .getByLabel("Nome de usuário", { exact: true })
    .fill("Novo Colecionador");

  await page.getByLabel("E-mail", { exact: true }).fill("nova@kurio.test");
  await page.getByLabel("Senha", { exact: true }).fill("NovaSenha123!");

  await page
    .getByLabel("Confirmar senha", { exact: true })
    .fill("NovaSenha123!");

  await page.getByRole("button", { name: "Criar conta", exact: true }).click();

  await expect(page.locator("#auth-email-error")).toContainText(
    "já está cadastrado",
  );

  await page.getByLabel("E-mail", { exact: true }).fill("novo@kurio.test");
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.reload();

  await expect(
    page.getByLabel("Nome de exibição", { exact: true }),
  ).toHaveValue("Novo Colecionador");
});

test("favorito otimista com rollback e isolamento entre usuários", async ({
  page,
}) => {
  await login(page);
  await page.goto("/nft/042");
  await request(page, "/__demo", "PUT", { scenario: "favorite-error" });

  const favorite = page
    .getByRole("button", { name: /^Favoritar/ })
    .filter({ visible: true })
    .first();

  await favorite.click();

  await expect(
    page.getByText("Não foi possível salvar o favorito.", { exact: true }),
  ).toBeVisible();

  await request(page, "/__demo", "PUT", { scenario: "standard" });
  await favorite.click();

  await expect(
    page.getByText("Favorito salvo.", { exact: true }),
  ).toBeVisible();

  await page.goto("/favorites");
  await expect(page.locator(".nft-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await login(page, "luna@kurio.test");
  await page.goto("/favorites");
  await expect(page.getByText("Sua lista está vazia")).toBeVisible();
});

test("carrinho mescla visitante ao login, cupom e remoção", async ({
  page,
}) => {
  await addItem(page);
  await page.getByRole("button", { name: "Aumentar quantidade" }).click();
  await expect(page.locator(".total dd")).toHaveText("2.396 ETH");
  await page.getByLabel("Código promocional", { exact: true }).fill("INVALIDO");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("inválido");
  await page.getByLabel("Código promocional", { exact: true }).fill("KURIO10");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(page.locator(".total dd")).toHaveText("2.158 ETH");
  await login(page, "nova@kurio.test", "Kurio123!", "/cart");
  await expect(page.locator(".total dd")).toHaveText("2.158 ETH");
  await page.reload();
  await expect(page.locator(".cart-row")).toHaveCount(1);
  await page.getByRole("button", { name: "Remover cupom" }).click();
  await expect(page.locator(".total dd")).toHaveText("2.396 ETH");
  await page.getByRole("button", { name: "Remover Emerald Ape #042" }).click();
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
});

test("sessão expira no checkout e retoma contexto", async ({ page }) => {
  await login(page);
  await addItem(page);
  await page.goto("/checkout");
  await request(page, "/__demo", "PUT", { scenario: "expired-session" });
  await page.reload();
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("E-mail", { exact: true }).fill("nova@kurio.test");
  await page.getByLabel("Senha", { exact: true }).fill("Kurio123!");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole("radio").first()).toBeVisible();
});

test("pagamento recusado preserva carrinho", async ({ page }) => {
  await login(page);
  await addItem(page);

  await request(page, "/__demo", "PUT", {
    scenario: "payment-declined",
    paymentDelay: 400,
  });

  await prepareCheckout(page);

  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();

  await expect(
    page.getByRole("heading", { name: "Pagamento recusado" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Voltar ao carrinho" }).click();
  await expect(page.locator(".cart-row")).toHaveCount(1);
});

test("timeout após criação recupera o mesmo pedido", async ({ page }) => {
  await login(page);
  await addItem(page);

  await request(page, "/__demo", "PUT", {
    scenario: "order-timeout",
    paymentDelay: 1000,
  });

  await prepareCheckout(page);

  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Seus NFTs agora estão na sua carteira",
    }),
  ).toBeVisible({ timeout: 20000 });

  const url = page.url();

  await page.reload();
  await expect(page).toHaveURL(url);

  await expect(
    page.getByRole("heading", {
      name: "Seus NFTs agora estão na sua carteira",
    }),
  ).toBeVisible();
});

test("Socket.IO atualiza preço, ignora duplicatas e impede cotação antiga", async ({
  page,
}) => {
  await login(page);
  await addItem(page);
  await prepareCheckout(page);
  await expect(page.locator(".connection-status")).toContainText("Conectado");

  await request(page, "/__demo/event", "POST", {
    type: "price",
    nftId: "042",
    price: "1.49",
  });

  await expect(
    page.getByText(
      "A cotação mudou. Feche esta revisão e confira os novos valores.",
    ),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Confirmar compra", exact: true }),
  ).toBeDisabled();

  await page.getByRole("button", { name: "Fechar", exact: true }).click();

  await expect(page.locator(".checkout-summary .total dd")).toHaveText(
    "1.506 ETH",
  );

  await request(page, "/__demo/event", "POST", {
    type: "duplicate",
    nftId: "042",
  });

  await expect(page.locator(".checkout-summary .total dd")).toHaveText(
    "1.506 ETH",
  );

  await request(page, "/__demo/event", "POST", { type: "stock", nftId: "042" });

  await expect(
    page.getByRole("alert").filter({ hasText: "edição indisponível" }),
  ).toBeVisible();
});

test("pedido pendente recupera após desconexão e refresh", async ({ page }) => {
  await login(page);
  await addItem(page);
  await request(page, "/__demo", "PUT", { scenario: "pending-order" });
  await prepareCheckout(page);

  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();

  await expect(
    page.getByRole("heading", { name: "Seu pedido está sendo processado" }),
  ).toBeVisible();

  const url = page.url();

  await request(page, "/__demo/event", "POST", { type: "disconnect" });
  await page.reload();
  await expect(page).toHaveURL(url);

  await expect(
    page.getByRole("heading", { name: "Seu pedido está sendo processado" }),
  ).toBeVisible();

  await request(page, "/__demo/event", "POST", { type: "resolve-order" });

  await expect(
    page.getByRole("heading", {
      name: "Seus NFTs agora estão na sua carteira",
    }),
  ).toBeVisible();
});

test("perfil, avatar, senha e carteira persistem", async ({ page }) => {
  await login(page);

  await page
    .getByLabel("Nome de exibição", { exact: true })
    .fill("Nova Atualizada");

  await page.getByRole("button", { name: "Salvar perfil" }).click();

  await expect(
    page.getByText("Perfil atualizado.", { exact: true }),
  ).toBeVisible();

  await page.getByLabel("Senha atual", { exact: true }).fill("errada");
  await page.getByLabel("Nova senha", { exact: true }).fill("Kurio456!");

  await page
    .getByLabel("Confirmar nova senha", { exact: true })
    .fill("Kurio456!");

  await page
    .getByRole("button", { name: "Alterar senha", exact: true })
    .click();

  await expect(page.locator(".error-state")).toContainText(
    "senha atual está incorreta",
  );

  await page.getByLabel("Senha atual", { exact: true }).fill("Kurio123!");

  await page
    .getByRole("button", { name: "Alterar senha", exact: true })
    .click();

  await expect(
    page.getByText("Senha alterada.", { exact: true }),
  ).toBeVisible();

  await page.goto("/wallets");

  await page
    .getByLabel("Endereço da carteira", { exact: true })
    .fill("invalid");

  await page.getByRole("button", { name: "Salvar carteira" }).click();

  await expect(
    page.getByText("Endereço incompatível com a rede selecionada."),
  ).toBeVisible();

  await page
    .getByLabel("Endereço da carteira", { exact: true })
    .fill("0x1111111111111111111111111111111111111111");

  await page.getByRole("button", { name: "Salvar carteira" }).click();

  await expect(
    page.getByText("Carteira salva.", { exact: true }),
  ).toBeVisible();

  await page.reload();

  await expect(
    page.getByLabel("Endereço da carteira", { exact: true }),
  ).toHaveValue("0x1111111111111111111111111111111111111111");
});

test("skeleton, erro transitório e recuperação", async ({ page }) => {
  await request(page, "/__demo", "PUT", { scenario: "slow" });
  await page.goto("/nft/042");

  await expect(
    page.getByRole("status", { name: "Carregando detalhe" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042" }),
  ).toBeVisible();

  await request(page, "/__demo", "PUT", { scenario: "server-error" });
  await page.goto("/");

  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Serviço temporariamente indisponível" }),
  ).toBeVisible();

  await request(page, "/__demo", "PUT", { scenario: "standard" });
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".nft-grid .nft-card")).toHaveCount(9);
});

test("teclado, foco preso no diálogo e ausência de overflow", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(page.getByRole("dialog")).toBeVisible();

  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Tab");

    await expect
      .poll(() =>
        page.evaluate(
          () => !!document.activeElement?.closest('[role="dialog"]'),
        ),
      )
      .toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });

    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  }
});
