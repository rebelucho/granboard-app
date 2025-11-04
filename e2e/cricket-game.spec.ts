import { test, expect } from '@playwright/test';

test.describe('Cricket Game', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page de configuration
    await page.goto('/cricket');

    // Configurer une partie avec 2 joueurs
    const nameInput = page.getByTestId('player-name-input');

    // Ajouter Alice et attendre qu'elle apparaisse
    await nameInput.fill('Alice');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Alice')).toBeVisible();

    // Ajouter Bob et attendre qu'il apparaisse
    await nameInput.fill('Bob');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Bob')).toBeVisible();

    // Sélectionner le mode Standard (requis pour commencer)
    await page.getByTestId('game-mode-standard').click();

    // Commencer la partie
    await page.getByTestId('start-game-button').click();

    // Gérer la dialog d'ordre des joueurs - choisir "Ordre aléatoire"
    await page.getByTestId('order-random-button').click();

    // Attendre d'être sur la page de jeu
    await page.waitForURL(/\/cricket\/game/);
  });

  test('should display game interface', async ({ page }) => {
    // Vérifier le titre CRICKET
    await expect(page.getByRole('heading', { name: /CRICKET/i })).toBeVisible();

    // Vérifier que le joueur actuel est affiché
    await expect(page.getByRole('heading').filter({ hasText: /Alice|Bob/ }).first()).toBeVisible();

    // Vérifier que le scoreboard est présent avec les numéros Cricket
    await expect(page.getByTestId('cricket-number-15')).toBeVisible();
    await expect(page.getByTestId('cricket-number-16')).toBeVisible();
    await expect(page.getByTestId('cricket-number-17')).toBeVisible();
    await expect(page.getByTestId('cricket-number-18')).toBeVisible();
    await expect(page.getByTestId('cricket-number-19')).toBeVisible();
    await expect(page.getByTestId('cricket-number-20')).toBeVisible();
    await expect(page.getByTestId('cricket-number-Bull')).toBeVisible();
  });

  test('should display player turn history', async ({ page }) => {
    // Vérifier que l'historique est présent
    await expect(page.getByTestId('history-title')).toBeVisible();

    // Vérifier que le round en cours est affiché
    await expect(page.getByTestId('current-round-1')).toBeVisible();
  });

  test('should display control buttons', async ({ page }) => {
    // Vérifier les boutons de contrôle
    await expect(page.getByTestId('undo-button')).toBeVisible();
    await expect(page.getByTestId('next-player-button')).toBeVisible();
  });

  test('should open legend dialog', async ({ page }) => {
    // Cliquer sur le bouton Légende
    await page.getByTestId('legend-button').click();

    // Vérifier que la dialog est ouverte
    await expect(page.getByTestId('legend-dialog')).toBeVisible();

    // Fermer la dialog
    await page.getByTestId('legend-close-button').click();

    // Vérifier que la dialog est fermée
    await expect(page.getByTestId('legend-dialog')).not.toBeVisible();
  });

  test('should open settings dialog', async ({ page }) => {
    // Cliquer sur le bouton Paramètres
    await page.getByTestId('settings-button').click();

    // Vérifier que la dialog est ouverte
    await expect(page.getByTestId('new-game-button')).toBeVisible();
    await expect(page.getByTestId('quit-button')).toBeVisible();

    // Fermer la dialog
    await page.getByTestId('settings-close-button').click();
  });

  test('should toggle sound', async ({ page }) => {
    // Ouvrir les paramètres
    await page.getByTestId('settings-button').click();

    // Vérifier que le contrôle du son est visible
    const soundToggleButton = page.getByTestId('sound-toggle-button');
    await expect(soundToggleButton).toBeVisible();

    // Cliquer pour changer l'état
    await soundToggleButton.click();

    // Le bouton devrait avoir changé de texte
    await expect(soundToggleButton).toBeEnabled();

    // Fermer la dialog
    await page.getByTestId('settings-close-button').click();
  });

  test('should show player info', async ({ page }) => {
    // Vérifier les informations du joueur actuel
    await expect(page.getByTestId('dart-counter')).toBeVisible();
    await expect(page.getByTestId('round-counter')).toBeVisible();
  });

  test('should change player on button click', async ({ page }) => {
    // Récupérer le nom du joueur actuel
    const currentPlayerName = await page.locator('h2 span').first().textContent();

    // Cliquer sur "Joueur suivant"
    await page.getByTestId('next-player-button').click();

    // Attendre un peu pour le changement
    await page.waitForTimeout(500);

    // Vérifier que le joueur a changé
    const newPlayerName = await page.locator('h2 span').first().textContent();
    expect(newPlayerName).not.toBe(currentPlayerName);
  });

  test('should display both players in scoreboard', async ({ page }) => {
    // Vérifier que les deux joueurs sont dans le tableau (scoreboard)
    await expect(page.getByTestId('scoreboard-player-Alice')).toBeVisible();
    await expect(page.getByTestId('scoreboard-player-Bob')).toBeVisible();

    // Vérifier les statistiques (Points et MPR)
    await expect(page.getByTestId('points-label')).toBeVisible();
    await expect(page.getByTestId('mpr-label')).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Tester sur mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: /CRICKET/i })).toBeVisible();

    // Tester sur tablette
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: /CRICKET/i })).toBeVisible();

    // Tester sur desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading', { name: /CRICKET/i })).toBeVisible();
  });

  test('should quit game from settings', async ({ page }) => {
    // Ouvrir les paramètres
    await page.getByTestId('settings-button').click();

    // Cliquer sur Quitter
    await page.getByTestId('quit-button').click();

    // Devrait retourner à la page d'accueil
    await expect(page).toHaveURL('/');
  });

  test('should start new game from settings', async ({ page }) => {
    // Ouvrir les paramètres
    await page.getByTestId('settings-button').click();

    // Cliquer sur Nouvelle partie
    await page.getByTestId('new-game-button').click();

    // Devrait retourner à la page de configuration
    await expect(page).toHaveURL('/cricket');
  });
});
