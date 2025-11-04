"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Player, CricketGameMode } from "@/services/cricket";
import { PlayerOrderModal } from "./components/PlayerOrderModal";
import { PlayerOrderDialog } from "./components/PlayerOrderDialog";
import { Granboard } from "@/services/granboard";
import { useSettings } from "../contexts/SettingsContext";

export default function CricketSetup() {
  const router = useRouter();
  const t = useTranslations();
  const { openDialog } = useSettings();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentName, setCurrentName] = useState("");
  const [gameMode, setGameMode] = useState<CricketGameMode>(
    CricketGameMode.Standard
  );
  const [maxRounds, setMaxRounds] = useState<number>(20);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [granboard, setGranboard] = useState<Granboard | null>(null);

  const addPlayer = () => {
    if (currentName.trim() === "") return;

    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: currentName.trim(),
    };

    setPlayers([...players, newPlayer]);
    setCurrentName("");
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const handleOrderDetermined = (orderedPlayers: Player[]) => {
    setPlayers(orderedPlayers);
    setShowOrderModal(false);
    // Keep granboard connected for the game

    // Start the game with the determined order
    sessionStorage.setItem("cricketPlayers", JSON.stringify(orderedPlayers));
    sessionStorage.setItem("cricketGameMode", gameMode);
    sessionStorage.setItem("cricketMaxRounds", maxRounds.toString());
    router.push("/cricket/game");
  };

  const handleThrowForOrder = async () => {
    try {
      const board = await Granboard.ConnectToBoard();
      setGranboard(board);
      setShowOrderModal(true);
    } catch (error) {
      console.error("Failed to connect to Granboard:", error);
      alert(t('cricket.errors.connectionFailed'));
    }
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    // Keep granboard connected
  };

  const startGame = () => {
    if (players.length < 2) {
      alert(t('cricket.errors.minPlayers'));
      return;
    }

    // Show order selection dialog
    setShowOrderDialog(true);
  };

  const handleOrderSet = (orderedPlayers: Player[]) => {
    setPlayers(orderedPlayers);
    setShowOrderDialog(false);

    // Store players, game mode, and max rounds in sessionStorage
    sessionStorage.setItem("cricketPlayers", JSON.stringify(orderedPlayers));
    sessionStorage.setItem("cricketGameMode", gameMode);
    sessionStorage.setItem("cricketMaxRounds", maxRounds.toString());
    router.push("/cricket/game");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addPlayer();
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center px-8 py-10 gap-8">
      {/* Back button */}
      <button
        data-testid="back-button"
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-all"
      >
        ← {t('common.back')}
      </button>

      {/* Settings Button - Top Right */}
      <div className="absolute top-6 right-6">
        <button
          data-testid="settings-button"
          onClick={() => openDialog()}
          className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-all flex items-center gap-2"
        >
          ⚙️ {t('cricket.game.settings')}
        </button>
      </div>

      {/* Title */}
      <div className="w-full text-center">
        <h1 className="text-6xl font-bold text-white mb-2 tracking-wider">
          {t('cricket.title')}
        </h1>
        <p className="text-slate-400 text-lg">{t('cricket.subtitle')}</p>
      </div>

      {/* Main configuration */}
      <div className="w-full max-w-3xl bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700">
        <h2 className="text-3xl font-bold mb-6 text-green-400">
          {t('cricket.players.title')}
        </h2>

        <div className="flex gap-4 mb-6">
          <input
            data-testid="player-name-input"
            type="text"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('cricket.players.placeholder')}
            className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-slate-400"
            maxLength={20}
          />
          <button
            data-testid="add-player-button"
            onClick={addPlayer}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-500 hover:to-green-600 transition-all font-medium shadow-lg"
          >
            {t('common.add')}
          </button>
        </div>

        {players.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-slate-300">
              {t(players.length > 1 ? 'cricket.players.count_plural' : 'cricket.players.count', { count: players.length })}
            </h3>
            <div className="space-y-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  data-testid={`player-item-${player.name}`}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border border-slate-600 hover:border-green-500 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-green-400 bg-slate-800 rounded-full">
                      {index + 1}
                    </span>
                    <span className="text-xl font-medium text-white">
                      {player.name}
                    </span>
                  </div>
                  <button
                    data-testid={`remove-player-button-${player.name}`}
                    onClick={() => removePlayer(player.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all text-sm font-medium"
                  >
                    {t('common.remove')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {players.length < 2 && (
          <p className="text-sm text-slate-400 italic mb-6 text-center py-4 bg-slate-700/30 rounded-lg">
            {t('cricket.players.minRequired')}
          </p>
        )}

        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-4 text-green-400">
            {t('cricket.gameMode.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              data-testid="game-mode-standard"
              onClick={() => setGameMode(CricketGameMode.Standard)}
              className={`group p-6 rounded-xl border-2 transition-all ${
                gameMode === CricketGameMode.Standard
                  ? "border-green-500 bg-green-900/30 shadow-lg shadow-green-500/20"
                  : "border-slate-600 bg-slate-700/30 hover:border-green-400"
              }`}
            >
              <div className="text-xl font-bold mb-2 text-white">{t('cricket.gameMode.standard.title')}</div>
              <div className="text-sm text-slate-400">
                {t('cricket.gameMode.standard.description')}
              </div>
            </button>
            <button
              data-testid="game-mode-cutthroat"
              onClick={() => setGameMode(CricketGameMode.CutThroat)}
              className={`group p-6 rounded-xl border-2 transition-all ${
                gameMode === CricketGameMode.CutThroat
                  ? "border-red-500 bg-red-900/30 shadow-lg shadow-red-500/20"
                  : "border-slate-600 bg-slate-700/30 hover:border-red-400"
              }`}
            >
              <div className="text-xl font-bold mb-2 text-white">{t('cricket.gameMode.cutThroat.title')}</div>
              <div className="text-sm text-slate-400">
                {t('cricket.gameMode.cutThroat.description')}
              </div>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-4 text-green-400">
            {t('cricket.rounds.title')}
          </h3>
          <div className="flex items-center gap-4 bg-slate-700/50 rounded-xl p-4">
            <input
              data-testid="max-rounds-input"
              type="number"
              min="1"
              max="100"
              value={maxRounds}
              onChange={(e) => setMaxRounds(Math.max(1, parseInt(e.target.value) || 1))}
              className="px-6 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white w-24 text-center font-bold text-2xl"
            />
            <span className="text-slate-300 text-sm">
              {t('cricket.rounds.description')}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            data-testid="start-game-button"
            onClick={startGame}
            disabled={players.length < 2}
            className={`flex-1 px-8 py-4 rounded-xl font-bold text-xl transition-all shadow-lg ${
              players.length < 2
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-500 hover:to-green-600 hover:scale-105"
            }`}
          >
            {t('common.start')}
          </button>
        </div>
      </div>

      {/* Rules */}
      <div className={`w-full max-w-3xl rounded-2xl p-6 border-2 ${
        gameMode === CricketGameMode.CutThroat
          ? "bg-red-900/20 border-red-700/50 backdrop-blur-sm"
          : "bg-blue-900/20 border-blue-700/50 backdrop-blur-sm"
      }`}>
        <h3 className="text-2xl font-bold mb-4 text-white">
          {t('cricket.rules.title', {
            mode: t(`cricket.rules.mode.${gameMode === CricketGameMode.CutThroat ? 'cutThroat' : 'standard'}`)
          })}
        </h3>
        <ul className="text-slate-300 space-y-2 mb-4">
          {(t.raw('cricket.rules.common') as string[]).map((rule, index) => (
            <li key={index}>• {rule}</li>
          ))}
        </ul>
        {gameMode === CricketGameMode.Standard ? (
          <div className="bg-slate-800/50 p-4 rounded-xl border border-blue-500/30">
            <p className="font-bold text-blue-400 mb-2">{t('cricket.rules.standard.title')}</p>
            <ul className="text-slate-300 space-y-1 text-sm">
              {(t.raw('cricket.rules.standard.rules') as string[]).map((rule, index) => (
                <li key={index}>• {rule}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-slate-800/50 p-4 rounded-xl border border-red-500/30">
            <p className="font-bold text-red-400 mb-2">{t('cricket.rules.cutThroat.title')}</p>
            <ul className="text-slate-300 space-y-1 text-sm">
              {(t.raw('cricket.rules.cutThroat.rules') as string[]).map((rule, index) => (
                <li key={index}>• {rule}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Player order dialog */}
      {showOrderDialog && (
        <PlayerOrderDialog
          players={players}
          onOrderSet={handleOrderSet}
          onThrowForOrder={handleThrowForOrder}
          onClose={() => setShowOrderDialog(false)}
        />
      )}

      {/* Player order modal (for throw for order) */}
      {showOrderModal && granboard && (
        <PlayerOrderModal
          players={players}
          granboard={granboard}
          onOrderDetermined={handleOrderDetermined}
          onClose={handleCloseOrderModal}
        />
      )}
    </main>
  );
}
