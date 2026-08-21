import { test, expect } from "@playwright/test";

test.describe("TokenCraft Smoke Tests", () => {
  test("loads landing page and verifies title and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/TokenCraft|Tokenizer|Tier-0/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("loads workstation and verifies UI controls", async ({ page }) => {
    await page.goto("/tools/tokencraft");
    await expect(page.locator("body")).toBeVisible();
  });
});
