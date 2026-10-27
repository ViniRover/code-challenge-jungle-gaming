import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("artifacts/preview", { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const width of [390, 768, 1440]) {
  const page = await browser.newPage({
    viewport: { width, height: 1000 },
    reducedMotion: "reduce",
  });
  page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
  await page.goto("http://127.0.0.1:4173/");
  await page
    .getByRole("link", { name: "Ver Emerald Ape #042", exact: true })
    .waitFor();
  await page.screenshot({
    path: `artifacts/preview/home-${width}.png`,
    fullPage: true,
  });
  await page.goto("http://127.0.0.1:4173/nft/042");
  await page.getByRole("heading", { name: "Emerald Ape #042" }).waitFor();
  await page.screenshot({
    path: `artifacts/preview/detail-${width}.png`,
    fullPage: true,
  });
  console.log(width, await page.locator(".connection-status").innerText());
  await page.close();
}
await browser.close();
