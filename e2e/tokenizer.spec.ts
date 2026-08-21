import { test, expect } from "@playwright/test";

const EDITOR = "Raw prompt text input";

test.describe("TokenCraft Core Flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/tokencraft");
    await expect(page.getByLabel(EDITOR)).toBeVisible();
  });

  test("typing text produces token chips and live counts", async ({
    page,
  }) => {
    const editor = page.getByLabel(EDITOR);
    await editor.fill("");
    await editor.pressSequentially("The quick brown fox jumps", {
      delay: 20,
    });

    // Token count badge becomes non-zero and announces politely.
    // Retry until a non-zero digit appears — the NumberTicker spring animates
    // from 0 and the first tokenize pass pays one-time encoder init cost.
    const badge = page.locator('[aria-live="polite"]');
    await expect(badge).toContainText(/Token/);
    await expect(badge).toContainText(/[1-9]/);

    // Chips render in the stream
    await expect(page.locator('button[tabindex="-1"]').first()).toBeVisible();
  });

  test("clearing the editor reveals empty states", async ({ page }) => {
    await page.getByRole("button", { name: "Clear input text" }).click();
    await expect(page.getByText("No Tokens Generated")).toBeVisible();
    await expect(
      page.getByPlaceholder(/Paste or drop your raw prompt/)
    ).toHaveValue("");
  });

  test("view mode toggles expose heatmap legend and ID labels", async ({
    page,
  }) => {
    // Default preset guarantees a populated stream.
    // Accessible names come from the visible labels, not the title tooltips.
    await page.getByRole("button", { name: "Bytes", exact: true }).click();
    await expect(
      page.getByLabel("Heatmap legend: bytes per token")
    ).toBeVisible();

    await page.getByRole("button", { name: "IDs", exact: true }).click();
    await expect(page.locator('button[tabindex="-1"]').first()).toHaveText(
      /^#\d+$/
    );
  });

  test("command palette opens via Cmd+K, executes minify flow", async ({
    page,
  }) => {
    await page.keyboard.press("ControlOrMeta+k");
    const palette = page.getByRole("dialog", { name: "Command Palette" });
    await expect(palette).toBeVisible();
    await expect(
      page.getByPlaceholder("Type a command or search actions…")
    ).toBeFocused();

    await page.keyboard.type("minify");
    await page.keyboard.press("Enter");

    // Scope to the diff dialog specifically — the palette closes as the
    // diff opens, so a global dialog query races both transitions
    const diffDialog = page.getByRole("dialog", {
      name: "Prompt Minification & AST Diff Inspector",
    });
    await expect(diffDialog).toBeVisible();

    // Escape dismisses it
    await page.keyboard.press("Escape");
    await expect(diffDialog).not.toBeVisible();

    // Palette relaunch starts with a fresh query surface (regression guard)
    await page.keyboard.press("ControlOrMeta+k");
    await expect(palette).toBeVisible();
    const search = page.getByPlaceholder("Type a command or search actions…");
    await expect(search).toHaveValue("");
    await page.keyboard.type("minify");
    await page.keyboard.press("Enter");
    await expect(diffDialog).toBeVisible();
  });

  test("Cmd+M triggers the minify dialog directly", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+m");
    await expect(
      page.getByText("Prompt Minification & AST Diff Inspector")
    ).toBeVisible();
  });

  test("model selector switches active model", async ({ page }) => {
    await page
      .getByRole("button", { name: /Select Tokenizer Model/ })
      .click();
    await page.getByRole("menuitemradio").or(page.getByRole("menuitem")).last().click();
    // Gauge reflects whichever model is now active without erroring
    await expect(
      page.getByRole("region", { name: "Context Window Safety Gauge" })
    ).toBeVisible();
  });
});
