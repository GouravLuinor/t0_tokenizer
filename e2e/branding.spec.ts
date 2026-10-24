import { test, expect } from "@playwright/test";

const TITLE = "Token Counter & LLM Cost Calculator · TokenCraft by Nor AI";

test.describe("Nor AI branding", () => {
  test("title, header, made-by band, footer and structured data name Nor AI", async ({ page }) => {
    await page.goto("/tools/tokencraft");
    await expect(page).toHaveTitle(TITLE);
    const header = page.locator("header").first();
    await expect(header.getByRole("link", { name: /made by Nor AI Technologies/i })).toHaveAttribute("href", "https://norai.tech");
    await expect(page.getByRole("heading", { name: "Made by Nor AI" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Talk to an engineer" })).toHaveAttribute("href", "https://norai.tech/contact");

    const footer = page.locator("footer");
    for (const href of ["https://norai.tech/contact", "https://norai.tech/mission", "https://norai.tech/products", "https://judge.norai.tech", "https://rag.norai.tech"]) {
      await expect(footer.locator(`a[href="${href}"]`)).toBeVisible();
    }
    await expect(footer.locator('a[href="https://tokens.norai.tech"]')).toHaveCount(0);
    await expect(footer.locator('a[href*="judgewright.norai.tech"]')).toHaveCount(0);

    const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? "null")));
    const nodes = blocks.flat();
    const org = nodes.find((n) => n["@type"] === "Organization");
    expect(org["@id"]).toBe("https://norai.tech/#organization");
    const app = nodes.find((n) => n["@type"] === "WebApplication");
    expect(app.publisher).toEqual({ "@id": org["@id"] });
    expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toContain("/tools/tokencraft/opengraph-image");
    expect(await page.locator('meta[name="twitter:image"]').getAttribute("content")).toContain("/tools/tokencraft/opengraph-image");
  });

  for (const vp of [{ width: 390, height: 844 }, { width: 360, height: 740 }]) {
    test(`header shows Nor AI at ${vp.width}px without horizontal scroll`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/tools/tokencraft");
      await expect(page.locator("header").first().getByRole("link", { name: /made by Nor AI Technologies/i })).toBeInViewport();
      await expect(page.getByRole("link", { name: "TokenCraft home" })).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);
    });
  }

  test("model pages and the 404 keep the brand", async ({ page }) => {
    await page.goto("/tools/tokencraft/models/claude-sonnet-5-5");
    await expect(page).toHaveTitle(/ token counter & price · TokenCraft by Nor AI$/);
    expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toContain("/tools/tokencraft/opengraph-image");
    await expect(page.getByRole("heading", { name: "Made by Nor AI" })).toBeVisible();

    const res = await page.goto("/no-such-page");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("link", { name: "Talk to an engineer" })).toHaveAttribute("href", "https://norai.tech/contact");
    await expect(page.getByRole("link", { name: /Nor AI/ }).first()).toHaveAttribute("href", "https://norai.tech");
  });
});
