import { test, expect } from "@playwright/test";

const EDITOR = "Your prompt";
const COUNT = "#answer-panel [aria-live=polite]";

test.describe("TokenCraft Core Flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/tokencraft");
    await expect(page.getByLabel(EDITOR)).toBeVisible();
  });

  test("typing text updates the count and underlines tokens in place", async ({ page }) => {
    const editor = page.getByLabel(EDITOR);
    await editor.fill("");
    await editor.pressSequentially("The quick brown fox jumps", { delay: 20 });

    await expect(page.locator(COUNT).first()).toHaveText("5");
    await expect(page.locator("[data-t]").first()).toBeVisible();
  });

  test("clearing the prompt shows the samples, not a broken state", async ({ page }) => {
    await page.getByRole("button", { name: "Clear the prompt" }).click();
    await expect(page.getByLabel(EDITOR)).toHaveValue("");
    await expect(page.getByText("Try a sample:")).toBeVisible();
    await expect(page.locator(COUNT).first()).toHaveText("0");
  });

  test("view tabs expose the heatmap legend and ID labels", async ({ page }) => {
    await page.getByRole("tab", { name: "Bytes", exact: true }).click();
    await expect(page.getByLabel("Heatmap legend: bytes per token")).toBeVisible();

    await page.getByRole("tab", { name: "IDs", exact: true }).click();
    await expect(page.locator('button[tabindex="-1"]').first()).toHaveText(/^\d+$/);
  });

  test("command palette runs the minify flow and resets its query", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+k");
    const palette = page.getByRole("dialog", { name: "Commands" });
    await expect(palette).toBeVisible();
    const search = page.getByPlaceholder("Search actions, views, samples and models");
    await expect(search).toBeFocused();

    await page.keyboard.type("minify");
    await page.keyboard.press("Enter");

    const diffDialog = page.getByRole("dialog", { name: "Minify the prompt" });
    await expect(diffDialog).toBeVisible();
    // Savings are reported in real tokens once counted
    await expect(diffDialog).toContainText(/tokens/);

    await page.keyboard.press("Escape");
    await expect(diffDialog).not.toBeVisible();

    await page.keyboard.press("ControlOrMeta+k");
    await expect(palette).toBeVisible();
    await expect(search).toHaveValue("");
    await page.keyboard.type("minify");
    await page.keyboard.press("Enter");
    await expect(diffDialog).toBeVisible();
  });

  test("Cmd+M opens the minify dialog directly", async ({ page }) => {
    await page.locator("body").click({ position: { x: 5, y: 300 } });
    await page.keyboard.press("ControlOrMeta+m");
    await expect(page.getByRole("dialog", { name: "Minify the prompt" })).toBeVisible();
  });

  test("model picker switches the model and the precision stamp follows", async ({ page }) => {
    await page.getByRole("button", { name: /Change model/ }).click();
    await page.getByRole("combobox").fill("gpt");
    await page.getByRole("option").first().click();
    await expect(page.getByRole("button", { name: /Model: .*GPT|Model: gpt/i })).toBeVisible();
    await expect(page.locator("#answer-panel").getByText("Exact", { exact: true })).toBeVisible();
  });

  test("rate board row click selects that model", async ({ page }) => {
    const board = page.locator("#rate-board");
    await board.scrollIntoViewIfNeeded();
    const row = board.locator("tbody tr").nth(2);
    const name = (await row.locator("td button > span > span.truncate").first().innerText()).trim();
    await row.click();
    await expect(page.getByRole("button", { name: `Model: ${name}. Change model` })).toBeVisible();
  });
});
