import { test, expect } from "@playwright/test";

test.describe("TokenCraft Smoke Tests", () => {
  test("redirects / to the canonical tool route", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/tools\/tokencraft$/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("first viewport carries the prompt, the count and the fit", async ({ page }) => {
    await page.goto("/tools/tokencraft");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Token counter/i);
    await expect(page.getByLabel("Your prompt")).toBeVisible();
    await expect(page.getByRole("region", { name: "Context window" })).toBeVisible();
    // Never a fake zero: the count resolves from "Counting…" to a real number
    await expect(page.locator("#answer-panel [aria-live=polite]").first()).toHaveText(/^[1-9][\d,]*$/);
  });

  test("layout stays within the viewport at 2560 and 390 wide", async ({ page }) => {
    for (const [width, height] of [
      [2560, 1440],
      [390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto("/tools/tokencraft");
      await expect(page.getByLabel("Your prompt")).toBeVisible();
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);
    }
  });

  test("Cmd+K palette opens and closes", async ({ page }) => {
    await page.goto("/tools/tokencraft");
    await expect(page.getByLabel("Your prompt")).toBeVisible();

    const palette = page.getByRole("dialog", { name: "Commands" });
    await page.keyboard.press("ControlOrMeta+k");
    await expect(palette).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(palette).not.toBeVisible();
  });
});
