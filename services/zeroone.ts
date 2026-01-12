import { Segment, SegmentType } from "./boardinfo";
import {
  LegSettings,
  LegWinCondition,
  StartingPlayerRule,
  MatchState,
  createMatchState,
  updateMatchState,
  getNextStartingPlayer,
  MatchFormat,
} from './match';

// Zero-One game modes: 301, 501, 701
export enum ZeroOneMode {
  ThreeOhOne = 301,
  FiveOhOne = 501,
  SevenOhOne = 701,
}

export interface Player {
  id: string;
  name: string;
}

export interface PlayerZeroOneState {
  player: Player;
  currentScore: number; // Remaining score (starts at 301/501/701)
  totalPointsScored: number; // Total points scored throughout the game
  dartsThrown: number; // Total darts thrown
  roundsPlayed: number; // Number of rounds this player has completed
  checkoutAttempts: number; // Number of times player was on a checkout
  busts: number; // Number of busts
}

// Alias for easier imports
export type PlayerState = PlayerZeroOneState;

// Re-export leg settings from match module
export { LegWinCondition, StartingPlayerRule } from './match';
export type { LegSettings } from './match';

export interface ZeroOneGameState {
  players: PlayerZeroOneState[];
  currentPlayerIndex: number;
  dartsThrown: number; // 0-2 (3 darts per turn)
  currentRound: number; // Current round number (starts at 1)
  maxRounds: number; // Maximum number of rounds (0 = unlimited)
  gameStarted: boolean;
  gameFinished: boolean;
  winner: Player | null;
  mode: ZeroOneMode;
  doubleOut: boolean; // Requires finishing on a double
  lastProcessedHit?: string; // To prevent double processing in React Strict Mode
  turnScore: number; // Points scored in current turn (for bust detection)
  // Leg match fields
  matchState: MatchState;
  legSettings: LegSettings;
}

export const createInitialPlayerState = (
  player: Player,
  startingScore: number
): PlayerZeroOneState => {
  return {
    player,
    currentScore: startingScore,
    totalPointsScored: 0,
    dartsThrown: 0,
    roundsPlayed: 0,
    checkoutAttempts: 0,
    busts: 0,
  };
};

export const createInitialGameState = (
  players: Player[],
  mode: ZeroOneMode = ZeroOneMode.FiveOhOne,
  doubleOut: boolean = false,
  maxRounds: number = 0,
  legSettings: LegSettings = {
    format: MatchFormat.Legs,
    legWinCondition: LegWinCondition.FirstTo,
    legCount: 3,
    startingPlayerRule: StartingPlayerRule.Alternate,
  }
): ZeroOneGameState => {
  return {
    players: players.map((p) => createInitialPlayerState(p, mode)),
    currentPlayerIndex: 0,
    dartsThrown: 0,
    currentRound: 1,
    maxRounds,
    gameStarted: true,
    gameFinished: false,
    winner: null,
    mode,
    doubleOut,
    turnScore: 0,
    matchState: createMatchState(players.length, legSettings),
    legSettings,
  };
};

/**
 * Calculate the value of a dart hit based on segment
 */
export const calculateDartValue = (segment: Segment): number => {
  const section = segment.Section as number;

  switch (segment.Type) {
    case SegmentType.Single:
      return section;
    case SegmentType.Double:
      return section * 2;
    case SegmentType.Triple:
      return section * 3;
    default:
      return 0;
  }
};

/**
 * Check if a score would result in a bust
 * - Can't go below 0
 * - Can't land on exactly 1 (impossible to finish with double out)
 * - If double out is required and score would reach 0 but not on a double, it's a bust
 */
export const isBust = (
  currentScore: number,
  dartValue: number,
  isDouble: boolean,
  doubleOut: boolean
): boolean => {
  const newScore = currentScore - dartValue;

  // Going below 0 is always a bust
  if (newScore < 0) return true;

  // Landing on exactly 1 is a bust (can't finish with double out from 1)
  if (newScore === 1) return true;

  // If double out is required and we hit exactly 0 but not on a double, it's a bust
  if (doubleOut && newScore === 0 && !isDouble) return true;

  return false;
};

/**
 * Check if current score is a valid checkout score
 * A checkout is possible if score is 170 or less (max checkout: T20, T20, Bull)
 */
export const isCheckoutScore = (score: number): boolean => {
  return score > 0 && score <= 170;
};

/**
 * Get checkout suggestion for a given score
 * Returns a human-readable suggestion for common checkouts
 */
export const getCheckoutSuggestion = (score: number): string | null => {
  const checkouts: Record<number, string> = {
    170: "T20, T20, Bull",
    167: "T20, T19, Bull",
    164: "T20, T18, Bull",
    161: "T20, T17, Bull",
    160: "T20, T20, D20",
    158: "T20, T20, D19",
    157: "T20, T19, D20",
    156: "T20, T20, D18",
    155: "T20, T19, D19",
    154: "T20, T18, D20",
    153: "T20, T19, D18",
    152: "T20, T20, D16",
    151: "T20, T17, D20",
    150: "T20, T18, D18",
    // Common lower checkouts
    110: "T20, Bull",
    107: "T19, Bull",
    104: "T18, Bull",
    101: "T17, Bull",
    100: "T20, D20",
    90: "T20, D15",
    80: "T20, D10",
    70: "T10, D20",
    60: "20, D20",
    50: "Bull",
    40: "D20",
  };

  return checkouts[score] || null;
};

export const processDartHit = (
  gameState: ZeroOneGameState,
  segment: Segment,
  hitId?: string
): ZeroOneGameState => {
  if (!gameState.gameStarted || gameState.gameFinished) {
    return gameState;
  }

  // Don't process dart hit if 3 darts have already been thrown
  if (gameState.dartsThrown >= 3) {
    return gameState;
  }

  // Prevent double processing (React Strict Mode issue)
  if (hitId && gameState.lastProcessedHit === hitId) {
    console.log("⚠️ Hit already processed:", hitId);
    return gameState;
  }

  const newState = { ...gameState };
  const currentPlayer = newState.players[newState.currentPlayerIndex];

  const dartValue = calculateDartValue(segment);
  const isDouble = segment.Type === SegmentType.Double;

  console.log("🎯 Dart hit:", {
    player: currentPlayer.player.name,
    segment: `${segment.Section} ${segment.Type}`,
    dartValue,
    currentScore: currentPlayer.currentScore,
    turnScore: newState.turnScore,
  });

  // Check for bust
  if (isBust(currentPlayer.currentScore, dartValue, isDouble, newState.doubleOut)) {
    console.log("💥 BUST!");
    currentPlayer.busts++;
    // Score reverts to what it was at start of turn
    // Turn score is cleared
    newState.turnScore = 0;
    // Mark turn as complete by setting darts to 3
    newState.dartsThrown = 3;

    if (hitId) {
      newState.lastProcessedHit = hitId;
    }

    return newState;
  }

  // Valid hit - update scores
  currentPlayer.currentScore -= dartValue;
  currentPlayer.totalPointsScored += dartValue;
  currentPlayer.dartsThrown++;
  newState.turnScore += dartValue;

  console.log("✅ Score updated:", {
    newScore: currentPlayer.currentScore,
    totalScored: currentPlayer.totalPointsScored,
    turnScore: newState.turnScore,
  });

  // Check for win condition (exactly 0)
  if (currentPlayer.currentScore === 0) {
    newState.gameFinished = true;
    newState.winner = currentPlayer.player;
    console.log("🏆 Winner:", currentPlayer.player.name);

    const winnerIndex = newState.currentPlayerIndex;
    const matchUpdate = updateMatchState(
      newState.matchState,
      newState.legSettings,
      winnerIndex
    );
    newState.matchState = matchUpdate.updatedMatchState;

    if (matchUpdate.matchWon) {
      // Match is finished, keep gameFinished = true (leg finished)
      // matchState already has matchFinished = true and matchWinner set
    } else {
      // Match not finished, transition to next leg
      // Reset player scores
      newState.players = newState.players.map((playerState) =>
        createInitialPlayerState(playerState.player, newState.mode)
      );
      // Reset game-specific fields
      newState.dartsThrown = 0;
      newState.currentRound = 1;
      newState.turnScore = 0;
      newState.gameFinished = false;
      newState.winner = null;
      newState.lastProcessedHit = undefined;
      // Determine starting player based on nextLegState
      if (matchUpdate.nextLegState) {
        newState.currentPlayerIndex = matchUpdate.nextLegState.startingPlayerIndex;
      } else {
        // Fallback: alternate (should not happen)
        newState.currentPlayerIndex = (winnerIndex + 1) % newState.players.length;
      }
    }
  }

  // Increment darts thrown (max 3)
  newState.dartsThrown = Math.min(newState.dartsThrown + 1, 3);

  // Mark this hit as processed
  if (hitId) {
    newState.lastProcessedHit = hitId;
  }

  return newState;
};

export const cloneGameState = (state: ZeroOneGameState): ZeroOneGameState => {
  return {
    ...state,
    players: state.players.map((playerState) => ({
      ...playerState,
    })),
    matchState: {
      ...state.matchState,
      legWins: [...state.matchState.legWins],
      setWins: state.matchState.setWins ? [...state.matchState.setWins] : undefined,
    },
    legSettings: { ...state.legSettings },
  };
};

export const nextPlayer = (
  gameState: ZeroOneGameState
): ZeroOneGameState => {
  if (!gameState.gameStarted || gameState.gameFinished) {
    return gameState;
  }

  // Deep clone the game state to ensure React detects the change
  const newState = cloneGameState(gameState);

  // Increment rounds played for current player (they just finished their turn)
  newState.players[newState.currentPlayerIndex].roundsPlayed++;

  // Reset darts thrown and turn score for next player
  newState.dartsThrown = 0;
  newState.turnScore = 0;

  // Clear last processed hit for new turn
  newState.lastProcessedHit = undefined;

  // Move to next player
  const nextPlayerIndex =
    (newState.currentPlayerIndex + 1) % newState.players.length;

  // Check if we're starting a new round (back to first player)
  if (nextPlayerIndex === 0) {
    newState.currentRound++;

    // Check if we've reached max rounds
    if (newState.maxRounds > 0 && newState.currentRound > newState.maxRounds) {
      newState.gameFinished = true;
      // Determine winner by lowest remaining score
      const minScore = Math.min(...newState.players.map((p) => p.currentScore));
      const winner = newState.players.find((p) => p.currentScore === minScore);
      newState.winner = winner?.player || null;
    }
  }

  newState.currentPlayerIndex = nextPlayerIndex;

  return newState;
};

/**
 * Calculate Points Per Dart (PPD) for a player
 * PPD = Total Points Scored / Darts Thrown
 * @param playerState The player's state
 * @returns The PPD rounded to 2 decimal places
 */
export const calculatePPD = (playerState: PlayerZeroOneState): number => {
  if (playerState.dartsThrown === 0) return 0;
  return Math.round((playerState.totalPointsScored / playerState.dartsThrown) * 100) / 100;
};

/**
 * Calculate Points Per Round (PPR) for a player
 * PPR = Total Points Scored / Rounds Played
 * @param playerState The player's state
 * @returns The PPR rounded to 2 decimal places
 */
export const calculatePPR = (playerState: PlayerZeroOneState): number => {
  if (playerState.roundsPlayed === 0) return 0;
  return Math.round((playerState.totalPointsScored / playerState.roundsPlayed) * 100) / 100;
};

/**
 * Calculate average for a player (3-dart average)
 * This is the standard way to express scoring in 01 games
 * @param playerState The player's state
 * @returns The 3-dart average rounded to 2 decimal places
 */
export const calculateAverage = (playerState: PlayerZeroOneState): number => {
  if (playerState.roundsPlayed === 0) return 0;
  return calculatePPD(playerState) * 3;
};

