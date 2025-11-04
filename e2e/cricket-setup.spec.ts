import { test, expect } from '@playwright/test';

test.describe('Cricket Setup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cricket');
  });

  test('should display cricket setup page with default values', async ({ page }) => {
    // Vérifier le titre
    await expect(page.getByRole('heading', { name: 'CRICKET', exact: true })).toBeVisible();

    // Vérifier les modes de jeu
    await expect(page.getByTestId('game-mode-standard')).toBeVisible();
    await expect(page.getByTestId('game-mode-cutthroat')).toBeVisible();

    // Vérifier que le bouton commencer est présent
    await expect(page.getByTestId('start-game-button')).toBeVisible();
  });

  test('should add players', async ({ page }) => {
    // Trouver le champ de saisie du nom
    const nameInput = page.getByTestId('player-name-input');

    // Ajouter un premier joueur et attendre qu'il apparaisse
    await nameInput.fill('Alice');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Alice')).toBeVisible();

    // Ajouter un deuxième joueur et attendre qu'il apparaisse
    await nameInput.fill('Bob');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Bob')).toBeVisible();
  });

  test('should not allow starting game without enough players', async ({ page }) => {
    // Essayer de commencer sans joueur
    const startButton = page.getByTestId('start-game-button');

    // Le bouton devrait être désactivé ou ne pas démarrer
    await expect(startButton).toBeDisabled();
  });

  test('should start game with valid configuration', async ({ page }) => {
    // Ajouter deux joueurs
    const nameInput = page.getByTestId('player-name-input');

    await nameInput.fill('Alice');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Alice')).toBeVisible();

    await nameInput.fill('Bob');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Bob')).toBeVisible();

    // Sélectionner le mode Standard
    await page.getByTestId('game-mode-standard').click();

    // Commencer la partie
    await page.getByTestId('start-game-button').click();

    // Gérer la dialog d'ordre des joueurs - choisir "Ordre aléatoire"
    await page.getByTestId('order-random-button').click();

    // Vérifier qu'on est redirigé vers la page de jeu
    await expect(page).toHaveURL(/\/cricket\/game/);
  });

  test('should select cut throat mode', async ({ page }) => {
    // Cliquer sur Cut Throat
    await page.getByTestId('game-mode-cutthroat').click();

    // Vérifier que le mode est sélectionné (vérifier la classe CSS)
    const cutThroatOption = page.getByTestId('game-mode-cutthroat');
    await expect(cutThroatOption).toHaveClass(/border-red-500/);
  });

  test('should allow removing players', async ({ page }) => {
    // Ajouter un joueur et attendre qu'il apparaisse
    const nameInput = page.getByTestId('player-name-input');
    await nameInput.fill('Alice');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Alice')).toBeVisible();

    // Supprimer le joueur
    await page.getByTestId('remove-player-button-Alice').click();

    // Vérifier que le joueur a disparu
    await expect(page.getByTestId('player-item-Alice')).not.toBeVisible();
  });

  test('should change max rounds', async ({ page }) => {
    // Trouver l'input de rounds
    const roundsInput = page.getByTestId('max-rounds-input');

    await roundsInput.fill('10');
    await expect(roundsInput).toHaveValue('10');
  });
});
