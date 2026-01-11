import { useState, useRef, useCallback } from "react";
import { Segment, SegmentID } from "@/services/boardinfo";
import {
  TargetBullGameState,
  processDartHit,
  nextPlayer,
} from "@/services/targetbull";

export function useTargetBullGameState(
  initialGameState: TargetBullGameState | null,
  onTurnHitsUpdate: (hits: Segment[]) => void,
  onTurnComplete?: (player: any, hits: Segment[], isGameFinished: boolean) => void
) {
  const [gameState, setGameState] = useState<TargetBullGameState | null>(
    initialGameState
  );
  const [lastHit, setLastHit] = useState<Segment | null>(null);
  const [currentTurnHits, setCurrentTurnHits] = useState<Segment[]>([]);
  const [animationKey, setAnimationKey] = useState<number>(0);

  const lastPlayerChangeRef = useRef<number>(0);
  const lastDartHitRef = useRef<number>(0);

  const handleResetButton = useCallback(() => {
    // Debounce: prevent multiple rapid presses (within 500ms)
    const now = Date.now();
    if (now - lastPlayerChangeRef.current < 500) {
      return;
    }
    lastPlayerChangeRef.current = now;

    setLastHit(null);

    // Capture current state and hits before changing
    setGameState((currentState) => {
      if (!currentState) return currentState;

      const currentPlayer = currentState.players[currentState.currentPlayerIndex];

      // Calculate next state to check if game will be finished
      const newState = nextPlayer(currentState);

      // Save current turn hits to ref BEFORE clearing
      setCurrentTurnHits((current) => {
        onTurnHitsUpdate(current);

        // Trigger turn complete callback with player, hits, and game finished status
        if (onTurnComplete && current.length > 0) {
          onTurnComplete(currentPlayer, current, newState.gameFinished);
        }

        return [];
      });

      return newState;
    });
  }, [onTurnHitsUpdate, onTurnComplete]);

  const handleDartHit = useCallback(
    (segment: Segment) => {
      // Debounce to prevent double detection
      const now = Date.now();
      if (now - lastDartHitRef.current < 1000) {
        return;
      }
      lastDartHitRef.current = now;

      const hitId = `${now}-${segment.ID}`;

      console.log("🎯 Dart hit:", {
        shortName: segment.ShortName,
        type: segment.Type,
        section: segment.Section,
        segmentID: segment.ID,
        hitId,
      });

      let processedResult: TargetBullGameState | null = null;

      setGameState((currentState) => {
        if (!currentState) return currentState;

        // React Strict Mode calls this callback twice - return cached result on second call
        if (processedResult) {
          console.log(
            "⚠️ React Strict Mode second call - returning cached result"
          );
          return processedResult;
        }

        // Check if we can still accept darts (max 3)
        if (currentState.dartsThrown >= 3) {
          console.log("⚠️ Already thrown 3 darts, ignoring");
          return currentState;
        }

        // Update UI only if dart will be processed
        setLastHit(segment);
        setCurrentTurnHits((prev) => {
          // Save current hits to ref before adding new one
          onTurnHitsUpdate(prev);
          return [...prev, segment];
        });
        setAnimationKey((prev) => prev + 1);

        // First call - process and cache the result
        processedResult = processDartHit(currentState, segment, hitId);
        return processedResult;
      });
    },
    [onTurnHitsUpdate]
  );

  const onSegmentHit = useCallback(
    (segment: Segment) => {
      if (segment.ID === SegmentID.RESET_BUTTON) {
        handleResetButton();
      } else {
        handleDartHit(segment);
      }
    },
    [handleResetButton, handleDartHit]
  );

  const restoreGameState = useCallback(
    (state: TargetBullGameState, turnHits: Segment[]) => {
      setGameState(state);
      setCurrentTurnHits(turnHits);
      setLastHit(null);
    },
    []
  );

  return {
    gameState,
    setGameState,
    lastHit,
    currentTurnHits,
    setCurrentTurnHits,
    animationKey,
    onSegmentHit,
    handleResetButton,
    restoreGameState,
  };
}