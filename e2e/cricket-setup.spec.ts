import { test, expect } from '@playwright/test';

test.describe('Cricket Setup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cricket');
  });

  test('should display cricket setup page with default values', async ({ page }) => {
    // Vérifier le titre
    await expect(page.getByRole('heading', { name: 'CRICKET', exact: true })).toBeVisible();
    await expect(page.getByText('Configuration')).toBeVisible();

    // Vérifier les modes de jeu
    await expect(page.getByRole('button', { name: /Cricket Standard/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Cricket Cut Throat/ })).toBeVisible();

    // Vérifier que le bouton commencer est présent
    await expect(page.getByRole('button', { name: /Commencer la partie/i })).toBeVisible();
  });

  test('should add players', async ({ page }) => {
    // Trouver le champ de saisie du nom
    const nameInput = page.locator('input[type="text"]').first();

    // Ajouter un premier joueur et attendre qu'il apparaisse
    await nameInput.fill('Alice');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Alice')).toBeVisible();

    // Ajouter un deuxième joueur et attendre qu'il apparaisse
    await nameInput.fill('Bob');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Bob')).toBeVisible();
  });

  test('should not allow starting game without enough players', async ({ page }) => {
    // Essayer de commencer sans joueur
    const startButton = page.getByRole('button', { name: /Commencer la partie/i });

    // Le bouton devrait être désactivé ou ne pas démarrer
    await expect(startButton).toBeDisabled();
  });

  test('should start game with valid configuration', async ({ page }) => {
    // Ajouter deux joueurs
    const nameInput = page.locator('input[type="text"]').first();

    await nameInput.fill('Alice');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Alice')).toBeVisible();

    await nameInput.fill('Bob');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Bob')).toBeVisible();

    // Sélectionner le mode Standard
    await page.getByRole('button', { name: /Cricket Standard/ }).click();

    // Commencer la partie
    await page.getByRole('button', { name: /Commencer la partie/i }).click();

    // Gérer la dialog d'ordre des joueurs - choisir "Ordre aléatoire"
    await page.getByRole('button', { name: /Ordre aléatoire/i }).click();

    // Vérifier qu'on est redirigé vers la page de jeu
    await expect(page).toHaveURL(/\/cricket\/game/);
  });

  test('should select cut throat mode', async ({ page }) => {
    // Cliquer sur Cut Throat
    await page.getByRole('button', { name: /Cricket Cut Throat/ }).click();

    // Vérifier que le mode est sélectionné (vérifier la classe CSS)
    const cutThroatOption = page.getByRole('button', { name: /Cricket Cut Throat/ });
    await expect(cutThroatOption).toHaveClass(/border-red-500/);
  });

  test('should allow removing players', async ({ page }) => {
    // Ajouter un joueur et attendre qu'il apparaisse
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('Alice');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Alice')).toBeVisible();

    // Supprimer le joueur
    await page.getByRole('button', { name: /Retirer/i }).first().click();

    // Vérifier que le joueur a disparu
    await expect(page.getByText('Alice')).not.toBeVisible();
  });

  test('should change max rounds', async ({ page }) => {
    // Trouver le sélecteur de rounds
    const roundsSelect = page.locator('select').filter({ hasText: /20/ });

    if (await roundsSelect.isVisible()) {
      await roundsSelect.selectOption('10');
      await expect(roundsSelect).toHaveValue('10');
    }
  });
});
