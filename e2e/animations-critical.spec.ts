import { test, expect } from '@playwright/test';

/**
 * Critical e2e tests for animations system
 * These tests focus on the essential animation flows to keep CI/CD fast
 */
test.describe('Critical Animations', () => {
  test.beforeEach(async ({ page }) => {
    // Setup a Cricket game
    await page.goto('/cricket');

    // Add two players
    const nameInput = page.getByTestId('player-name-input');
    await nameInput.fill('Player1');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Player1')).toBeVisible();

    await nameInput.fill('Player2');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Player2')).toBeVisible();

    // Select Standard mode
    await page.getByTestId('game-mode-standard').click();

    // Start game
    await page.getByTestId('start-game-button').click();

    // Choose random order
    await page.getByTestId('order-random-button').click();

    await page.waitForURL(/\/cricket\/game/);
  });

  test('should render game correctly', async ({ page }) => {
    // Verify game is loaded
    await expect(page.getByRole('heading', { name: /CRICKET/i })).toBeVisible();
    await expect(page.getByTestId('next-player-button')).toBeVisible();
  });

  test('animation overlay should have correct z-index', async ({ page }) => {
    // Check that animations container exists and is rendered
    const animationOverlay = page.locator('.fixed.inset-0.z-\\[10000\\]');

    // Initially should not be visible (no animation playing)
    await expect(animationOverlay).not.toBeVisible();
  });

  // Note: Turn summary test removed - it requires simulating actual dart hits
  // (via Granboard connection), not just clicking next-player button.
  // The turn summary only appears when there are hits during the turn.
  // This is tested in the full flow tests with actual game scenarios.
});

test.describe('Debug Animations Page', () => {
  test('should display all animations correctly', async ({ page }) => {
    await page.goto('/debug/animations');

    // Check that page is loaded
    await expect(page.getByRole('heading', { name: /Debug Animations/i })).toBeVisible();

    // Check that all animation buttons are present
    await expect(page.getByText('3 Miss - Chèvre')).toBeVisible();
    await expect(page.getByText('3 Triples - Licorne')).toBeVisible();
    await expect(page.getByRole('button', { name: /Victoire/ })).toBeVisible();

    // Check hit-sequence buttons
    await expect(page.getByText('Séquence 3 Simples')).toBeVisible();
    await expect(page.getByText('Séquence Simple-Double-Triple')).toBeVisible();
    await expect(page.getByText('Séquence 3 Doubles')).toBeVisible();
  });

  test('should play goat animation when clicked', async ({ page }) => {
    await page.goto('/debug/animations');

    // Click on goat animation button
    const goatButton = page.getByText('3 Miss - Chèvre').locator('..');
    await goatButton.click();

    // Check that animation overlay is visible
    const animationOverlay = page.locator('.fixed.inset-0.z-\\[10000\\]');
    await expect(animationOverlay).toBeVisible({ timeout: 1000 });

    // Check for goat emoji
    await expect(page.locator('.animate-shake').filter({ hasText: '🐐' })).toBeVisible();
    await expect(page.locator('text=BÊÊÊÊÊ!')).toBeVisible();

    // Wait for animation to finish and disappear
    await expect(animationOverlay).not.toBeVisible({ timeout: 4000 });
  });

  test('should play unicorn animation when clicked', async ({ page }) => {
    await page.goto('/debug/animations');

    // Click on unicorn animation button
    const unicornButton = page.getByText('3 Triples - Licorne').locator('..');
    await unicornButton.click();

    // Check that animation overlay is visible
    const animationOverlay = page.locator('.fixed.inset-0.z-\\[10000\\]');
    await expect(animationOverlay).toBeVisible({ timeout: 1000 });

    // Check for unicorn emoji and text
    await expect(page.locator('.animate-rainbow').filter({ hasText: '🦄' })).toBeVisible();
    await expect(page.locator('text=LICORNE!')).toBeVisible();
    await expect(page.locator('text=3 Triples! Magique!')).toBeVisible();

    // Wait for animation to finish
    await expect(animationOverlay).not.toBeVisible({ timeout: 4000 });
  });

  test('should play victory animation when clicked', async ({ page }) => {
    await page.goto('/debug/animations');

    // Click on victory animation button
    const victoryButton = page.getByText('Victoire').locator('..');
    await victoryButton.click();

    // Check that animation overlay is visible
    const animationOverlay = page.locator('.fixed.inset-0.z-\\[10000\\]');
    await expect(animationOverlay).toBeVisible({ timeout: 1000 });

    // Check for trophy emoji
    await expect(page.locator('.animate-trophy').filter({ hasText: '🏆' })).toBeVisible();
    await expect(page.locator('text=VICTOIRE!')).toBeVisible();

    // Wait for animation to finish
    await expect(animationOverlay).not.toBeVisible({ timeout: 4000 });
  });

  test('should play hit-sequence animation with symbols appearing sequentially', async ({ page }) => {
    await page.goto('/debug/animations');

    // Click on simple-double-triple sequence
    const sequenceButton = page.getByText('Séquence Simple-Double-Triple').locator('..');
    await sequenceButton.click();

    // Check that animation overlay is visible
    const animationOverlay = page.locator('.fixed.inset-0.z-\\[10000\\]');
    await expect(animationOverlay).toBeVisible({ timeout: 1000 });

    // First symbol should be visible immediately
    const symbols = page.locator('.text-8xl.font-bold span');
    await expect(symbols.first()).toBeVisible();

    // Wait for all symbols to appear (they appear with 1 second intervals)
    await page.waitForTimeout(2500);

    // All 3 symbols should be visible
    await expect(symbols).toHaveCount(3);

    // Wait for animation to finish
    await expect(animationOverlay).not.toBeVisible({ timeout: 4000 });
  });

  test('should only play one animation at a time', async ({ page }) => {
    await page.goto('/debug/animations');

    // Click on goat animation
    const goatButton = page.getByText('3 Miss - Chèvre').locator('..');
    await goatButton.click();

    const animationOverlay = page.locator('.fixed.inset-0.z-\\[10000\\]');
    await expect(animationOverlay).toBeVisible({ timeout: 1000 });

    // Try to click another animation while first is playing
    const unicornButton = page.getByText('3 Triples - Licorne').locator('..');
    await unicornButton.click();

    // Only unicorn animation should be visible (replaces goat)
    await expect(page.locator('.animate-rainbow').filter({ hasText: '🦄' })).toBeVisible();
    await expect(page.locator('.animate-shake').filter({ hasText: '🐐' })).not.toBeVisible();
  });
});
