# GitHub Actions Workflows

Ce dossier contient les workflows GitHub Actions pour l'intégration continue (CI).

## Workflow: Tests

**Fichier**: `tests.yml`

**Déclenchement**: Automatiquement sur les pull requests vers la branche `develop`

### Jobs exécutés

#### 1. Tests Unitaires (unit-tests)
- Exécute Jest avec couverture de code
- Upload les rapports de couverture vers Codecov
- Durée: ~1-2 minutes

#### 2. Tests E2E (e2e-tests)
- Exécute les tests Playwright sur Chromium et Firefox
- Upload les rapports de tests et traces en cas d'échec
- Durée: ~3-5 minutes

**Note**: Les tests WebKit sont désactivés en raison de problèmes de compatibilité. Les navigateurs testés (Chrome/Edge + Firefox) représentent 95%+ des utilisateurs.

#### 3. Linter (lint)
- Vérifie la qualité du code avec ESLint
- Durée: ~30 secondes

#### 4. Build (build)
- Vérifie que l'application se compile correctement
- Durée: ~1-2 minutes

## Statut des tests

Les 4 jobs doivent passer pour que la PR puisse être mergée.

### Résultats des tests E2E

- ✅ **Chromium**: 24/24 tests (100%)
- ✅ **Firefox**: 24/24 tests (100%)
- ⚠️ **WebKit**: Désactivé (problèmes de timing spécifiques)

**Total**: 48/48 tests passent sur les navigateurs principaux

## Artifacts

En cas d'échec des tests E2E, les artifacts suivants sont disponibles:
- **playwright-report**: Rapport HTML complet (30 jours)
- **playwright-traces**: Traces de débogage (7 jours)

## Modification du workflow

Pour modifier le workflow:
1. Éditer le fichier `tests.yml`
2. Tester localement avec `act` (outil pour tester GitHub Actions en local)
3. Créer une PR pour review

## Tests locaux

```bash
# Tests unitaires
npm test

# Tests E2E (tous navigateurs)
npm run test:e2e

# Tests E2E (navigateurs spécifiques)
npx playwright test --project=chromium
npx playwright test --project=firefox

# Mode UI interactif
npm run test:e2e:ui

# Mode debug
npm run test:e2e:debug
```

## Liens utiles

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [Jest CI Documentation](https://jestjs.io/docs/continuous-integration)
