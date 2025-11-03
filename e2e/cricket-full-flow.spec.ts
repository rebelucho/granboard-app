import { test, expect } from '@playwright/test';

test.describe('Cricket Full Game Flow', () => {
  test('should complete a full game flow from home to game end', async ({ page }) => {
    // 1. Partir de la page d'accueil
    await page.goto('/');
    await expect(page.getByText('Cricket')).toBeVisible();

    // 2. Naviguer vers Cricket
    await page.getByText('Cricket').click();
    await expect(page).toHaveURL(/\/cricket/);

    // 3. Configurer la partie
    const nameInput = page.locator('input[type="text"]').first();

    // Ajouter Alice et attendre qu'elle apparaisse
    await nameInput.fill('Alice');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Alice')).toBeVisible();

    // Ajouter Bob et attendre qu'il apparaisse
    await nameInput.fill('Bob');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Bob')).toBeVisible();

    // Sélectionner le mode Standard
    await page.getByRole('button', { name: /Cricket Standard/ }).click();

    // 4. Commencer la partie
    await page.getByRole('button', { name: /Commencer la partie/i }).click();

    // Gérer la dialog d'ordre des joueurs - choisir "Ordre aléatoire"
    await page.getByRole('button', { name: /Ordre aléatoire/i }).click();

    await page.waitForURL(/\/cricket\/game/);

    // 5. Vérifier l'interface de jeu
    await expect(page.getByRole('heading', { name: /CRICKET/i })).toBeVisible();
    await expect(page.getByRole('heading').filter({ hasText: /Alice|Bob/ }).first()).toBeVisible();

    // 6. Vérifier que le scoreboard affiche tous les numéros Cricket
    const cricketNumbers = ['15', '16', '17', '18', '19', '20', 'Bull'];
    for (const num of cricketNumbers) {
      await expect(page.getByText(num).first()).toBeVisible();
    }

    // 7. Vérifier l'historique
    await expect(page.getByText(/Historique/i)).toBeVisible();
    await expect(page.getByText(/Round 1.*en cours/i)).toBeVisible();

    // 8. Simuler un changement de joueur
    const firstPlayer = await page.locator('h2 span.text-green-400').textContent();
    await page.getByRole('button', { name: /Joueur suivant/i }).click();

    // Attendre le changement
    await page.waitForTimeout(500);

    const secondPlayer = await page.locator('h2 span.text-green-400').textContent();
    expect(secondPlayer).not.toBe(firstPlayer);

    // 9. Tester les fonctionnalités de la dialog
    // Ouvrir la légende
    await page.getByRole('button', { name: /Légende/i }).click();
    await expect(page.getByText(/Symboles de marques/i)).toBeVisible();
    await page.getByRole('button', { name: /Fermer/i }).click();

    // 10. Ouvrir les paramètres
    await page.getByRole('button', { name: /Paramètres/i }).click();
    await expect(page.getByRole('button', { name: /Nouvelle partie/i })).toBeVisible();

    // 11. Retour à l'accueil via Quitter
    await page.getByRole('button', { name: /Quitter/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('should handle player order selection', async ({ page }) => {
    // Aller à la configuration
    await page.goto('/cricket');

    // Ajouter des joueurs
    const nameInput = page.locator('input[type="text"]').first();

    await nameInput.fill('Alice');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Alice')).toBeVisible();

    await nameInput.fill('Bob');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Bob')).toBeVisible();

    await nameInput.fill('Charlie');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Charlie')).toBeVisible();

    // Commencer la partie
    await page.getByRole('button', { name: /Commencer la partie/i }).click();

    // Gérer la dialog d'ordre des joueurs - choisir "Ordre aléatoire"
    await page.getByRole('button', { name: /Ordre aléatoire/i }).click();

    // Vérifier qu'on est sur la page de jeu
    await page.waitForURL(/\/cricket\/game/);
  });

  test('should display connection button', async ({ page }) => {
    // Configurer et démarrer une partie
    await page.goto('/cricket');

    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('Alice');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Alice')).toBeVisible();

    await nameInput.fill('Bob');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Bob')).toBeVisible();

    await page.getByRole('button', { name: /Commencer la partie/i }).click();

    // Gérer la dialog d'ordre des joueurs - choisir "Ordre aléatoire"
    await page.getByRole('button', { name: /Ordre aléatoire/i }).click();

    await page.waitForURL(/\/cricket\/game/);

    // Vérifier le bouton de connexion Granboard
    const connectButton = page.getByRole('button', { name: /Connecter Granboard|Connecté/i });
    await expect(connectButton).toBeVisible();
  });
});
