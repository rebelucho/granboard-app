"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SEGMENT_SECTIONS, SEGMENT_TYPES } from "@/constants/segments";
import { ANIMATION_TIMINGS } from "@/constants/animations";
import {
  Player,
  ZeroOneMode,
  ZeroOneGameState,
  createInitialGameState,
  calculateDartValue,
  cloneGameState,
  LegSettings,
  LegWinCondition,
  StartingPlayerRule,
} from "@/services/zeroone";
import { Segment } from "@/services/boardinfo";
import { MatchFormat } from "@/services/match";

// Hooks
import { useGameHistory } from "../../cricket/game/hooks/useGameHistory";
import { useGranboardConnection } from "../../cricket/game/hooks/useGranboardConnection";
import { useZeroOneGameState } from "./hooks/useZeroOneGameState";
import { usePlayerTurnHistory } from "../../cricket/game/hooks/usePlayerTurnHistory";
import { useSounds } from "../../cricket/game/hooks/useSounds";
import { useSettings } from "@/app/contexts/SettingsContext";
import { useAnimations } from "@/app/hooks/useAnimations";

// Components
import { GameHeader } from "../../cricket/game/components/GameHeader";
import { GameOverBanner } from "../../cricket/game/components/GameOverBanner";
import { CurrentPlayerPanel } from "../../cricket/game/components/CurrentPlayerPanel";
import { ScoreBoard } from "./components/ScoreBoard";
import { HitAnimation } from "../../cricket/game/components/HitAnimation";
import { TurnSummary } from "../../cricket/game/components/TurnSummary";
import { PlayerTurnHistory } from "../../cricket/game/components/PlayerTurnHistory";
import { LegendDialog } from "./components/LegendDialog";

export default function ZeroOneGame() {
  const router = useRouter();
  const t = useTranslations();
  const { openDialog, closeDialog } = useSettings();

  // Animation states
  const [showTurnSummary, setShowTurnSummary] = useState(false);
  const [turnSummaryData, setTurnSummaryData] = useState<{
    player: any;
    hits: any[];
  } | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  // Sound effects
  const { playSound } = useSounds();

  // Animations
  const { playAnimation, AnimationOverlay } = useAnimations();

  // Player turn history (declare first to use in callbacks)
  const { addTurn, getPlayerHistory } = usePlayerTurnHistory();

  // Use refs to access latest values in callbacks
  const addTurnRef = useRef(addTurn);
  const gameStateRef = useRef<ZeroOneGameState | null>(null);
  const saveCurrentTurnHitsRef = useRef<((hits: Segment[]) => void) | null>(null);

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
  } = useZeroOneGameState(
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

  // Initialize game state from session storage
  useEffect(() => {
    const playersJson = sessionStorage.getItem("zeroOnePlayers");
    const modeString = sessionStorage.getItem("zeroOneMode");
    const doubleOutString = sessionStorage.getItem("zeroOneDoubleOut");
    const maxRoundsString = sessionStorage.getItem("zeroOneMaxRounds");
    const legWinCondition = sessionStorage.getItem("zeroOneLegWinCondition") as 'firstTo' | 'bestOf' || 'firstTo';
    const legCount = parseInt(sessionStorage.getItem("zeroOneLegCount") || "3");
    const startingPlayerRule = sessionStorage.getItem("zeroOneStartingPlayerRule") as 'alternate' | 'loser' || 'alternate';
    const matchFormat = sessionStorage.getItem("zeroOneMatchFormat") as 'legs' | 'sets' || 'legs';
    const setWinCondition = sessionStorage.getItem("zeroOneSetWinCondition") as 'firstTo' | 'bestOf' || 'firstTo';
    const setCount = parseInt(sessionStorage.getItem("zeroOneSetCount") || "3");
    const legsPerSet = parseInt(sessionStorage.getItem("zeroOneLegsPerSet") || "3");
    const startingSetPlayerRule = sessionStorage.getItem("zeroOneStartingSetPlayerRule") as 'alternate' | 'loser' || 'alternate';

    if (!playersJson) {
      router.push("/01");
      return;
    }

    const players: Player[] = JSON.parse(playersJson);
    const mode = parseInt(modeString || "501") as ZeroOneMode;
    const doubleOut = doubleOutString === "true";
    const maxRounds = parseInt(maxRoundsString || "0");

    // Build leg settings
    const format = matchFormat === 'legs' ? MatchFormat.Legs : MatchFormat.Sets;
    const legWinConditionEnum = legWinCondition === 'firstTo' ? LegWinCondition.FirstTo : LegWinCondition.BestOf;
    const startingPlayerRuleEnum = startingPlayerRule === 'alternate' ? StartingPlayerRule.Alternate : StartingPlayerRule.Loser;
    const setWinConditionEnum = setWinCondition === 'firstTo' ? LegWinCondition.FirstTo : LegWinCondition.BestOf;
    const startingSetPlayerRuleEnum = startingSetPlayerRule === 'alternate' ? StartingPlayerRule.Alternate : StartingPlayerRule.Loser;

    const legSettings: LegSettings = {
      format,
      legWinCondition: legWinConditionEnum,
      legCount,
      startingPlayerRule: startingPlayerRuleEnum,
      enabled: true,
    };

    if (format === MatchFormat.Sets) {
      legSettings.sets = {
        bestOf: setCount,
        legsToWinSet: legsPerSet,
      };
    }

    setGameState(createInitialGameState(players, mode, doubleOut, maxRounds, legSettings));
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

    // Store previous state to check for bust
    const previousState = gameState ? { ...gameState } : null;
    const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;
    const previousScore = previousState?.players[currentPlayerIndex].currentScore ?? 0;

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

    // Check after state update for special events (bust, checkout)
    setTimeout(() => {
      if (!previousState || !gameState) return;

      const currentPlayer = gameState.players[currentPlayerIndex];
      const newScore = currentPlayer.currentScore;

      // Check for bust (score went back to previous)
      if (newScore === previousScore && gameState.dartsThrown === 3) {
        playSound("game-over");
      }

      // Check for victory (score reached 0)
      if (newScore === 0) {
        playSound("victory");
      }
    }, 100);
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

        // Priority 1: Victory (handled elsewhere when score reaches 0)
        // Priority 2: Three misses (Goat)
        if (hits.every((hit) => hit.Section === SEGMENT_SECTIONS.MISS)) {
          playSound("goat");
          playAnimation("three-miss");
        }
        // Priority 3: Three triples (Unicorn)
        else if (hits.every((hit) => hit.Type === SEGMENT_TYPES.TRIPLE)) {
          playSound("horse");
          playAnimation("three-triple");
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

  // Actions
  const handleUndo = () => {
    const previousEntry = undoLastAction();
    if (previousEntry) {
      restoreGameState(previousEntry.gameState, previousEntry.turnHits);
    }
  };

  const handleNewGame = () => {
    router.push("/01");
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
          {t('zeroOne.game.newGame')}
        </button>
        <button
          data-testid="quit-button"
          onClick={() => {
            closeDialog();
            handleQuit();
          }}
          className="w-full px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-500 font-bold text-lg transition-all shadow-lg hover:scale-105"
        >
          {t('zeroOne.game.quit')}
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

      {/* Legend Dialog */}
      <LegendDialog
        show={showLegend}
        doubleOut={gameState.doubleOut}
        onClose={() => setShowLegend(false)}
      />
    </main>
  );
}
