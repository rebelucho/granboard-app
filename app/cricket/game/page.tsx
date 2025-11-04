"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Player,
  CricketGameMode,
  createInitialGameState,
} from "@/services/cricket";

// Hooks
import { useGameHistory } from "./hooks/useGameHistory";
import { useGranboardConnection } from "./hooks/useGranboardConnection";
import { useCricketGameState } from "./hooks/useCricketGameState";
import { usePlayerTurnHistory } from "./hooks/usePlayerTurnHistory";
import { useSounds } from "./hooks/useSounds";
import { useSettings } from "@/app/contexts/SettingsContext";

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

  // Player turn history (declare first to use in callbacks)
  const { addTurn, getPlayerHistory } = usePlayerTurnHistory();

  // Use refs to access latest values in callbacks
  const addTurnRef = React.useRef(addTurn);
  const gameStateRef = React.useRef<CricketGameState | null>(null);
  const saveCurrentTurnHitsRef = React.useRef<((hits: Segment[]) => void) | null>(null);

  React.useEffect(() => {
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

      // Play sounds
      if (isGameFinished) {
        playSound("game-over");
      } else {
        playSound("player-change");
      }

      // Show turn summary when player finishes turn (except if game is finished)
      if (!isGameFinished) {
        setTurnSummaryData({ player: playerState, hits });
        setShowTurnSummary(true);
      }
    }
  );

  // Update refs when gameState changes
  React.useEffect(() => {
    gameStateRef.current = gameState;
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
    currentTurnHits
  );

  // Update saveCurrentTurnHits ref
  React.useEffect(() => {
    saveCurrentTurnHitsRef.current = saveCurrentTurnHits;
  }, [saveCurrentTurnHits]);

  // Wrapper for segment hit with sound effects
  const handleSegmentHitWithSound = (segment: any) => {
    // Store previous state to check for number closure
    const previousState = gameState ? { ...gameState } : null;
    const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;

    // Play sound based on segment type
    if (segment.Section === 0) {
      // Miss
      playSound("dart-miss");
    } else if (segment.Type === 3) {
      // Triple
      playSound("triple");
    } else if (segment.Section === 25) {
      // Bull
      playSound("bull");
    } else {
      // Normal hit
      playSound("dart-hit");
    }

    // Process the hit
    onSegmentHit(segment);

    // Check after state update if a number was closed
    setTimeout(() => {
      if (!previousState || !gameState) return;

      const cricketNumbers = [15, 16, 17, 18, 19, 20, 25];
      const hitNumber = segment.Section;

      if (cricketNumbers.includes(hitNumber)) {
        const previousMarks = previousState.players[currentPlayerIndex].scores.get(hitNumber)?.marks ?? 0;
        const newMarks = gameState.players[currentPlayerIndex].scores.get(hitNumber)?.marks ?? 0;

        // Number just closed (went from < 3 to >= 3)
        if (previousMarks < 3 && newMarks >= 3) {
          // Check if all players have closed this number
          const allClosed = gameState.players.every(p => (p.scores.get(hitNumber)?.marks ?? 0) >= 3);

          if (allClosed) {
            playSound("all-closed");
          } else {
            playSound("number-closed");
          }
        }
      }
    }, 100);
  };

  // Granboard connection management
  const { connectionState, connectToBoard } =
    useGranboardConnection(handleSegmentHitWithSound);

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
          className="w-full px-6 py-4 bg-slate-700 text-white rounded-xl hover:bg-slate-600 font-bold text-lg transition-all shadow-lg hover:scale-105"
        >
          {t('cricket.game.newGame')}
        </button>
        <button
          data-testid="quit-button"
          onClick={() => {
            closeDialog();
            handleQuit();
          }}
          className="w-full px-6 py-4 bg-red-700 text-white rounded-xl hover:bg-red-600 font-bold text-lg transition-all shadow-lg hover:scale-105"
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl text-white">Chargement...</div>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <main className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col px-4 py-3 gap-3 overflow-hidden">
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
