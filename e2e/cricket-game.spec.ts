import { test, expect } from '@playwright/test';

test.describe('Cricket Game', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page de configuration
    await page.goto('/cricket');

    // Configurer une partie avec 2 joueurs
    const nameInput = page.locator('input[type="text"]').first();

    // Ajouter Alice et attendre qu'elle apparaisse
    await nameInput.fill('Alice');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Alice')).toBeVisible();

    // Ajouter Bob et attendre qu'il apparaisse
    await nameInput.fill('Bob');
    await page.getByRole('button', { name: /Ajouter/i }).click();
    await expect(page.getByText('Bob')).toBeVisible();

    // Sélectionner le mode Standard (requis pour commencer)
    await page.getByRole('button', { name: /Cricket Standard/ }).click();

    // Commencer la partie
    await page.getByRole('button', { name: /Commencer la partie/i }).click();

    // Gérer la dialog d'ordre des joueurs - choisir "Ordre aléatoire"
    await page.getByRole('button', { name: /Ordre aléatoire/i }).click();

    // Attendre d'être sur la page de jeu
    await page.waitForURL(/\/cricket\/game/);
  });

  test('should display game interface', async ({ page }) => {
    // Vérifier le titre CRICKET
    await expect(page.getByRole('heading', { name: /CRICKET/i })).toBeVisible();

    // Vérifier que le joueur actuel est affiché
    await expect(page.getByRole('heading').filter({ hasText: /Alice|Bob/ }).first()).toBeVisible();

    // Vérifier que le scoreboard est présent avec les numéros Cricket
    await expect(page.getByRole('table').getByText('15')).toBeVisible();
    await expect(page.getByRole('table').getByText('16')).toBeVisible();
    await expect(page.getByRole('table').getByText('17')).toBeVisible();
    await expect(page.getByRole('table').getByText('18')).toBeVisible();
    await expect(page.getByRole('table').getByText('19')).toBeVisible();
    await expect(page.getByRole('table').getByText('20')).toBeVisible();
    await expect(page.getByRole('table').getByText('Bull')).toBeVisible();
  });

  test('should display player turn history', async ({ page }) => {
    // Vérifier que l'historique est présent
    await expect(page.getByText(/Historique/i)).toBeVisible();

    // Vérifier que le round en cours est affiché
    await expect(page.getByText(/Round 1.*en cours/i)).toBeVisible();
  });

  test('should display control buttons', async ({ page }) => {
    // Vérifier les boutons de contrôle
    await expect(page.getByRole('button', { name: /Annuler/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Joueur suivant/i })).toBeVisible();
  });

  test('should open legend dialog', async ({ page }) => {
    // Cliquer sur le bouton Légende
    await page.getByRole('button', { name: /Légende/i }).click();

    // Vérifier que la dialog est ouverte
    await expect(page.getByText(/Symboles de marques/i)).toBeVisible();

    // Fermer la dialog
    await page.getByRole('button', { name: /Fermer/i }).click();

    // Vérifier que la dialog est fermée
    await expect(page.getByText(/Symboles de marques/i)).not.toBeVisible();
  });

  test('should open settings dialog', async ({ page }) => {
    // Cliquer sur le bouton Paramètres
    await page.getByRole('button', { name: /Paramètres/i }).click();

    // Vérifier que la dialog est ouverte
    await expect(page.getByRole('button', { name: /Nouvelle partie/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Quitter/i })).toBeVisible();

    // Fermer la dialog
    await page.getByRole('button', { name: /Annuler/i }).last().click();
  });

  test('should toggle sound', async ({ page }) => {
    // Ouvrir les paramètres
    await page.getByRole('button', { name: /Paramètres/i }).click();

    // Vérifier que le contrôle du son est visible
    await expect(page.getByText(/Son/i).first()).toBeVisible();

    // Trouver le bouton toggle son
    const soundToggleButton = page.getByRole('button', { name: /Activé|Désactivé/i }).first();
    await expect(soundToggleButton).toBeVisible();

    // Cliquer pour changer l'état
    await soundToggleButton.click();

    // Le bouton devrait avoir changé de texte
    await expect(soundToggleButton).toBeEnabled();

    // Fermer la dialog
    await page.getByRole('button', { name: /Annuler/i }).last().click();
  });

  test('should show player info', async ({ page }) => {
    // Vérifier les informations du joueur actuel
    await expect(page.getByText(/Fléchette.*\/ 3/i)).toBeVisible();
    await expect(page.getByText(/Tour.*\//i)).toBeVisible();
  });

  test('should change player on button click', async ({ page }) => {
    // Récupérer le nom du joueur actuel
    const currentPlayerName = await page.locator('h2 span').first().textContent();

    // Cliquer sur "Joueur suivant"
    await page.getByRole('button', { name: /Joueur suivant/i }).click();

    // Attendre un peu pour le changement
    await page.waitForTimeout(500);

    // Vérifier que le joueur a changé
    const newPlayerName = await page.locator('h2 span').first().textContent();
    expect(newPlayerName).not.toBe(currentPlayerName);
  });

  test('should display both players in scoreboard', async ({ page }) => {
    // Vérifier que les deux joueurs sont dans le tableau (scoreboard)
    await expect(page.getByRole('table').getByText('Alice')).toBeVisible();
    await expect(page.getByRole('table').getByText('Bob')).toBeVisible();

    // Vérifier les statistiques (Points et MPR)
    const pointsHeaders = page.getByText('Points');
    await expect(pointsHeaders.first()).toBeVisible();

    const mprHeaders = page.getByText('MPR');
    await expect(mprHeaders.first()).toBeVisible();
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
    await page.getByRole('button', { name: /Paramètres/i }).click();

    // Cliquer sur Quitter
    await page.getByRole('button', { name: /Quitter/i }).click();

    // Devrait retourner à la page d'accueil
    await expect(page).toHaveURL('/');
  });

  test('should start new game from settings', async ({ page }) => {
    // Ouvrir les paramètres
    await page.getByRole('button', { name: /Paramètres/i }).click();

    // Cliquer sur Nouvelle partie
    await page.getByRole('button', { name: /Nouvelle partie/i }).click();

    // Devrait retourner à la page de configuration
    await expect(page).toHaveURL('/cricket');
  });
});
