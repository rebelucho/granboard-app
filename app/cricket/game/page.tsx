"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

// Components
import { GameHeader } from "./components/GameHeader";
import { GameOverBanner } from "./components/GameOverBanner";
import { CurrentPlayerPanel } from "./components/CurrentPlayerPanel";
import { ScoreBoard } from "./components/ScoreBoard";
import { HitAnimation } from "./components/HitAnimation";
import { TurnSummary } from "./components/TurnSummary";
import { PlayerTurnHistory } from "./components/PlayerTurnHistory";
import { LegendDialog } from "./components/LegendDialog";
import { SettingsDialog } from "./components/SettingsDialog";

export default function CricketGame() {
  const router = useRouter();

  // Animation states
  const [showTurnSummary, setShowTurnSummary] = useState(false);
  const [turnSummaryData, setTurnSummaryData] = useState<{
    player: any;
    hits: any[];
  } | null>(null);

  // Dialog states
  const [showLegend, setShowLegend] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
      saveCurrentTurnHits(hits);
    },
    (playerState, hits, isGameFinished) => {
      // Add turn to player history
      if (gameState) {
        addTurn(playerState.player, gameState.currentRound, hits);
      }

      // Show turn summary when player finishes turn (except if game is finished)
      if (!isGameFinished) {
        setTurnSummaryData({ player: playerState, hits });
        setShowTurnSummary(true);
      }
    }
  );

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

  // Player turn history
  const { addTurn, getPlayerHistory } = usePlayerTurnHistory();

  // Granboard connection management
  const { connectionState, connectToBoard } =
    useGranboardConnection(onSegmentHit);

  // Close turn summary when next player throws a dart
  useEffect(() => {
    if (lastHit && showTurnSummary) {
      setShowTurnSummary(false);
      setTurnSummaryData(null);
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
        onShowSettings={() => setShowSettings(true)}
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

      <SettingsDialog
        show={showSettings}
        onClose={() => setShowSettings(false)}
        onNewGame={handleNewGame}
        onQuit={handleQuit}
      />
    </main>
  );
}
