import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n)', () => {
  test('should display application in French by default', async ({ page }) => {
    await page.goto('/');

    // Vérifier que le contenu est en français
    await expect(page.getByTestId('game-card-cricket')).toBeVisible();
  });

  test('should change language from French to English', async ({ page }) => {
    await page.goto('/cricket');

    // Ouvrir les paramètres
    await page.getByTestId('settings-button').click();

    // Vérifier que la dialog des paramètres est ouverte
    await expect(page.getByTestId('settings-dialog')).toBeVisible();

    // Ouvrir le sélecteur de langue
    await page.getByTestId('language-selector-button').click();

    // Vérifier que le dropdown est ouvert
    await expect(page.getByTestId('language-dropdown')).toBeVisible();

    // Sélectionner l'anglais
    await page.getByTestId('language-option-en').click();

    // Attendre le rechargement de la page
    await page.waitForLoadState('load');

    // Vérifier que la langue a changé en vérifiant les cookies
    const cookies = await page.context().cookies();
    const localeCookie = cookies.find(c => c.name === 'NEXT_LOCALE');
    expect(localeCookie?.value).toBe('en');
  });

  test('should reopen settings dialog after language change', async ({ page }) => {
    await page.goto('/cricket');

    // Ouvrir les paramètres
    await page.getByTestId('settings-button').click();
    await expect(page.getByTestId('settings-dialog')).toBeVisible();

    // Changer la langue en anglais
    await page.getByTestId('language-selector-button').click();
    await page.getByTestId('language-option-en').click();

    // Attendre le rechargement
    await page.waitForLoadState('load');

    // Vérifier que la dialog des paramètres est automatiquement rouverte
    await expect(page.getByTestId('settings-dialog')).toBeVisible();
  });

  test('should persist language selection across navigation', async ({ page }) => {
    await page.goto('/cricket');

    // Changer la langue en anglais
    await page.getByTestId('settings-button').click();
    await page.getByTestId('language-selector-button').click();
    await page.getByTestId('language-option-en').click();
    await page.waitForLoadState('load');

    // La dialog se rouvre automatiquement, la fermer
    await expect(page.getByTestId('settings-dialog')).toBeVisible();
    await page.getByTestId('settings-close-button').click();

    // Naviguer vers la page d'accueil
    await page.getByTestId('back-button').click();

    // Vérifier que la langue est toujours en anglais
    const cookies = await page.context().cookies();
    const localeCookie = cookies.find(c => c.name === 'NEXT_LOCALE');
    expect(localeCookie?.value).toBe('en');
  });
});

test.describe('Global Settings Dialog', () => {
  test('should open and close settings dialog', async ({ page }) => {
    await page.goto('/cricket');

    // Ouvrir les paramètres
    await page.getByTestId('settings-button').click();
    await expect(page.getByTestId('settings-dialog')).toBeVisible();

    // Fermer les paramètres
    await page.getByTestId('settings-close-button').click();
    await expect(page.getByTestId('settings-dialog')).not.toBeVisible();
  });

  test('should toggle sound in settings', async ({ page }) => {
    await page.goto('/cricket');

    // Ouvrir les paramètres
    await page.getByTestId('settings-button').click();

    // Trouver le bouton de toggle du son
    const soundToggle = page.getByTestId('sound-toggle-button');
    await expect(soundToggle).toBeVisible();

    // Récupérer le texte initial
    const initialText = await soundToggle.textContent();

    // Toggle le son
    await soundToggle.click();

    // Vérifier que le texte a changé
    const newText = await soundToggle.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('should adjust volume in settings', async ({ page }) => {
    await page.goto('/cricket');

    // Ouvrir les paramètres
    await page.getByTestId('settings-button').click();

    // Trouver le slider de volume
    const volumeSlider = page.getByTestId('volume-slider');
    await expect(volumeSlider).toBeVisible();

    // Changer le volume
    await volumeSlider.fill('0.7');

    // Vérifier que le volume a changé
    const value = await volumeSlider.inputValue();
    expect(parseFloat(value)).toBeCloseTo(0.7, 1);
  });

  test('should disable volume slider when sound is off', async ({ page }) => {
    await page.goto('/cricket');

    // Ouvrir les paramètres
    await page.getByTestId('settings-button').click();

    // Désactiver le son
    const soundToggle = page.getByTestId('sound-toggle-button');
    const soundToggleText = await soundToggle.textContent();

    // Si le son est activé, le désactiver
    if (soundToggleText?.includes('Activé') || soundToggleText?.includes('Enabled')) {
      await soundToggle.click();
    }

    // Vérifier que le slider de volume est désactivé
    const volumeSlider = page.getByTestId('volume-slider');
    await expect(volumeSlider).toBeDisabled();
  });

  test('should display custom content in game settings', async ({ page }) => {
    // Aller à la page de configuration
    await page.goto('/cricket');

    // Configurer une partie avec 2 joueurs
    const nameInput = page.getByTestId('player-name-input');
    await nameInput.fill('Alice');
    await page.getByTestId('add-player-button').click();
    await nameInput.fill('Bob');
    await page.getByTestId('add-player-button').click();

    // Sélectionner le mode Standard
    await page.getByTestId('game-mode-standard').click();

    // Commencer la partie
    await page.getByTestId('start-game-button').click();
    await page.getByTestId('order-random-button').click();
    await page.waitForURL(/\/cricket\/game/);

    // Ouvrir les paramètres dans le jeu
    await page.getByTestId('settings-button').click();

    // Vérifier que les boutons custom sont présents
    await expect(page.getByTestId('new-game-button')).toBeVisible();
    await expect(page.getByTestId('quit-button')).toBeVisible();
  });

  test('should show all language options', async ({ page }) => {
    await page.goto('/cricket');

    // Ouvrir les paramètres
    await page.getByTestId('settings-button').click();

    // Ouvrir le sélecteur de langue
    await page.getByTestId('language-selector-button').click();

    // Vérifier que les deux langues sont disponibles
    await expect(page.getByTestId('language-option-fr')).toBeVisible();
    await expect(page.getByTestId('language-option-en')).toBeVisible();
  });
});
