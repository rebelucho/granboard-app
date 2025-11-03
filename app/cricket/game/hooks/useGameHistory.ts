import { useState, useRef, useEffect } from "react";
import { CricketGameState, cloneGameState } from "@/services/cricket";
import { Segment } from "@/services/boardinfo";

type GameHistoryEntry = {
  gameState: CricketGameState;
  turnHits: Segment[];
};

export function useGameHistory(
  gameState: CricketGameState | null,
  currentTurnHits: Segment[]
) {
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const previousGameStateRef = useRef<CricketGameState | null>(null);
  const previousTurnHitsRef = useRef<Segment[]>([]);
  const isRestoringRef = useRef<boolean>(false);

  // Track game state changes and save to history
  useEffect(() => {
    if (!gameState) return;

    // Don't save to history if we're restoring a previous state
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      previousGameStateRef.current = cloneGameState(gameState);
      previousTurnHitsRef.current = [...currentTurnHits];
      return;
    }

    // If we have a previous state, save it to history
    if (previousGameStateRef.current) {
      // IMPORTANT: Capture the values BEFORE updating the refs to avoid React Strict Mode issues
      const stateToSave = cloneGameState(previousGameStateRef.current);
      const hitsToSave = [...previousTurnHitsRef.current];

      setGameHistory((prev) =>
        [
          ...prev,
          {
            gameState: stateToSave,
            turnHits: hitsToSave,
          },
        ].slice(-20)
      );
    }

    // Update previous state reference (will be saved next time)
    previousGameStateRef.current = cloneGameState(gameState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.dartsThrown, gameState?.currentPlayerIndex]);

  const saveCurrentTurnHits = (hits: Segment[]) => {
    previousTurnHitsRef.current = [...hits];
  };

  const undoLastAction = (): {
    gameState: CricketGameState;
    turnHits: Segment[];
  } | null => {
    if (gameHistory.length === 0) return null;

    const previousEntry = gameHistory[gameHistory.length - 1];
    setGameHistory((prev) => prev.slice(0, -1));

    // Mark that we're restoring to prevent re-saving in useEffect
    isRestoringRef.current = true;

    return previousEntry;
  };

  return {
    gameHistory,
    saveCurrentTurnHits,
    undoLastAction,
    hasHistory: gameHistory.length > 0,
  };
}
