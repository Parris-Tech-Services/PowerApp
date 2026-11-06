/**
 * End-to-end, synthetic-only PowerApp smoke test.
 * Requires npm install --no-save playwright && npx playwright install chromium.
 * Do NOT use actual personal data, export screenshots or retain browser profiles.
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL = process.env.SMOKE_URL || "http://127.0.0.1:4173/PowerApp/";
const TEST_SECRET = "Synthetic-Test-Vault-Only-2026!";
const TEST_TITLE = "Synthetic QA entry — safe to delete";
const TEST_BODY = "Sample nonpersonal data for automated encryption testing.";
const VAULT_KEY = "powerapp:adult-vault:v1";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
let acceptNextDialog = false;
page.on("dialog", async (dialog) => { if (acceptNextDialog) { acceptNextDialog = false; await dialog.accept(); } else { await dialog.dismiss(); } });

try {
  await page.addInitScript(() => {
    localStorage.setItem("powerapp:hasOnboarded", "true");
    if (!localStorage.getItem("powerapp:activeTab")) localStorage.setItem("powerapp:activeTab", "learn");
  });
  const response = await page.goto(BASE_URL, { waitUntil: "load", timeout: 30000 });
  assert.equal(response?.status(), 200, "Live preview returned an HTTP error");
  const studioButton = page.getByRole("button", { name: "Studio", exact: true });
  assert.equal(await studioButton.locator(".nav-label").isVisible(), true, "Studio navigation label is hidden on a mobile screen.");
  await studioButton.click();
  await page.getByRole("heading", { name: "Our private intimacy studio" }).waitFor();
  await page.getByRole("heading", { name: "Create a private vault" }).waitFor();

  await page.getByRole("checkbox", { name: /I confirm I am at least 18/ }).check();
  await page.getByLabel("Vault passphrase").fill(TEST_SECRET);
  await page.getByLabel("Confirm passphrase").fill(TEST_SECRET);
  await page.getByRole("button", { name: "Create encrypted vault" }).click();
  await page.getByRole("heading", { name: "Adult intimacy library" }).waitFor();
  await page.getByRole("heading", { name: "Oral sex" }).waitFor();
  await page.getByRole("heading", { name: "Sex toys" }).waitFor();

  await page.getByRole("button", { name: "Journal", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill(TEST_TITLE);
  await page.getByLabel("Your own words").fill(TEST_BODY);
  const originalCiphertext = await page.evaluate((key) => localStorage.getItem(key), VAULT_KEY);
  await page.getByRole("button", { name: "Save encrypted entry" }).click();
  await page.getByText(TEST_BODY, { exact: true }).waitFor();
  await page.waitForFunction(([key, previous]) => {
    const next = localStorage.getItem(key);
    return next && next !== previous;
  }, [VAULT_KEY, originalCiphertext], { timeout: 15000 });

  const ciphertext = await page.evaluate((key) => localStorage.getItem(key), VAULT_KEY);
  assert.ok(ciphertext?.includes("AES-256-GCM"), "Encrypted vault envelope is missing");
  assert.ok(!ciphertext.includes(TEST_BODY), "Plaintext escaped into persisted browser storage");

  await page.reload({ waitUntil: "load" });
  await page.getByRole("heading", { name: "Unlock your private vault" }).waitFor();
  assert.equal(await page.getByText(TEST_BODY, { exact: true }).count(), 0, "Vault remained visible after reload");
  await page.getByLabel("Vault passphrase").fill(TEST_SECRET);
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await page.getByRole("button", { name: "Journal", exact: true }).click();
  await page.getByText(TEST_BODY, { exact: true }).waitFor();

  await page.getByRole("button", { name: "Our choices", exact: true }).click();
  await page.getByRole("button", { name: /Partner A — answer privately/ }).click();
  await page.locator("#vote-oral").selectOption("yes");
  await page.getByRole("button", { name: /Seal my answers/ }).click();
  await page.getByText("Partner A: sealed").waitFor();
  await page.getByRole("button", { name: /Partner A — reset sealed answers/ }).click();
  await page.getByText("Partner A: sealed").waitFor();
  assert.equal(await page.locator("#vote-oral").count(), 0, "Dismissed reset should not expose sealed ballot");

  await page.getByRole("button", { name: /Partner B — answer privately/ }).click();
  await page.locator("#vote-oral").selectOption("yes");
  await page.getByRole("button", { name: /Seal my answers/ }).click();
  await page.getByRole("button", { name: /Reveal mutual Yes matches/ }).click();
  await page.getByRole("heading", { name: "Mutual Yes interests" }).waitFor();
  assert.ok(await page.getByText("Oral sex", { exact: true }).count() > 0, "Mutual Yes was not shown after both partners sealed answers");

  // Settings-only Christian NSFW portal: independent unlock and adult confirmation.
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("heading", { name: "Settings" }).waitFor();
  await page.getByRole("button", { name: "Christian NSFW mode", exact: true }).click();
  await page.getByRole("heading", { name: "Christian NSFW portal" }).waitFor();
  await page.getByRole("heading", { name: "Unlock your private vault" }).waitFor();
  await page.getByLabel("Vault passphrase").fill(TEST_SECRET);
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await page.getByRole("heading", { name: "Christian NSFW mode · 18+" }).waitFor();
  await page.getByRole("checkbox", { name: "I am 18 or older and choose to enter." }).check();
  await page.getByRole("button", { name: "Enter Christian NSFW mode" }).click();
  await page.getByRole("heading", { name: "Adult intimacy library" }).waitFor();
  await page.getByRole("heading", { name: "Anal sex" }).waitFor();
  await page.getByRole("heading", { name: "Oral sex" }).waitFor();
  await page.getByRole("button", { name: "Our words", exact: true }).click();
  await page.getByLabel("Private title").fill("Synthetic covenant note");
  await page.getByLabel("Your words").fill("Synthetic note for privacy regression, not user data.");
  const oldEncrypted = await page.evaluate((key) => localStorage.getItem(key), VAULT_KEY);
  await page.getByRole("button", { name: "Save encrypted note" }).click();
  await page.getByText("Synthetic note for privacy regression, not user data.", { exact: true }).waitFor();
  await page.waitForFunction(([key, before]) => localStorage.getItem(key) !== before, [VAULT_KEY, oldEncrypted]);
  const newEncrypted = await page.evaluate((key) => localStorage.getItem(key), VAULT_KEY);
  assert.ok(!newEncrypted.includes("Synthetic note for privacy regression"), "Christian NSFW note leaked into localStorage plaintext.");

  // Private route must not be stored as the last active unencrypted tab.
  await page.reload({ waitUntil: "load" });
  await page.getByRole("heading", { name: "Settings" }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem("powerapp:activeTab")), "more");
  await page.getByRole("button", { name: "Christian NSFW mode", exact: true }).click();
  await page.getByRole("heading", { name: "Unlock your private vault" }).waitFor();
  await page.getByLabel("Vault passphrase").fill(TEST_SECRET);
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await page.getByRole("checkbox", { name: "I am 18 or older and choose to enter." }).check();
  await page.getByRole("button", { name: "Enter Christian NSFW mode" }).click();
  await page.getByRole("button", { name: "Our words", exact: true }).click();
  await page.getByText("Synthetic note for privacy regression, not user data.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Scene planner", exact: true }).click();
  await page.getByLabel("Plan title").fill("Synthetic scene plan");
  await page.getByLabel("Hard limits and things to avoid").fill("No pressure");
  await page.getByRole("button", { name: "Save encrypted plan" }).click();
  await page.getByText("Synthetic scene plan", { exact: false }).first().waitFor();
  await page.getByRole("button", { name: "Open stop-signal view" }).click();
  await page.getByRole("dialog", { name: "Stop-signal view" }).getByText("STOP IMMEDIATELY").waitFor();
  await page.getByRole("button", { name: "Close stop-signal view" }).click();
  await page.getByRole("button", { name: "Aftercare", exact: true }).click();
  await page.getByLabel("Who's reflecting?").selectOption("Partner A");
  await page.locator("#cnsfw-debrief-orgasmIntensity").selectOption("7");
  await page.locator("#cnsfw-debrief-pleasure").selectOption("8");
  await page.locator("#cnsfw-debrief-discomfort").selectOption("0");
  await page.getByRole("button", { name: "Save encrypted reflection" }).click();
  await page.getByText("Orgasm intensity: 7 / 10").waitFor();
  await page.getByText("Pleasure: 8 / 10").waitFor();
  await page.getByText("Discomfort: 0 / 10").waitFor();

  await page.keyboard.press("Escape");
  await page.getByRole("heading", { name: "Unlock your private vault" }).waitFor();
  await page.getByRole("button", { name: "Studio", exact: true }).click();
  await page.getByRole("heading", { name: "Unlock your private vault" }).waitFor();
  await page.getByLabel("Vault passphrase").fill(TEST_SECRET);
  await page.getByRole("button", { name: "Unlock", exact: true }).click();
  await page.getByRole("button", { name: "Journal", exact: true }).click();
  await page.getByText(TEST_BODY, { exact: true }).waitFor();

  await page.getByRole("button", { name: "Privacy", exact: true }).click();
  acceptNextDialog = true;
  await page.getByRole("button", { name: "Delete vault on this device" }).click();
  await page.getByRole("heading", { name: "Create a private vault" }).waitFor();
  assert.equal(await page.evaluate((key) => localStorage.getItem(key), VAULT_KEY), null, "Deletion left encrypted data behind");

  assert.deepEqual(errors, [], "The browser reported page-level JavaScript errors");
  console.log("PASS: mobile viewport, studio + Christian NSFW Settings portal, privacy-preserving route, encrypted notes, old data preserved, stop signals, Escape lock, ballots, matching, deletion.");
} finally {
  await context.close();
  await browser.close();
}
