"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Player, CricketGameMode } from "@/services/cricket";
import { PlayerOrderModal } from "./components/PlayerOrderModal";
import { PlayerOrderDialog } from "./components/PlayerOrderDialog";
import { useGranboard } from "../contexts/GranboardContext";
import { useSettings } from "../contexts/SettingsContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faGear } from "@fortawesome/free-solid-svg-icons";

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
  const [legWinCondition, setLegWinCondition] = useState<'firstTo' | 'bestOf'>('firstTo');
  const [legCount, setLegCount] = useState<number>(3);
  const [startingPlayerRule, setStartingPlayerRule] = useState<'alternate' | 'loser'>('alternate');
  const [legsEnabled, setLegsEnabled] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { granboard, connectToBoard } = useGranboard();

  useEffect(() => {
    console.log('CricketSetup granboard:', granboard);
  }, [granboard]);

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
    sessionStorage.setItem("cricketLegsEnabled", legsEnabled.toString());
    sessionStorage.setItem("cricketLegWinCondition", legWinCondition);
    sessionStorage.setItem("cricketLegCount", legCount.toString());
    sessionStorage.setItem("cricketStartingPlayerRule", startingPlayerRule);
    router.push("/cricket/game");
  };

  const handleThrowForOrder = async () => {
    console.log('handleThrowForOrder: granboard =', granboard);
    try {
      // Use existing connection or create new one
      let board = granboard;
      if (!board) {
        console.log('No board, calling connectToBoard');
        board = await connectToBoard();
        console.log('Connected board:', board);
      } else {
        console.log('Using existing board');
      }
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
    sessionStorage.setItem("cricketLegsEnabled", legsEnabled.toString());
    sessionStorage.setItem("cricketLegWinCondition", legWinCondition);
    sessionStorage.setItem("cricketLegCount", legCount.toString());
    sessionStorage.setItem("cricketStartingPlayerRule", startingPlayerRule);
    router.push("/cricket/game");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addPlayer();
    }
  };

  return (
    <main className="relative min-h-screen bg-theme-primary flex flex-col items-center px-8 py-10 gap-8">
      {/* Back button */}
      <button
        data-testid="back-button"
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 px-4 py-2 bg-theme-interactive text-theme-interactive bg-theme-interactive-hover rounded-lg transition-all flex items-center gap-2"
      >
        <FontAwesomeIcon icon={faArrowLeft} /> {t('common.back')}
      </button>

      {/* Settings Button - Top Right */}
      <div className="absolute top-6 right-6">
        <button
          data-testid="settings-button"
          onClick={() => openDialog()}
          className="px-4 py-2 bg-theme-interactive text-theme-interactive bg-theme-interactive-hover rounded-lg transition-all flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faGear} /> {t('cricket.game.settings')}
        </button>
      </div>

      {/* Title */}
      <div className="w-full text-center">
        <h1 className="text-6xl font-bold text-theme-primary mb-2 tracking-wider">
          {t('cricket.title')}
        </h1>
        <p className="text-theme-tertiary text-lg">{t('cricket.subtitle')}</p>
      </div>

      {/* Main configuration */}
      <div className="w-full max-w-3xl bg-theme-card-alpha backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-theme-card">
        <h2 className="text-3xl font-bold mb-6 text-green-600">
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
            className="flex-1 px-4 py-3 bg-theme-input border border-theme-input rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-theme-input placeholder-theme-input"
            maxLength={20}
          />
          <button
            data-testid="add-player-button"
            onClick={addPlayer}
            className="px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-all font-medium shadow-lg"
          >
            {t('common.add')}
          </button>
        </div>

        {players.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-theme-secondary">
              {t(players.length > 1 ? 'cricket.players.count_plural' : 'cricket.players.count', { count: players.length })}
            </h3>
            <div className="space-y-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  data-testid={`player-item-${player.name}`}
                  className="flex items-center justify-between p-4 bg-theme-card rounded-xl border border-theme-card hover:border-green-500 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-green-600 bg-theme-secondary rounded-full">
                      {index + 1}
                    </span>
                    <span className="text-xl font-medium text-theme-primary">
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
          <p className="text-sm text-theme-muted italic mb-6 text-center py-4 bg-theme-secondary rounded-lg">
            {t('cricket.players.minRequired')}
          </p>
        )}

        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-4 text-green-600">
            {t('cricket.gameMode.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              data-testid="game-mode-standard"
              onClick={() => setGameMode(CricketGameMode.Standard)}
              className={`group p-6 rounded-xl border-2 transition-all ${
                gameMode === CricketGameMode.Standard
                  ? "border-green-500 bg-green-100/50 dark:bg-green-900/30 shadow-lg shadow-green-500/20"
                  : "border-theme-card bg-theme-card hover:border-green-400"
              }`}
            >
              <div className="text-xl font-bold mb-2 text-theme-primary">{t('cricket.gameMode.standard.title')}</div>
              <div className={`text-sm ${gameMode === CricketGameMode.Standard ? "text-theme-primary" : "text-theme-muted"}`}>
                {t('cricket.gameMode.standard.description')}
              </div>
            </button>
            <button
              data-testid="game-mode-cutthroat"
              onClick={() => setGameMode(CricketGameMode.CutThroat)}
              className={`group p-6 rounded-xl border-2 transition-all ${
                gameMode === CricketGameMode.CutThroat
                  ? "border-red-500 bg-red-100/50 dark:bg-red-900/30 shadow-lg shadow-red-500/20"
                  : "border-theme-card bg-theme-card hover:border-red-400"
              }`}
            >
              <div className="text-xl font-bold mb-2 text-theme-primary">{t('cricket.gameMode.cutThroat.title')}</div>
              <div className={`text-sm ${gameMode === CricketGameMode.CutThroat ? "text-theme-primary" : "text-theme-muted"}`}>
                {t('cricket.gameMode.cutThroat.description')}
              </div>
            </button>
          </div>
        </div>

        {/* Leg settings */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-4 text-green-600">
            Формат матча
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 bg-theme-card rounded-xl border border-theme-card hover:border-green-500 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={legsEnabled}
                onChange={(e) => setLegsEnabled(e.target.checked)}
                className="w-5 h-5 text-green-600"
              />
              <div className="flex-1">
                <div className="font-bold text-theme-primary">Игра по легам</div>
                <div className="text-sm text-theme-muted">Включить игру по легам или сетам</div>
              </div>
            </label>
          </div>

          {legsEnabled && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="legWinCondition"
                      value="firstTo"
                      checked={legWinCondition === 'firstTo'}
                      onChange={() => setLegWinCondition('firstTo')}
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="text-theme-primary">До победы в</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={legCount}
                    onChange={(e) => setLegCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="px-4 py-2 bg-theme-input border border-theme-input rounded-lg w-20 text-center font-bold"
                  />
                  <span className="text-theme-secondary">легах</span>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="legWinCondition"
                      value="bestOf"
                      checked={legWinCondition === 'bestOf'}
                      onChange={() => setLegWinCondition('bestOf')}
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="text-theme-primary">Лучший из</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={legCount}
                    onChange={(e) => setLegCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="px-4 py-2 bg-theme-input border border-theme-input rounded-lg w-20 text-center font-bold"
                  />
                  <span className="text-theme-secondary">легов</span>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold mb-3 text-theme-primary">Право начать лег</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 bg-theme-card rounded-xl border border-theme-card hover:border-green-500 transition-all cursor-pointer">
                    <input
                      type="radio"
                      name="startingPlayerRule"
                      value="alternate"
                      checked={startingPlayerRule === 'alternate'}
                      onChange={() => setStartingPlayerRule('alternate')}
                      className="w-5 h-5 text-green-600"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-theme-primary">По очереди</div>
                      <div className="text-sm text-theme-muted">Право начинать лег переходит от игрока к игроку по установленному порядку</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-theme-card rounded-xl border border-theme-card hover:border-green-500 transition-all cursor-pointer">
                    <input
                      type="radio"
                      name="startingPlayerRule"
                      value="loser"
                      checked={startingPlayerRule === 'loser'}
                      onChange={() => setStartingPlayerRule('loser')}
                      className="w-5 h-5 text-green-600"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-theme-primary">Проигравший</div>
                      <div className="text-sm text-theme-muted">Начинает лег проигравший предыдущий лег</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-4 text-green-600">
            {t('cricket.rounds.title')}
          </h3>
          <div className="flex items-center gap-4 bg-theme-card rounded-xl p-4">
            <input
              data-testid="max-rounds-input"
              type="number"
              min="1"
              max="100"
              value={maxRounds}
              onChange={(e) => setMaxRounds(Math.max(1, parseInt(e.target.value) || 1))}
              className="px-6 py-3 bg-theme-input border border-theme-input rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-theme-input w-24 text-center font-bold text-2xl"
            />
            <span className="text-theme-secondary text-sm">
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
                ? "bg-theme-interactive text-theme-muted cursor-not-allowed"
                : "bg-green-700 text-white hover:bg-green-600 hover:scale-105"
            }`}
          >
            {t('common.start')}
          </button>
        </div>
      </div>

      {/* Rules */}
      <div className={`w-full max-w-3xl rounded-2xl p-6 border-2 backdrop-blur-sm ${
        gameMode === CricketGameMode.CutThroat
          ? "bg-game-cutthroat-light border-game-cutthroat-light"
          : "bg-game-standard-light border-game-standard-light"
      }`}>
        <h3 className="text-2xl font-bold mb-4 text-theme-primary">
          {t('cricket.rules.title', {
            mode: t(`cricket.rules.mode.${gameMode === CricketGameMode.CutThroat ? 'cutThroat' : 'standard'}`)
          })}
        </h3>
        <ul className="text-theme-secondary space-y-2 mb-4">
          {(t.raw('cricket.rules.common') as string[]).map((rule, index) => (
            <li key={index}>• {rule}</li>
          ))}
        </ul>
        {gameMode === CricketGameMode.Standard ? (
          <div className="bg-theme-card p-4 rounded-xl border border-accent/30">
            <p className="font-bold text-accent mb-2">{t('cricket.rules.standard.title')}</p>
            <ul className="text-theme-primary space-y-1 text-sm">
              {(t.raw('cricket.rules.standard.rules') as string[]).map((rule, index) => (
                <li key={index}>• {rule}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-theme-card p-4 rounded-xl border border-red-500/30">
            <p className="font-bold text-red-600 mb-2">{t('cricket.rules.cutThroat.title')}</p>
            <ul className="text-theme-primary space-y-1 text-sm">
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
