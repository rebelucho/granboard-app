# Общий сервис управления легами и сетами

## Цель
Создать единый модуль для управления легами и сетами, который можно использовать во всех трёх играх (01, Cricket, TargetBull). Это обеспечит:
- Единообразие логики
- Упрощение отладки
- Соблюдение принципов SOLID (разделение ответственности)

## Архитектура

### Основные интерфейсы

```typescript
// Общий интерфейс игрока (уже существует в каждом сервисе)
export interface Player {
  id: string;
  name: string;
}

// Условие победы в леге
export enum LegWinCondition {
  FirstTo = 'firstTo',    // "До победы в N легах"
  BestOf = 'bestOf',      // "Лучший из N легов"
}

// Правило стартующего игрока
export enum StartingPlayerRule {
  Alternate = 'alternate', // "По очереди"
  Loser = 'loser',         // "Проигравший"
}

// Формат матча
export enum MatchFormat {
  Legs = 'legs',  // Игра по легам
  Sets = 'sets',  // Игра по сетам
}

// Настройки легов/сетов
export interface LegSettings {
  format: MatchFormat;
  legWinCondition: LegWinCondition;
  legCount: number;
  startingPlayerRule: StartingPlayerRule;
  
  // Настройки для формата "сеты"
  sets?: {
    bestOf?: number;           // Лучший из N сетов
    legsToWinSet?: number;     // Победных легов в сете
  };
}

// Состояние матча
export interface MatchState {
  legWins: number[];      // Количество выигранных легов для каждого игрока
  currentLeg: number;     // Текущий лег (начиная с 1)
  currentSet?: number;    // Текущий сет (если format === 'sets')
  setWins?: number[];     // Победы в сетах (если format === 'sets')
  matchFinished: boolean;
  matchWinner: Player | null;
}

// Результат обработки победы в леге
export interface MatchUpdateResult {
  updatedMatchState: MatchState;
  matchWon: boolean;             // Завершён ли весь матч
  nextLegState?: NextLegState;   // Информация для следующего лега (если матч продолжается)
}

// Состояние для следующего лега
export interface NextLegState {
  startingPlayerIndex: number;   // Индекс игрока, который начинает следующий лег
  resetScores: boolean;          // Нужно ли сбрасывать счёт игроков
}
```

### Основные функции

```typescript
/**
 * Создать начальное состояние матча
 */
export function createMatchState(
  playerCount: number,
  settings: LegSettings
): MatchState;

/**
 * Обновить состояние матча после победы в леге
 * Возвращает обновлённое состояние матча и информацию о необходимости перехода к следующему легу
 */
export function updateMatchState(
  matchState: MatchState,
  settings: LegSettings,
  winnerIndex: number
): MatchUpdateResult;

/**
 * Определить игрока, который будет начинать следующий лег
 */
export function getNextStartingPlayer(
  winnerIndex: number,
  playerCount: number,
  startingPlayerRule: StartingPlayerRule
): number;

/**
 * Проверить, достигнут ли необходимый счёт для победы в матче
 */
export function isMatchWon(
  legWins: number[],
  settings: LegSettings
): { won: boolean; winnerIndex: number | null };

/**
 * Сбросить состояние матча для нового лега (без изменения счёта легов)
 */
export function resetForNextLeg(
  matchState: MatchState,
  settings: LegSettings
): MatchState;
```

### Интеграция с существующими сервисами

Каждый сервис игры должен:

1. Импортировать общие интерфейсы и функции из `match.ts`
2. Включать `LegSettings` и `MatchState` в своё состояние игры
3. В `processDartHit` при победе в леге вызывать `updateMatchState`
4. Если матч продолжается, выполнить сброс состояния игры (счёт, раунды) и установить `currentPlayerIndex` в соответствии с `nextLegState.startingPlayerIndex`

## Изменения в существующих сервисах

### 01 (zeroone.ts)
- Заменить локальные `LegSettings`, `LegWinCondition`, `StartingPlayerRule` на общие
- Использовать `MatchState` вместо отдельных полей `legWins`, `currentLeg`, `matchFinished`, `matchWinner`
- Обновить `processDartHit` для использования `updateMatchState`

### Cricket (cricket.ts)
- Заменить `CricketLegSettings` на общий `LegSettings`
- Использовать `MatchState` вместо отдельных полей
- Обновить логику легов в `processDartHit`

### TargetBull (targetbull.ts)
- Аналогично Cricket

## UI-интеграция

### Настройки игры
Страницы настройки (`/app/01/page.tsx`, `/app/cricket/page.tsx`, `/app/targetbull/page.tsx`) уже имеют UI для выбора формата легов. Нужно убедиться, что они передают корректные `LegSettings` в инициализацию игры.

### Отображение во время игры
Компоненты `ScoreBoard` должны отображать:
- Текущий лег (и сет, если игра по сетам)
- Счёт легов для каждого игрока
- Правило стартующего игрока (опционально)

### Статистика после игры
Нужно добавить обобщённую статистику матча:
- Количество выигранных легов/сетов
- Общий победитель матча

## Преимущества подхода

1. **Единообразие**: Одинаковая логика во всех играх
2. **Отладка**: Все проблемы с легами можно отследить в одном модуле
3. **Расширяемость**: Легко добавить новые форматы матчей (например, суперсеты)
4. **Тестирование**: Модуль можно тестировать изолированно

## Риски и миграция

- Существующие игры уже используют леги, нужно убедиться в обратной совместимости
- Тесты должны быть обновлены для работы с новым модулем
- Возможна временная деградация во время миграции

## План реализации

1. Создать файл `services/match.ts` с описанными интерфейсами и функциями
2. Обновить `zeroone.ts` для использования общего модуля
3. Обновить `cricket.ts` и `targetbull.ts`
4. Обновить хуки `use*GameState`
5. Обновить UI компоненты для отображения состояния матча
6. Протестировать каждую игру
7. Добавить/обновить e2e тесты

## Вопросы для обсуждения

1. Нужна ли поддержка более двух игроков в сетах?
2. Как обрабатывать ничьи в сетах?
3. Нужны ли дополнительные настройки (например, "тай-брейк" леги)?
