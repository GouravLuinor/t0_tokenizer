import { test, expect } from "@playwright/test";

test.describe("TokenCraft Smoke Tests", () => {
  test("redirects / to the canonical tool route", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/tools\/tokencraft$/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("loads workstation and verifies UI controls", async ({ page }) => {
    await page.goto("/tools/tokencraft");
    await expect(page.locator("body")).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Context Window Safety Gauge" })
    ).toBeVisible();
  });
});
