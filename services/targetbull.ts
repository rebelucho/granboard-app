import { Segment, SegmentSection, SegmentType } from "./boardinfo";

export enum BullSplitMode {
  Split = "split",      // 25 for 25, 50 for Bull
  Unified = "unified",  // 50 for both 25 and Bull
}

export interface Player {
  id: string;
  name: string;
}

export interface PlayerTargetBullState {
  player: Player;
  totalScore: number;          // Total points accumulated
  dartsThrown: number;         // Total darts thrown throughout the game
  roundsPlayed: number;        // Number of rounds this player has completed
  hits25: number;              // Number of successful hits on 25
  hitsBull: number;            // Number of successful hits on Bull (single bull)
  hitsDoubleBull: number;      // Number of successful hits on Double Bull (if applicable)
}

export interface TargetBullGameState {
  players: PlayerTargetBullState[];
  currentPlayerIndex: number;
  dartsThrown: number;         // 0-2 (3 darts per turn)
  currentRound: number;        // Current round number (starts at 1)
  maxRounds: number;           // Maximum number of rounds (0 = unlimited)
  targetScore: number;         // Target score to reach (0 = unlimited)
  gameStarted: boolean;
  gameFinished: boolean;
  winner: Player | null;
  bullSplitMode: BullSplitMode;
  lastProcessedHit?: string;   // To prevent double processing in React Strict Mode
}

export const createInitialPlayerState = (
  player: Player
): PlayerTargetBullState => {
  return {
    player,
    totalScore: 0,
    dartsThrown: 0,
    roundsPlayed: 0,
    hits25: 0,
    hitsBull: 0,
    hitsDoubleBull: 0,
  };
};

export const createInitialGameState = (
  players: Player[],
  bullSplitMode: BullSplitMode = BullSplitMode.Split,
  maxRounds: number = 10,
  targetScore: number = 0
): TargetBullGameState => {
  return {
    players: players.map(createInitialPlayerState),
    currentPlayerIndex: 0,
    dartsThrown: 0,
    currentRound: 1,
    maxRounds,
    targetScore,
    gameStarted: true,
    gameFinished: false,
    winner: null,
    bullSplitMode,
  };
};

/**
 * Calculate the value of a dart hit based on segment and bull split mode
 */
export const calculateDartValue = (
  segment: Segment,
  bullSplitMode: BullSplitMode
): number => {
  const section = segment.Section;
  const type = segment.Type;

  // Only bull section (25) is considered
  if (section === SegmentSection.BULL) {
    if (type === SegmentType.Double) {
      // Double bull always 50 points
      return 50;
    } else {
      // Single bull (type Single) or other types (should not happen)
      if (bullSplitMode === BullSplitMode.Split) {
        return 25;
      } else {
        // Unified mode: single bull counts as 50
        return 50;
      }
    }
  }
  // Any other section (1-20, miss) counts as 0
  return 0;
};

/**
 * Check if a segment is a valid target (bull section)
 */
export const isValidTarget = (segment: Segment): boolean => {
  return segment.Section === SegmentSection.BULL;
};

export const processDartHit = (
  gameState: TargetBullGameState,
  segment: Segment,
  hitId?: string
): TargetBullGameState => {
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

  const dartValue = calculateDartValue(segment, newState.bullSplitMode);

  console.log("🎯 Dart hit:", {
    player: currentPlayer.player.name,
    segment: `${segment.Section} ${segment.Type}`,
    dartValue,
    totalScore: currentPlayer.totalScore,
  });

  // Update player statistics
  if (segment.Section === SegmentSection.BULL) {
    if (segment.Type === SegmentType.Double) {
      currentPlayer.hitsDoubleBull++;
    } else {
      // Single bull (type Single) or other types count as single bull
      currentPlayer.hits25++;
    }
  }

  // Add points to total score
  currentPlayer.totalScore += dartValue;
  currentPlayer.dartsThrown++;
  newState.dartsThrown = Math.min(newState.dartsThrown + 1, 3);

  // Check for win conditions
  if (newState.targetScore > 0 && currentPlayer.totalScore >= newState.targetScore) {
    newState.gameFinished = true;
    newState.winner = currentPlayer.player;
    console.log("🏆 Winner by target score:", currentPlayer.player.name);
  }

  // Mark this hit as processed
  if (hitId) {
    newState.lastProcessedHit = hitId;
  }

  return newState;
};

export const cloneGameState = (state: TargetBullGameState): TargetBullGameState => {
  return {
    ...state,
    players: state.players.map((playerState) => ({
      ...playerState,
    })),
  };
};

export const nextPlayer = (
  gameState: TargetBullGameState
): TargetBullGameState => {
  if (!gameState.gameStarted || gameState.gameFinished) {
    return gameState;
  }

  // Deep clone the game state to ensure React detects the change
  const newState = cloneGameState(gameState);

  // Increment rounds played for current player (they just finished their turn)
  newState.players[newState.currentPlayerIndex].roundsPlayed++;

  // Reset darts thrown for next player
  newState.dartsThrown = 0;

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
      // Determine winner by highest total score
      const maxScore = Math.max(...newState.players.map((p) => p.totalScore));
      const winners = newState.players.filter((p) => p.totalScore === maxScore);
      // If tie, first player with that score wins (or could be tie, but we pick first)
      newState.winner = winners[0]?.player || null;
    }
  }

  newState.currentPlayerIndex = nextPlayerIndex;

  return newState;
};

/**
 * Calculate average points per dart (PPD) for a player
 */
export const calculatePPD = (playerState: PlayerTargetBullState): number => {
  if (playerState.dartsThrown === 0) return 0;
  return Math.round((playerState.totalScore / playerState.dartsThrown) * 100) / 100;
};

/**
 * Calculate average points per round (PPR) for a player
 */
export const calculatePPR = (playerState: PlayerTargetBullState): number => {
  if (playerState.roundsPlayed === 0) return 0;
  return Math.round((playerState.totalScore / playerState.roundsPlayed) * 100) / 100;
};

/**
 * Calculate accuracy percentage for a player (hits on valid targets / darts thrown)
 */
export const calculateAccuracy = (playerState: PlayerTargetBullState): number => {
  if (playerState.dartsThrown === 0) return 0;
  const validHits = playerState.hits25 + playerState.hitsBull + playerState.hitsDoubleBull;
  return Math.round((validHits / playerState.dartsThrown) * 10000) / 100; // percentage with 2 decimals
};