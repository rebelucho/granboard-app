import { test, expect } from "@playwright/test";
import { Player } from "../services/cricket";

test.describe("Take Screenshots for README", () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  // Only run on Chromium to avoid timeout issues
  test.skip(({ browserName }) => browserName !== "chromium", "Chromium only");

  test("1. Home screen", async ({ page }) => {
    await page.goto("/");

    // Wait for page to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({
      path: "docs/screenshots/home.png",
      fullPage: false,
    });
  });

  test("2. Cricket setup screen", async ({ page }) => {
    await page.goto("/cricket");
    await page.waitForLoadState("networkidle");

    // Add some players
    await page.getByPlaceholder("Nom du joueur").fill("Alice");
    await page.getByRole("button", { name: "Ajouter" }).click();

    await page.getByPlaceholder("Nom du joueur").fill("Bob");
    await page.getByRole("button", { name: "Ajouter" }).click();

    await page.getByPlaceholder("Nom du joueur").fill("Charlie");
    await page.getByRole("button", { name: "Ajouter" }).click();

    // Wait for players to be added
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({
      path: "docs/screenshots/cricket-setup.png",
      fullPage: false,
    });
  });

  test("3. Cricket game in progress", async ({ page, context }) => {
    // Setup game state with session storage
    await context.addInitScript(() => {
      const players = [
        { id: "1", name: "Alice", avatar: "🎯" },
        { id: "2", name: "Bob", avatar: "🎪" },
        { id: "3", name: "Charlie", avatar: "🎨" },
      ];
      sessionStorage.setItem("cricketPlayers", JSON.stringify(players));
      sessionStorage.setItem("cricketGameMode", "standard");
      sessionStorage.setItem("cricketMaxRounds", "20");
    });

    await page.goto("/cricket/game");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Take screenshot
    await page.screenshot({
      path: "docs/screenshots/cricket-game.png",
      fullPage: false,
    });
  });

  test("4. 01 game in progress", async ({ page, context }) => {
    // Setup game state with session storage
    await context.addInitScript(() => {
      const players = [
        { id: "1", name: "Alice", avatar: "🎯" },
        { id: "2", name: "Bob", avatar: "🎪" },
      ];
      sessionStorage.setItem("zeroOnePlayers", JSON.stringify(players));
      sessionStorage.setItem("zeroOneMode", "501");
      sessionStorage.setItem("zeroOneDoubleOut", "false");
      sessionStorage.setItem("zeroOneMaxRounds", "0");
    });

    await page.goto("/01/game");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: "docs/screenshots/01-game.png",
      fullPage: false,
    });
  });

  test("5. Settings dialog", async ({ page, context }) => {
    // Setup game state to access settings
    await context.addInitScript(() => {
      const players = [
        { id: "1", name: "Alice", avatar: "🎯" },
        { id: "2", name: "Bob", avatar: "🎪" },
      ];
      sessionStorage.setItem("cricketPlayers", JSON.stringify(players));
      sessionStorage.setItem("cricketGameMode", "standard");
      sessionStorage.setItem("cricketMaxRounds", "20");
    });

    await page.goto("/cricket/game");
    await page.waitForTimeout(1000);

    // Try to open settings
    // Look for settings button (gear icon or menu)
    const settingsButton = page.locator('[data-testid="settings-button"]').or(page.getByRole('button').filter({ hasText: /paramètres|settings|⚙/i }));

    if (await settingsButton.count() > 0) {
      await settingsButton.first().click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: "docs/screenshots/settings.png",
      fullPage: false,
    });
  });

  test("6. Home screen with theme toggle visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Granboard")).toBeVisible();

    // Wait for page to fully load
    await page.waitForTimeout(1000);

    // This will serve as our "animations" placeholder for now
    // We can replace it later with an actual animation screenshot
    await page.screenshot({
      path: "docs/screenshots/animations.png",
      fullPage: false,
    });
  });
});
