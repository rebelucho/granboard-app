import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page with game modes', async ({ page }) => {
    await page.goto('/');

    // Vérifier le titre de la page
    await expect(page).toHaveTitle(/Granboard/);

    // Vérifier que les cartes de jeu sont présentes
    await expect(page.getByText('Cricket')).toBeVisible();
  });

  test('should navigate to cricket setup page', async ({ page }) => {
    await page.goto('/');

    // Cliquer sur la carte Cricket
    await page.getByText('Cricket').click();

    // Vérifier qu'on est sur la page de configuration Cricket
    await expect(page).toHaveURL(/\/cricket/);
  });
});
