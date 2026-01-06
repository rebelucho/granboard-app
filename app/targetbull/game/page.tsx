"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SEGMENT_SECTIONS, SEGMENT_TYPES } from "@/constants/segments";
import { ANIMATION_TIMINGS } from "@/constants/animations";
import {
  Player,
  BullSplitMode,
  TargetBullGameState,
  PlayerTargetBullState,
  createInitialGameState,
  cloneGameState,
} from "@/services/targetbull";
import { Segment } from "@/services/boardinfo";

// Hooks
import { useGameHistory } from "../../cricket/game/hooks/useGameHistory";
import { useGranboardConnection } from "../../cricket/game/hooks/useGranboardConnection";
import { useTargetBullGameState } from "./hooks/useTargetBullGameState";
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

export default function TargetBullGame() {
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
  const { addTurn, getPlayerHistory, turnHistory } = usePlayerTurnHistory();

  // Use refs to access latest values in callbacks
  const addTurnRef = useRef(addTurn);
  const gameStateRef = useRef<TargetBullGameState | null>(null);
  const saveCurrentTurnHitsRef = useRef<((hits: Segment[]) => void) | null>(null);
  const turnStartStateRef = useRef<TargetBullGameState | null>(null);

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
  } = useTargetBullGameState(
    null,
    (hits: Segment[]) => {
      if (saveCurrentTurnHitsRef.current) {
        saveCurrentTurnHitsRef.current(hits);
      }
    },
    (playerState: PlayerTargetBullState, hits: Segment[], isGameFinished: boolean) => {
      // Add turn to player history
      if (gameStateRef.current) {
        console.log('Adding turn:', playerState.player.name, playerState.player.id, gameStateRef.current.currentRound, hits);
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

  // Debug: log history when game finishes
  useEffect(() => {
    if (gameState?.gameFinished) {
      console.log('Game finished, turnHistory:', turnHistory);
      gameState.players.forEach((playerState: PlayerTargetBullState) => {
        console.log(`History for ${playerState.player.name}:`, getPlayerHistory(playerState.player.id));
      });
    }
  }, [gameState, turnHistory, getPlayerHistory]);

  // Update refs when gameState changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Modify hit display for invalid targets (non‑bull sections)
  const displayHit = useMemo(() => {
    if (!lastHit) return null;
    // Valid target is bull section only
    if (lastHit.Section !== SEGMENT_SECTIONS.BULL) {
      return {
        ...lastHit,
        ShortName: t('common.miss'),
      };
    }
    return lastHit;
  }, [lastHit, t]);

  // Save game state at the start of each turn (first dart)
  useEffect(() => {
    if (gameState && gameState.dartsThrown === 1) {
      turnStartStateRef.current = cloneGameState(gameState);
    }
  }, [gameState]);

  // Initialize game state from session storage
  useEffect(() => {
    const playersJson = sessionStorage.getItem("targetBullPlayers");
    const bullSplitModeString = sessionStorage.getItem("targetBullBullSplitMode");
    const maxRoundsString = sessionStorage.getItem("targetBullMaxRounds");
    const targetScoreString = sessionStorage.getItem("targetBullTargetScore");

    if (!playersJson) {
      router.push("/targetbull");
      return;
    }

    const players: Player[] = JSON.parse(playersJson);
    const bullSplitMode = (bullSplitModeString as BullSplitMode) || BullSplitMode.Split;
    const maxRounds = parseInt(maxRoundsString || "10");
    const targetScore = parseInt(targetScoreString || "0");
    setGameState(createInitialGameState(players, bullSplitMode, maxRounds, targetScore));
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

    // Store previous state with deep clone to check for scoring
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

    // Check if hit is on a valid target (25 or 50) for celebration
    setTimeout(() => {
      if (!previousState) return;

      const hitNumber = segment.Section as number;
      if (hitNumber === 25 || hitNumber === 50) {
        // Play whistle for successful target hit
        if (segment.Type === SEGMENT_TYPES.TRIPLE) {
          // Triple not possible for bull, but keep for consistency
          playSound("whistle-triple");
        } else if (segment.Type === SEGMENT_TYPES.DOUBLE) {
          playSound("whistle-double");
        } else {
          playSound("whistle-single");
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
        if (hits.every((hit: Segment) => hit.Section === SEGMENT_SECTIONS.MISS)) {
          playSound("goat");
          playAnimation("three-miss");
        }
        // Priority 3: Three valid target hits (bull section) - needs turnStartState
        else if (turnStartState && hits.every((hit: Segment) => hit.Section === SEGMENT_SECTIONS.BULL)) {
          // Check if all 3 hits are on valid targets (bull section)
          const allValidHits = hits.every((hit: Segment) => hit.Section === SEGMENT_SECTIONS.BULL);
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

  // Actions
  const handleUndo = () => {
    const previousEntry = undoLastAction();
    if (previousEntry) {
      restoreGameState(previousEntry.gameState, previousEntry.turnHits);
    }
  };

  const handleNewGame = () => {
    router.push("/targetbull");
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
          {t('targetBull.game.newGame')}
        </button>
        <button
          data-testid="quit-button"
          onClick={() => {
            closeDialog();
            handleQuit();
          }}
          className="w-full px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-500 font-bold text-lg transition-all shadow-lg hover:scale-105"
        >
          {t('targetBull.game.quit')}
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
    <main className="h-screen bg-theme-primary flex flex-col px-4 py-3 gap-3 overflow-y-auto">
      {/* Animations overlay */}
      <AnimationOverlay />

      <GameHeader
        gameMode={`Target Bull (${gameState.bullSplitMode === BullSplitMode.Split ? t('targetBull.bullSplitMode.split.title') : t('targetBull.bullSplitMode.unified.title')})`}
        connectionState={connectionState}
        onConnect={connectToBoard}
        onShowLegend={() => setShowLegend(true)}
        onShowSettings={handleShowSettings}
      />

      {gameState.gameFinished && gameState.winner && (
        <>
          <div className="bg-yellow-600 text-white p-8 rounded-2xl shadow-2xl border-2 border-yellow-400">
            <h2 className="text-5xl font-bold mb-2 text-center">
              🎉 {t('cricket.game.wonGame', { name: gameState.winner.name })} 🎉
            </h2>
            <p className="text-xl text-center mb-6 text-yellow-100">
              {t('cricket.game.gameEndedAfter', {
                rounds: gameState.currentRound - 1,
                roundsLabel: (gameState.currentRound - 1) > 1 ? t('cricket.game.rounds') : t('cricket.game.round').toLowerCase()
              })}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleNewGame}
                className="px-8 py-3 bg-white text-yellow-700 rounded-xl hover:bg-theme-secondary font-bold text-lg transition-all shadow-lg hover:scale-105"
              >
                {t('targetBull.game.newGame')}
              </button>
              <button
                onClick={handleQuit}
                className="px-8 py-3 bg-theme-secondary text-theme-primary rounded-xl hover:bg-theme-tertiary font-bold text-lg transition-all shadow-lg hover:scale-105"
              >
                {t('targetBull.game.quit')}
              </button>
            </div>
          </div>
          {/* ScoreBoard for finished game */}
          <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-xl border border-gray-700 mb-6">
            <ScoreBoard
              players={gameState.players}
              currentPlayerIndex={gameState.currentPlayerIndex}
              gameFinished={gameState.gameFinished}
              bullSplitMode={gameState.bullSplitMode}
            />
          </div>

          {/* Game history table */}
          <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-xl border border-gray-700">
            <h3 className="text-2xl font-bold mb-4 text-center">
              {t('targetBull.game.roundHistory')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="py-2 px-3 text-left">{t('targetBull.game.round')}</th>
                    {gameState.players.map((playerState: PlayerTargetBullState) => (
                      <th key={playerState.player.id} colSpan={3} className="py-2 px-3 text-center border-l border-gray-600">
                        {playerState.player.name}
                      </th>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-600">
                    <th></th>
                    {gameState.players.flatMap((playerState: PlayerTargetBullState) => [
                      <th key={`${playerState.player.id}-dart1`} className="py-1 px-2 text-center">{t('targetBull.game.dart1')}</th>,
                      <th key={`${playerState.player.id}-dart2`} className="py-1 px-2 text-center">{t('targetBull.game.dart2')}</th>,
                      <th key={`${playerState.player.id}-dart3`} className="py-1 px-2 text-center">{t('targetBull.game.dart3')}</th>,
                    ])}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: gameState.currentRound - 1 }, (_, i) => i + 1).map((round) => (
                    <tr key={round} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-2 px-3 font-bold text-center">{round}</td>
                      {gameState.players.flatMap((playerState: PlayerTargetBullState) => {
                        const turn = getPlayerHistory(playerState.player.id).find(t => t.round === round);
                        const hits = turn?.hits || [];
                        return [
                          <td key={`${playerState.player.id}-${round}-1`} className="py-1 px-2 text-center border-l border-gray-600">
                            {hits[0] ? (hits[0].ShortName || hits[0].Section) : '-'}
                          </td>,
                          <td key={`${playerState.player.id}-${round}-2`} className="py-1 px-2 text-center">
                            {hits[1] ? (hits[1].ShortName || hits[1].Section) : '-'}
                          </td>,
                          <td key={`${playerState.player.id}-${round}-3`} className="py-1 px-2 text-center">
                            {hits[2] ? (hits[2].ShortName || hits[2].Section) : '-'}
                          </td>,
                        ];
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
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

      {!gameState.gameFinished && (
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
              bullSplitMode={gameState.bullSplitMode}
            />
          </div>
        </div>
      )}

      {/* Animations */}
      <HitAnimation hit={displayHit} />

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
        bullSplitMode={gameState.bullSplitMode}
        onClose={() => setShowLegend(false)}
      />
    </main>
  );
}