import lighthouse from "lighthouse";

import { chromium } from "@playwright/test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import os from "node:os";

const base = process.env.AUDIT_URL || "http://127.0.0.1:4173";

await mkdir("artifacts/lighthouse", { recursive: true });

const results = [];
let chromiumVersion = "";
const runs = Number(process.env.AUDIT_RUNS || 3);

for (const page of [
  { name: "home", path: "/" },
  { name: "detail", path: "/nft/042" },
])
  for (const profile of ["mobile", "desktop"]) {
    for (let i = 1; i <= runs; i++) {
      const browser = await chromium.launch({
        headless: true,
        args: ["--remote-debugging-port=9223"],
      });

      const chrome = { port: 9223, kill: () => browser.close() };

      chromiumVersion = browser.version();

      try {
        const config = {
          extends: "lighthouse:default",
          settings: {
            onlyCategories: [
              "performance",
              "accessibility",
              "best-practices",
              "seo",
            ],
            formFactor: profile,
            screenEmulation:
              profile === "desktop"
                ? {
                    mobile: false,
                    width: 1440,
                    height: 1000,
                    deviceScaleFactor: 1,
                    disabled: false,
                  }
                : {
                    mobile: true,
                    width: 390,
                    height: 844,
                    deviceScaleFactor: 1,
                    disabled: false,
                  },
            ...(profile === "desktop"
              ? {
                  throttling: {
                    rttMs: 40,
                    throughputKbps: 10240,
                    cpuSlowdownMultiplier: 1,
                    requestLatencyMs: 0,
                    downloadThroughputKbps: 0,
                    uploadThroughputKbps: 0,
                  },
                }
              : {}),
            maxWaitForLoad: 45000,
          },
        };

        const result = await lighthouse(
          base + page.path,
          { port: chrome.port, output: ["html", "json"], logLevel: "error" },
          config,
        );

        const stem = `${page.name}-${profile}-${i}`;

        await writeFile(`artifacts/lighthouse/${stem}.html`, result.report[0]);
        await writeFile(`artifacts/lighthouse/${stem}.json`, result.report[1]);

        const lhr = result.lhr;

        const row = {
          page: page.name,
          profile,
          run: i,
          scores: Object.fromEntries(
            Object.entries(lhr.categories).map(([k, v]) => [
              k,
              Math.round(v.score * 100),
            ]),
          ),
          metrics: {
            LCP: lhr.audits["largest-contentful-paint"].numericValue,
            CLS: lhr.audits["cumulative-layout-shift"].numericValue,
            TBT: lhr.audits["total-blocking-time"].numericValue,
          },
          warnings: lhr.runWarnings,
        };

        results.push(row);
        console.log(JSON.stringify(row));
      } finally {
        await chrome.kill();
      }
    }
  }

const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const medians = [];

for (const page of ["home", "detail"])
  for (const profile of ["mobile", "desktop"]) {
    const rows = results.filter(
      (r) => r.page === page && r.profile === profile,
    );

    medians.push({
      page,
      profile,
      scores: Object.fromEntries(
        Object.keys(rows[0].scores).map((k) => [
          k,
          median(rows.map((r) => r.scores[k])),
        ]),
      ),
      metrics: Object.fromEntries(
        Object.keys(rows[0].metrics).map((k) => [
          k,
          median(rows.map((r) => r.metrics[k])),
        ]),
      ),
    });
  }

const packageJson = JSON.parse(
  await readFile("node_modules/lighthouse/package.json", "utf8"),
);

await writeFile(
  "artifacts/lighthouse/summary.json",
  JSON.stringify(
    {
      date: new Date().toISOString(),
      environment: {
        os: os.platform(),
        release: os.release(),
        cpu: os.cpus()[0]?.model,
        node: process.version,
        lighthouse: packageJson.version,
        chromium: chromiumVersion,
        url: base,
        scenario: "standard",
        build: "production",
      },
      runs: results,
      medians,
    },
    null,
    2,
  ),
);
