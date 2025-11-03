# Tests End-to-End (E2E)

Ce dossier contient les tests end-to-end pour l'application Granboard utilisant [Playwright](https://playwright.dev/).

## Structure des tests

- `home.spec.ts` - Tests de la page d'accueil
- `cricket-setup.spec.ts` - Tests de la configuration du jeu Cricket
- `cricket-game.spec.ts` - Tests de l'interface de jeu Cricket
- `cricket-full-flow.spec.ts` - Tests du flux complet de l'application

## Commandes disponibles

### Exécuter les tests

```bash
# Exécuter tous les tests E2E
npm run test:e2e

# Exécuter les tests en mode UI (interface graphique)
npm run test:e2e:ui

# Exécuter les tests en mode debug
npm run test:e2e:debug

# Afficher le rapport des derniers tests
npm run test:e2e:report
```

### Exécuter un test spécifique

```bash
# Un fichier de test spécifique
npx playwright test e2e/home.spec.ts

# Un test spécifique par nom
npx playwright test -g "should display the home page"
```

### Options utiles

```bash
# Exécuter les tests en mode headed (avec navigateur visible)
npx playwright test --headed

# Exécuter sur un navigateur spécifique
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Exécuter avec un nombre spécifique de workers
npx playwright test --workers=1
```

## Configuration

La configuration se trouve dans `playwright.config.ts` à la racine du projet.

### Paramètres importants

- **baseURL**: `http://localhost:3000`
- **Navigateurs testés**: Chromium, Firefox, WebKit
- **webServer**: Lance automatiquement `npm run dev` avant les tests

## Écrire de nouveaux tests

### Structure de base

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup commun pour chaque test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Votre test ici
    await expect(page.getByText('Hello')).toBeVisible();
  });
});
```

### Bonnes pratiques

1. **Utilisez des sélecteurs robustes**
   - Préférer `getByRole`, `getByText`, `getByLabel`
   - Éviter les sélecteurs CSS fragiles

2. **Attendez les éléments**
   - Playwright attend automatiquement, mais utilisez `waitForURL`, `waitForTimeout` si nécessaire

3. **Tests isolés**
   - Chaque test doit être indépendant
   - Utilisez `beforeEach` pour la configuration

4. **Nommage clair**
   - Utilisez des noms descriptifs pour les tests
   - Format: "should [action] [expected result]"

## Debugging

### Mode debug

```bash
npm run test:e2e:debug
```

Permet de:
- Exécuter les tests pas à pas
- Inspecter les sélecteurs
- Voir l'état de la page

### Trace Viewer

Si un test échoue, les traces sont automatiquement capturées:

```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Screenshots et vidéos

Les screenshots et vidéos sont automatiquement capturés en cas d'échec et stockés dans `test-results/`.

## CI/CD

Les tests peuvent être exécutés dans un environnement CI. La configuration détecte automatiquement `process.env.CI` et ajuste:
- Nombre de workers (1 en CI)
- Retries (2 en CI)
- Interdit `test.only`

## Ressources

- [Documentation Playwright](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
