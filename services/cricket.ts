import { Segment, SegmentSection, SegmentType } from "./boardinfo";

// Cricket target numbers: 15, 16, 17, 18, 19, 20, and Bull
export type CricketNumber = 15 | 16 | 17 | 18 | 19 | 20 | 25;

export const CRICKET_NUMBERS: CricketNumber[] = [15, 16, 17, 18, 19, 20, 25];

export enum CricketGameMode {
  Standard = "standard",
  CutThroat = "cutthroat",
}

export interface Player {
  id: string;
  name: string;
}

export interface CricketScore {
  marks: number; // 0-3 marks (closed at 3)
  points: number; // Points scored after closing
}

export interface PlayerCricketState {
  player: Player;
  scores: Map<CricketNumber, CricketScore>;
  totalPoints: number;
  totalMarks: number; // Total marks scored throughout the game
  roundsPlayed: number; // Number of rounds this player has completed
}

// Alias for easier imports
export type PlayerState = PlayerCricketState;

export interface CricketGameState {
  players: PlayerCricketState[];
  currentPlayerIndex: number;
  dartsThrown: number; // 0-2 (3 darts per turn)
  currentRound: number; // Current round number (starts at 1)
  maxRounds: number; // Maximum number of rounds (0 = unlimited)
  gameStarted: boolean;
  gameFinished: boolean;
  winner: Player | null;
  mode: CricketGameMode;
  lastProcessedHit?: string; // To prevent double processing in React Strict Mode
}

export const createInitialPlayerState = (player: Player): PlayerCricketState => {
  const scores = new Map<CricketNumber, CricketScore>();
  CRICKET_NUMBERS.forEach((num) => {
    scores.set(num, { marks: 0, points: 0 });
  });
  return {
    player,
    scores,
    totalPoints: 0,
    totalMarks: 0,
    roundsPlayed: 0,
  };
};

export const createInitialGameState = (
  players: Player[],
  mode: CricketGameMode = CricketGameMode.Standard,
  maxRounds: number = 20
): CricketGameState => {
  return {
    players: players.map(createInitialPlayerState),
    currentPlayerIndex: 0,
    dartsThrown: 0,
    currentRound: 1,
    maxRounds,
    gameStarted: true,
    gameFinished: false,
    winner: null,
    mode,
  };
};

export const processDartHit = (
  gameState: CricketGameState,
  segment: Segment,
  hitId?: string
): CricketGameState => {
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

  // Check if the segment is a cricket number
  const section = segment.Section as number;
  if (!CRICKET_NUMBERS.includes(section as CricketNumber)) {
    // Not a cricket number, just advance the dart count (max 3)
    newState.dartsThrown = Math.min(newState.dartsThrown + 1, 3);
    return newState;
  }

  const cricketNumber = section as CricketNumber;
  const currentScore = currentPlayer.scores.get(cricketNumber)!;

  // Calculate marks based on segment type
  let marksToAdd = 0;
  switch (segment.Type) {
    case SegmentType.Single:
      marksToAdd = 1;
      break;
    case SegmentType.Double:
      marksToAdd = 2;
      break;
    case SegmentType.Triple:
      marksToAdd = 3;
      break;
  }

  const newMarks = Math.min(currentScore.marks + marksToAdd, 3);
  const overflowMarks = currentScore.marks + marksToAdd - newMarks;

  // Track total marks for MPR calculation (only count marks that actually count, max 3 per number)
  const actualMarksAdded = newMarks - currentScore.marks;
  currentPlayer.totalMarks += actualMarksAdded;

  console.log("📊 Score calculation:", {
    number: cricketNumber,
    segmentType: segment.Type,
    marksToAdd,
    previousMarks: currentScore.marks,
    newMarks,
    overflowMarks,
    actualMarksAdded
  });

  // Calculate overflow marks for scoring
  let scoringMarks = 0;
  if (currentScore.marks >= 3 && overflowMarks > 0) {
    scoringMarks = overflowMarks;
  } else if (newMarks >= 3 && currentScore.marks < 3) {
    scoringMarks = currentScore.marks + marksToAdd - 3;
  }

  // Apply scoring based on game mode
  if (scoringMarks > 0) {
    const pointsToDistribute = scoringMarks * cricketNumber;

    if (newState.mode === CricketGameMode.CutThroat) {
      // Cut Throat: Give points to ALL opponents who haven't closed this number
      newState.players.forEach((p, idx) => {
        if (idx !== newState.currentPlayerIndex && p.scores.get(cricketNumber)!.marks < 3) {
          const opponentScore = p.scores.get(cricketNumber)!;
          p.scores.set(cricketNumber, {
            marks: opponentScore.marks,
            points: opponentScore.points + pointsToDistribute,
          });
          p.totalPoints += pointsToDistribute;
        }
      });
    } else {
      // Standard: Give points to yourself if any opponent hasn't closed
      const anyOpponentOpen = newState.players.some(
        (p, idx) =>
          idx !== newState.currentPlayerIndex &&
          p.scores.get(cricketNumber)!.marks < 3
      );

      if (anyOpponentOpen) {
        currentPlayer.scores.set(cricketNumber, {
          marks: newMarks,
          points: currentScore.points + pointsToDistribute,
        });
        currentPlayer.totalPoints += pointsToDistribute;
      }
    }
  }

  // Update marks (always update marks regardless of points)
  const updatedScore = currentPlayer.scores.get(cricketNumber)!;
  currentPlayer.scores.set(cricketNumber, {
    marks: newMarks,
    points: updatedScore.points,
  });

  console.log("✅ Final update:", {
    player: currentPlayer.player.name,
    number: cricketNumber,
    finalMarks: newMarks,
    finalPoints: updatedScore.points
  });

  // Check for win condition
  if (checkWinCondition(currentPlayer, newState.players, newState.mode)) {
    newState.gameFinished = true;
    newState.winner = currentPlayer.player;
  }

  // Increment darts thrown (max 3)
  newState.dartsThrown = Math.min(newState.dartsThrown + 1, 3);

  // Mark this hit as processed
  if (hitId) {
    newState.lastProcessedHit = hitId;
  }

  return newState;
};

export const cloneGameState = (state: CricketGameState): CricketGameState => {
  return {
    ...state,
    players: state.players.map((playerState) => ({
      ...playerState,
      scores: new Map(
        Array.from(playerState.scores.entries()).map(([num, score]) => [
          num,
          { ...score },
        ])
      ),
    })),
  };
};

export const nextPlayer = (
  gameState: CricketGameState
): CricketGameState => {
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
      // Determine winner by score
      if (newState.mode === CricketGameMode.CutThroat) {
        // Cut Throat: lowest score wins
        const minScore = Math.min(...newState.players.map((p) => p.totalPoints));
        const winner = newState.players.find((p) => p.totalPoints === minScore);
        newState.winner = winner?.player || null;
      } else {
        // Standard: highest score wins
        const maxScore = Math.max(...newState.players.map((p) => p.totalPoints));
        const winner = newState.players.find((p) => p.totalPoints === maxScore);
        newState.winner = winner?.player || null;
      }
    }
  }

  newState.currentPlayerIndex = nextPlayerIndex;

  return newState;
};

const checkWinCondition = (
  player: PlayerCricketState,
  allPlayers: PlayerCricketState[],
  mode: CricketGameMode
): boolean => {
  // Check if player has closed all numbers
  const allClosed = CRICKET_NUMBERS.every(
    (num) => player.scores.get(num)!.marks >= 3
  );

  if (!allClosed) return false;

  // Player has closed all numbers
  if (mode === CricketGameMode.CutThroat) {
    // Cut Throat: Win with LOWEST score
    const minScore = Math.min(...allPlayers.map((p) => p.totalPoints));
    return player.totalPoints <= minScore;
  } else {
    // Standard: Win with HIGHEST score
    const maxScore = Math.max(...allPlayers.map((p) => p.totalPoints));
    return player.totalPoints >= maxScore;
  }
};

export const getPlayerScore = (
  playerState: PlayerCricketState,
  number: CricketNumber
): CricketScore => {
  return playerState.scores.get(number)!;
};

/**
 * Calculate Marks Per Round (MPR) for a player
 * MPR = Total Marks / Rounds Played
 * @param playerState The player's state
 * @returns The MPR rounded to 2 decimal places
 */
export const calculateMPR = (playerState: PlayerCricketState): number => {
  if (playerState.roundsPlayed === 0) return 0;
  return Math.round((playerState.totalMarks / playerState.roundsPlayed) * 100) / 100;
};

/**
 * Get unclosed cricket numbers for a player
 * @param playerState The player's state
 * @returns Array of cricket numbers that are not yet closed (< 3 marks)
 */
export const getUnclosedNumbers = (playerState: PlayerCricketState): number[] => {
  const unclosed: number[] = [];

  CRICKET_NUMBERS.forEach((num) => {
    const score = playerState.scores.get(num)!;
    if (score.marks < 3) {
      unclosed.push(num);
    }
  });

  return unclosed;
};
