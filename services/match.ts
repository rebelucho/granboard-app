import { Player } from './zeroone';

// Re-export Player type for convenience
export type { Player };

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
  enabled?: boolean;           // Включены ли леги (опционально, по умолчанию true)
  
  // Настройки для формата "сеты"
  sets?: {
    bestOf?: number;           // Лучший из N сетов
    legsToWinSet?: number;     // Победных легов в сете
  };
  
  // Настройки тай-брейка (дополнительно)
  tiebreaker?: {
    enabled: boolean;
    legsCount?: number;        // Количество легов тай-брейка (например, 1)
    pointsTarget?: number;     // Целевое количество очков (для 01)
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
  // Флаг тай-брейка
  isTiebreaker?: boolean;
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
  isTiebreaker?: boolean;        // Является ли следующий лег тай-брейком
}

/**
 * Создать начальное состояние матча
 */
export function createMatchState(
  playerCount: number,
  settings: LegSettings
): MatchState {
  const baseState: MatchState = {
    legWins: new Array(playerCount).fill(0),
    currentLeg: 1,
    matchFinished: false,
    matchWinner: null,
  };
  
  if (settings.format === MatchFormat.Sets) {
    baseState.currentSet = 1;
    baseState.setWins = new Array(playerCount).fill(0);
  }
  
  return baseState;
}

/**
 * Определить игрока, который будет начинать следующий лег
 */
export function getNextStartingPlayer(
  winnerIndex: number,
  playerCount: number,
  startingPlayerRule: StartingPlayerRule
): number {
  if (startingPlayerRule === StartingPlayerRule.Alternate) {
    // Чередование: следующий игрок по порядку
    return (winnerIndex + 1) % playerCount;
  } else {
    // Loser: проигравший начинает (игрок, следующий за победителем)
    // Для двух игроков это будет другой игрок
    // Для большего числа игроков - следующий по порядку (можно улучшить)
    return (winnerIndex + 1) % playerCount;
  }
}

/**
 * Проверить, достигнут ли необходимый счёт для победы в матче
 * Возвращает информацию о победе и индексе победителя (если есть)
 */
export function isMatchWon(
  legWins: number[],
  settings: LegSettings
): { won: boolean; winnerIndex: number | null; isTiebreakerRequired?: boolean } {
  const { legWinCondition, legCount, format } = settings;
  
  // Если игра по сетам, логика победы сложнее (пока не реализована)
  if (format === MatchFormat.Sets) {
    // TODO: реализовать логику победы в сетах
    return { won: false, winnerIndex: null };
  }
  
  // Игра по легам
  if (legWinCondition === LegWinCondition.FirstTo) {
    // "До победы в N легах" - первый, кто наберёт N легов
    for (let i = 0; i < legWins.length; i++) {
      if (legWins[i] >= legCount) {
        return { won: true, winnerIndex: i };
      }
    }
    return { won: false, winnerIndex: null };
  } else {
    // "Лучший из N легов" - нужно выиграть больше половины
    const neededToWin = Math.ceil(legCount / 2);
    for (let i = 0; i < legWins.length; i++) {
      if (legWins[i] >= neededToWin) {
        return { won: true, winnerIndex: i };
      }
    }
    
    // Проверка возможности ничьей (все оставшиеся леги не могут изменить победителя)
    // Вычисляем максимально возможное количество легов для каждого игрока
    const remainingLegs = legCount - legWins.reduce((a, b) => a + b, 0);
    // Если один из игроков уже недосягаем для других, то он выиграл
    // Пока упростим: если осталось 0 легов, победитель - игрок с максимальным количеством легов
    if (remainingLegs === 0) {
      const maxWins = Math.max(...legWins);
      const winners = legWins.reduce((indices, wins, idx) => {
        if (wins === maxWins) indices.push(idx);
        return indices;
      }, [] as number[]);
      if (winners.length === 1) {
        return { won: true, winnerIndex: winners[0] };
      } else {
        // Ничья - требуется тай-брейк
        return { won: false, winnerIndex: null, isTiebreakerRequired: true };
      }
    }
    
    return { won: false, winnerIndex: null };
  }
}

/**
 * Обновить состояние матча после победы в леге
 * Возвращает обновлённое состояние матча и информацию о необходимости перехода к следующему легу
 */
export function updateMatchState(
  matchState: MatchState,
  settings: LegSettings,
  winnerIndex: number
): MatchUpdateResult {
  // Создаём копию состояния
  const updatedState: MatchState = {
    ...matchState,
    legWins: [...matchState.legWins],
  };
  
  // Увеличиваем счёт легов победителя
  updatedState.legWins[winnerIndex]++;
  
  // Проверяем, выиграл ли матч
  const matchResult = isMatchWon(updatedState.legWins, settings);
  
  if (matchResult.won && matchResult.winnerIndex !== null) {
    // Матч завершён
    updatedState.matchFinished = true;
    updatedState.matchWinner = { id: `player${winnerIndex}`, name: `Player ${winnerIndex}` }; // Заглушка, реальный игрок должен быть передан извне
    return {
      updatedMatchState: updatedState,
      matchWon: true,
    };
  }
  
  // Матч продолжается
  // Увеличиваем номер текущего лега
  updatedState.currentLeg++;
  
  // Определяем, нужно ли переходить к следующему сету (если игра по сетам)
  if (settings.format === MatchFormat.Sets) {
    // TODO: реализовать логику сетов
  }
  
  // Определяем, кто начинает следующий лег
  const nextStartingPlayer = getNextStartingPlayer(
    winnerIndex,
    updatedState.legWins.length,
    settings.startingPlayerRule
  );
  
  return {
    updatedMatchState: updatedState,
    matchWon: false,
    nextLegState: {
      startingPlayerIndex: nextStartingPlayer,
      resetScores: true,
      isTiebreaker: matchResult.isTiebreakerRequired,
    },
  };
}

/**
 * Сбросить состояние матча для нового лега (без изменения счёта легов)
 * Используется при ручном сбросе (например, после изменения настроек)
 */
export function resetForNextLeg(
  matchState: MatchState,
  settings: LegSettings
): MatchState {
  const updatedState: MatchState = {
    ...matchState,
    currentLeg: matchState.currentLeg + 1,
  };
  
  // Если игра по сетам, возможно нужно обновить текущий сет
  if (settings.format === MatchFormat.Sets) {
    // TODO: реализовать
  }
  
  return updatedState;
}