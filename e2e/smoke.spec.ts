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

  test("full-bleed layout regression at 2560x1440", async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto("/tools/tokencraft");
    await expect(
      page.getByRole("region", { name: "Context Window Safety Gauge" })
    ).toBeVisible();

    // The workstation main must span at least viewport width minus the
    // largest horizontal padding allowance (xl:px-10 = 40px per side)
    const main = page.locator("main");
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(2560 - 100);
  });

  test("Cmd+K palette opens and closes", async ({ page }) => {
    await page.goto("/tools/tokencraft");
    await expect(page.getByLabel("Raw prompt text input")).toBeVisible();

    const palette = page.getByRole("dialog", { name: "Command Palette" });
    await page.keyboard.press("ControlOrMeta+k");
    await expect(palette).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(palette).not.toBeVisible();
  });
});
