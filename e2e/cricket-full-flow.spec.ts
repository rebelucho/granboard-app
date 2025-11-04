import { test, expect } from '@playwright/test';

test.describe('Cricket Full Game Flow', () => {
  test('should complete a full game flow from home to game end', async ({ page }) => {
    // 1. Partir de la page d'accueil
    await page.goto('/');
    await expect(page.getByTestId('game-card-cricket')).toBeVisible();

    // 2. Naviguer vers Cricket
    await page.getByTestId('game-card-cricket').click();
    await expect(page).toHaveURL(/\/cricket/);

    // 3. Configurer la partie
    const nameInput = page.getByTestId('player-name-input');

    // Ajouter Alice et attendre qu'elle apparaisse
    await nameInput.fill('Alice');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Alice')).toBeVisible();

    // Ajouter Bob et attendre qu'il apparaisse
    await nameInput.fill('Bob');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Bob')).toBeVisible();

    // Sélectionner le mode Standard
    await page.getByTestId('game-mode-standard').click();

    // 4. Commencer la partie
    await page.getByTestId('start-game-button').click();

    // Gérer la dialog d'ordre des joueurs - choisir "Ordre aléatoire"
    await page.getByTestId('order-random-button').click();

    await page.waitForURL(/\/cricket\/game/);

    // 5. Vérifier l'interface de jeu
    await expect(page.getByRole('heading', { name: /CRICKET/i })).toBeVisible();
    await expect(page.getByRole('heading').filter({ hasText: /Alice|Bob/ }).first()).toBeVisible();

    // 6. Vérifier que le scoreboard affiche tous les numéros Cricket
    const cricketNumbers = ['15', '16', '17', '18', '19', '20', 'Bull'];
    for (const num of cricketNumbers) {
      await expect(page.getByTestId(`cricket-number-${num}`)).toBeVisible();
    }

    // 7. Vérifier l'historique
    await expect(page.getByTestId('history-title')).toBeVisible();
    await expect(page.getByTestId('current-round-1')).toBeVisible();

    // 8. Simuler un changement de joueur
    const firstPlayer = await page.locator('h2 span.text-green-400').textContent();
    await page.getByTestId('next-player-button').click();

    // Attendre le changement
    await page.waitForTimeout(500);

    const secondPlayer = await page.locator('h2 span.text-green-400').textContent();
    expect(secondPlayer).not.toBe(firstPlayer);

    // 9. Tester les fonctionnalités de la dialog
    // Ouvrir la légende
    await page.getByTestId('legend-button').click();
    await expect(page.getByTestId('legend-dialog')).toBeVisible();
    await page.getByTestId('legend-close-button').click();

    // 10. Ouvrir les paramètres
    await page.getByTestId('settings-button').click();
    await expect(page.getByTestId('new-game-button')).toBeVisible();

    // 11. Retour à l'accueil via Quitter
    await page.getByTestId('quit-button').click();
    await expect(page).toHaveURL('/');
  });

  test('should handle player order selection', async ({ page }) => {
    // Aller à la configuration
    await page.goto('/cricket');

    // Ajouter des joueurs
    const nameInput = page.getByTestId('player-name-input');

    await nameInput.fill('Alice');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Alice')).toBeVisible();

    await nameInput.fill('Bob');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Bob')).toBeVisible();

    await nameInput.fill('Charlie');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Charlie')).toBeVisible();

    // Commencer la partie
    await page.getByTestId('start-game-button').click();

    // Gérer la dialog d'ordre des joueurs - choisir "Ordre aléatoire"
    await page.getByTestId('order-random-button').click();

    // Vérifier qu'on est sur la page de jeu
    await page.waitForURL(/\/cricket\/game/);
  });

  test('should display connection button', async ({ page }) => {
    // Configurer et démarrer une partie
    await page.goto('/cricket');

    const nameInput = page.getByTestId('player-name-input');
    await nameInput.fill('Alice');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Alice')).toBeVisible();

    await nameInput.fill('Bob');
    await page.getByTestId('add-player-button').click();
    await expect(page.getByTestId('player-item-Bob')).toBeVisible();

    await page.getByTestId('start-game-button').click();

    // Gérer la dialog d'ordre des joueurs - choisir "Ordre aléatoire"
    await page.getByTestId('order-random-button').click();

    await page.waitForURL(/\/cricket\/game/);

    // Vérifier le bouton de connexion Granboard
    const connectButton = page.getByTestId('connect-button');
    await expect(connectButton).toBeVisible();
  });
});
