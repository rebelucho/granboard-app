"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SEGMENT_SECTIONS, SEGMENT_TYPES, CRICKET_NUMBERS } from "@/constants/segments";
import { ANIMATION_TIMINGS } from "@/constants/animations";
import {
  Player,
  CricketGameMode,
  CricketGameState,
  createInitialGameState,
  cloneGameState,
} from "@/services/cricket";
import { Segment } from "@/services/boardinfo";

// Hooks
import { useGameHistory } from "./hooks/useGameHistory";
import { useGranboardConnection } from "./hooks/useGranboardConnection";
import { useCricketGameState } from "./hooks/useCricketGameState";
import { usePlayerTurnHistory } from "./hooks/usePlayerTurnHistory";
import { useSounds } from "./hooks/useSounds";
import { useSettings } from "@/app/contexts/SettingsContext";
import { useAnimations } from "@/app/hooks/useAnimations";

// Components
import { GameHeader } from "./components/GameHeader";
import { GameOverBanner } from "./components/GameOverBanner";
import { CurrentPlayerPanel } from "./components/CurrentPlayerPanel";
import { ScoreBoard } from "./components/ScoreBoard";
import { HitAnimation } from "./components/HitAnimation";
import { TurnSummary } from "./components/TurnSummary";
import { PlayerTurnHistory } from "./components/PlayerTurnHistory";
import { LegendDialog } from "./components/LegendDialog";

export default function CricketGame() {
  const router = useRouter();
  const t = useTranslations();
  const { openDialog, closeDialog } = useSettings();

  // Animation states
  const [showTurnSummary, setShowTurnSummary] = useState(false);
  const [turnSummaryData, setTurnSummaryData] = useState<{
    player: any;
    hits: any[];
  } | null>(null);

  // Dialog states
  const [showLegend, setShowLegend] = useState(false);

  // Sound effects
  const { playSound } = useSounds();

  // Animations
  const { playAnimation, AnimationOverlay } = useAnimations();

  // Player turn history (declare first to use in callbacks)
  const { addTurn, getPlayerHistory } = usePlayerTurnHistory();

  // Use refs to access latest values in callbacks
  const addTurnRef = useRef(addTurn);
  const gameStateRef = useRef<CricketGameState | null>(null);
  const saveCurrentTurnHitsRef = useRef<((hits: Segment[]) => void) | null>(null);
  const turnStartStateRef = useRef<CricketGameState | null>(null);

  useEffect(() => {
    addTurnRef.current = addTurn;
  }, [addTurn]);

  // Game state management
  const {
    gameState,
    setGameState,
    currentTurnHits,
    lastHit,
    onSegmentHit,
    handleResetButton,
    restoreGameState,
  } = useCricketGameState(
    null,
    (hits) => {
      if (saveCurrentTurnHitsRef.current) {
        saveCurrentTurnHitsRef.current(hits);
      }
    },
    (playerState, hits, isGameFinished) => {
      // Add turn to player history
      if (gameStateRef.current) {
        addTurnRef.current(playerState.player, gameStateRef.current.currentRound, hits);
      }

      // Play sound when game is finished
      if (isGameFinished) {
        playSound("game-over");
      }

      // Show turn summary when player finishes turn (except if game is finished)
      if (!isGameFinished) {
        setTurnSummaryData({ player: playerState, hits });
        setShowTurnSummary(true);
      }
    }
  );

  // Update refs when gameState changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Save game state at the start of each turn (first dart)
  useEffect(() => {
    if (gameState && gameState.dartsThrown === 1) {
      turnStartStateRef.current = cloneGameState(gameState);
    }
  }, [gameState]);

  // Initialize game state from session storage
  useEffect(() => {
    const playersJson = sessionStorage.getItem("cricketPlayers");
    const gameModeString = sessionStorage.getItem("cricketGameMode");
    const maxRoundsString = sessionStorage.getItem("cricketMaxRounds");

    if (!playersJson) {
      router.push("/cricket");
      return;
    }

    const players: Player[] = JSON.parse(playersJson);
    const mode =
      (gameModeString as CricketGameMode) || CricketGameMode.Standard;
    const maxRounds = parseInt(maxRoundsString || "20");
    setGameState(createInitialGameState(players, mode, maxRounds));
  }, [router, setGameState]);

  // Game history management
  const { hasHistory, saveCurrentTurnHits, undoLastAction } = useGameHistory(
    gameState,
    currentTurnHits,
    cloneGameState
  );

  // Update saveCurrentTurnHits ref
  useEffect(() => {
    saveCurrentTurnHitsRef.current = saveCurrentTurnHits;
  }, [saveCurrentTurnHits]);

  // Wrapper for segment hit with sound effects
  const handleSegmentHitWithSound = (segment: any) => {
    // Guard against undefined/null segment - treat as MISS
    if (!segment) {
      console.warn('Segment is undefined or null in handleSegmentHitWithSound, treating as MISS');
      // Create a MISS segment
      segment = {
        ID: 84, // SegmentID.MISS
        Type: 4, // SegmentType.Other
        Section: 0, // SegmentSection.Other
        Value: 0,
        LongName: 'Miss',
        ShortName: 'Miss',
      };
    }

    // Store previous state with deep clone to check for number closure
    const previousState = gameState ? cloneGameState(gameState) : null;
    const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;

    // Play sound based on segment type
    if (segment.Section === SEGMENT_SECTIONS.MISS) {
      // Miss
      playSound("dart-miss");
    } else if (segment.Section === SEGMENT_SECTIONS.BULL && segment.Type === SEGMENT_TYPES.DOUBLE) {
      // Double Bull
      playSound("double-bull");
    } else if (segment.Section === SEGMENT_SECTIONS.BULL) {
      // Bull
      playSound("bull");
    }

    // Process the hit
    onSegmentHit(segment);

    // Check if hit is on a number that still counts in the game (whistle sounds)
    setTimeout(() => {
      if (!previousState) return;

      const hitNumber = segment.Section;

      if (CRICKET_NUMBERS.includes(hitNumber as any)) {
        // Check if this number was still in play BEFORE the hit (not everyone had closed it)
        const allPlayersClosed = previousState.players.every(p => (p.scores.get(hitNumber)?.marks ?? 0) >= 3);

        // Play whistle if the number still counted in the game
        if (!allPlayersClosed) {
          if (segment.Type === SEGMENT_TYPES.TRIPLE) {
            playSound("whistle-triple");
          } else if (segment.Type === SEGMENT_TYPES.DOUBLE) {
            playSound("whistle-double");
          } else {
            playSound("whistle-single");
          }
        }
      }
    }, ANIMATION_TIMINGS.STATE_CHECK_DELAY);
  };

  // Granboard connection management
  const { connectionState, connectToBoard } =
    useGranboardConnection(handleSegmentHitWithSound);

  // Trigger animations after 3rd dart (with delay after hit animation)
  useEffect(() => {
    if (gameState && gameState.dartsThrown === 3 && currentTurnHits.length === 3) {
      // Wait for hit animation to finish
      const timer = setTimeout(() => {
        // Animation priority system (only one animation at a time)
        const hits = currentTurnHits;
        const turnStartState = turnStartStateRef.current;

        // Priority 1: Victory (handled elsewhere via isGameFinished)

        // Priority 2: Three misses (Goat) - doesn't need turnStartState check
        if (hits.every((hit) => hit.Section === SEGMENT_SECTIONS.MISS)) {
          playSound("goat");
          playAnimation("three-miss");
        }
        // Priority 3: Three triples that count (Unicorn) - needs turnStartState
        else if (turnStartState && hits.every((hit) => hit.Type === SEGMENT_TYPES.TRIPLE)) {
          // Check if all 3 triples are on valid Cricket numbers that counted at turn start
          const allTriplesCount = hits.every((hit) => {
            const section = hit.Section as number;
            if (!CRICKET_NUMBERS.includes(section as any)) return false;

            // Check if number was still in play at the START of the turn
            const allPlayersClosed = turnStartState.players.every(
              (p) => (p.scores.get(section as any)?.marks ?? 0) >= 3
            );
            return !allPlayersClosed;
          });

          if (allTriplesCount) {
            playSound("horse");
            playAnimation("three-triple");
          }
        }
        // Priority 4: Hit sequence (3 valid Cricket hits that counted at turn start) - needs turnStartState
        else if (turnStartState) {
          const allValidHits = hits.every((hit) => {
            if (hit.Section === SEGMENT_SECTIONS.MISS) return false; // Exclude miss
            const section = hit.Section as number;
            if (!CRICKET_NUMBERS.includes(section as any)) return false;

            // Check if number was still in play at the START of the turn
            const allPlayersClosed = turnStartState.players.every(
              (p) => (p.scores.get(section as any)?.marks ?? 0) >= 3
            );
            return !allPlayersClosed;
          });

          if (allValidHits) {
            playAnimation("hit-sequence", hits, ANIMATION_TIMINGS.HIT_SEQUENCE_DURATION);
          }
        }
      }, ANIMATION_TIMINGS.HIT_ANIMATION_DELAY);

      return () => clearTimeout(timer);
    }
  }, [gameState, currentTurnHits, playAnimation, playSound]);

  // Close turn summary when next player throws a dart
  useEffect(() => {
    if (lastHit && showTurnSummary) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setShowTurnSummary(false);
      setTurnSummaryData(null);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [lastHit, showTurnSummary]);

  // LED control disabled for Granboard 3s - protocol not yet implemented
  // TODO: Implement correct LED protocol for Granboard 3s

  // Actions
  const handleUndo = () => {
    const previousEntry = undoLastAction();
    if (previousEntry) {
      restoreGameState(previousEntry.gameState, previousEntry.turnHits);
    }
  };

  const handleNewGame = () => {
    router.push("/cricket");
  };

  const handleQuit = () => {
    router.push("/");
  };

  const handleShowSettings = () => {
    const customContent = (
      <div className="space-y-3">
        <button
          data-testid="new-game-button"
          onClick={() => {
            closeDialog();
            handleNewGame();
          }}
          className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-500 font-bold text-lg transition-all shadow-xl focus:outline-none"
        >
          {t('cricket.game.newGame')}
        </button>
        <button
          data-testid="quit-button"
          onClick={() => {
            closeDialog();
            handleQuit();
          }}
          className="w-full px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-500 font-bold text-lg transition-all shadow-lg hover:scale-105"
        >
          {t('cricket.game.quit')}
        </button>
      </div>
    );

    openDialog(customContent);
  };

  // Loading state
  if (!gameState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-theme-primary">
        <div className="text-2xl text-theme-primary">Chargement...</div>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <main className="h-screen bg-theme-primary flex flex-col px-4 py-3 gap-3 overflow-hidden">
      {/* Animations overlay */}
      <AnimationOverlay />

      <GameHeader
        gameMode={gameState.mode}
        connectionState={connectionState}
        onConnect={connectToBoard}
        onShowLegend={() => setShowLegend(true)}
        onShowSettings={handleShowSettings}
      />

      {gameState.gameFinished && gameState.winner && (
        <GameOverBanner
          winner={gameState.winner}
          players={gameState.players}
          totalRounds={gameState.currentRound - 1}
          gameMode={gameState.mode}
          onNewGame={handleNewGame}
          onQuit={handleQuit}
        />
      )}

      {!gameState.gameFinished && (
        <CurrentPlayerPanel
          currentPlayer={currentPlayer}
          dartsThrown={gameState.dartsThrown}
          currentRound={gameState.currentRound}
          maxRounds={gameState.maxRounds}
          currentTurnHits={currentTurnHits}
          hasHistory={hasHistory}
          onUndo={handleUndo}
          onNextPlayer={handleResetButton}
        />
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        <div className="lg:col-span-1 min-h-0 flex flex-col">
          <PlayerTurnHistory
            player={currentPlayer.player}
            turns={getPlayerHistory(currentPlayer.player.id)}
            currentTurnHits={currentTurnHits}
            currentRound={gameState.currentRound}
          />
        </div>
        <div className="lg:col-span-2 min-h-0 flex flex-col">
          <ScoreBoard
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            gameMode={gameState.mode}
            gameFinished={gameState.gameFinished}
          />
        </div>
      </div>

      {/* Animations */}
      <HitAnimation hit={lastHit} />

      {showTurnSummary && turnSummaryData && (
        <TurnSummary
          show={showTurnSummary}
          currentPlayer={turnSummaryData.player}
          hits={turnSummaryData.hits}
          onComplete={() => {
            setShowTurnSummary(false);
            setTurnSummaryData(null);
          }}
        />
      )}

      {/* Dialogs */}
      <LegendDialog
        show={showLegend}
        gameMode={gameState.mode}
        onClose={() => setShowLegend(false)}
      />
    </main>
  );
}
