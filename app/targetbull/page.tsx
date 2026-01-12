"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Player } from "@/services/targetbull";
import { PlayerOrderModal } from "../cricket/components/PlayerOrderModal";
import { PlayerOrderDialog } from "../cricket/components/PlayerOrderDialog";
import { useSettings } from "../contexts/SettingsContext";
import { useGranboard } from "../contexts/GranboardContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faGear } from "@fortawesome/free-solid-svg-icons";

export default function TargetBullSetup() {
  const router = useRouter();
  const t = useTranslations();
  const { openDialog } = useSettings();
  const { granboard, connectToBoard } = useGranboard();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentName, setCurrentName] = useState("");
  const [bullSplitMode, setBullSplitMode] = useState<"split" | "unified">("split");
  const [maxRounds, setMaxRounds] = useState<number>(10);
  const [targetScore, setTargetScore] = useState<number>(0);
  const [legWinCondition, setLegWinCondition] = useState<'firstTo' | 'bestOf'>('firstTo');
  const [legCount, setLegCount] = useState<number>(3);
  const [startingPlayerRule, setStartingPlayerRule] = useState<'alternate' | 'loser'>('alternate');
  const [matchFormat, setMatchFormat] = useState<'legs' | 'sets'>('legs');
  const [setWinCondition, setSetWinCondition] = useState<'firstTo' | 'bestOf'>('firstTo');
  const [setCount, setSetCount] = useState<number>(3);
  const [legsPerSet, setLegsPerSet] = useState<number>(3);
  const [startingSetPlayerRule, setStartingSetPlayerRule] = useState<'alternate' | 'loser'>('alternate');
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

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
    sessionStorage.setItem("targetBullPlayers", JSON.stringify(orderedPlayers));
    sessionStorage.setItem("targetBullBullSplitMode", bullSplitMode);
    sessionStorage.setItem("targetBullMaxRounds", maxRounds.toString());
    sessionStorage.setItem("targetBullTargetScore", targetScore.toString());
    sessionStorage.setItem("targetBullLegWinCondition", legWinCondition);
    sessionStorage.setItem("targetBullLegCount", legCount.toString());
    sessionStorage.setItem("targetBullStartingPlayerRule", startingPlayerRule);
    sessionStorage.setItem("targetBullMatchFormat", matchFormat);
    sessionStorage.setItem("targetBullSetWinCondition", setWinCondition);
    sessionStorage.setItem("targetBullSetCount", setCount.toString());
    sessionStorage.setItem("targetBullLegsPerSet", legsPerSet.toString());
    sessionStorage.setItem("targetBullStartingSetPlayerRule", startingSetPlayerRule);
    router.push("/targetbull/game");
  };

  const handleThrowForOrder = async () => {
    console.log('TargetBullSetup handleThrowForOrder: granboard =', granboard);
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
      alert(t('targetBull.errors.connectionFailed'));
    }
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
  };

  const startGame = () => {
    if (players.length < 2) {
      alert(t('targetBull.errors.minPlayers'));
      return;
    }

    // Show order selection dialog
    setShowOrderDialog(true);
  };

  const handleOrderSet = (orderedPlayers: Player[]) => {
    setPlayers(orderedPlayers);
    setShowOrderDialog(false);

    // Store players, bull split mode, max rounds, and target score in sessionStorage
    sessionStorage.setItem("targetBullPlayers", JSON.stringify(orderedPlayers));
    sessionStorage.setItem("targetBullBullSplitMode", bullSplitMode);
    sessionStorage.setItem("targetBullMaxRounds", maxRounds.toString());
    sessionStorage.setItem("targetBullTargetScore", targetScore.toString());
    sessionStorage.setItem("targetBullLegWinCondition", legWinCondition);
    sessionStorage.setItem("targetBullLegCount", legCount.toString());
    sessionStorage.setItem("targetBullStartingPlayerRule", startingPlayerRule);
    sessionStorage.setItem("targetBullMatchFormat", matchFormat);
    sessionStorage.setItem("targetBullSetWinCondition", setWinCondition);
    sessionStorage.setItem("targetBullSetCount", setCount.toString());
    sessionStorage.setItem("targetBullLegsPerSet", legsPerSet.toString());
    sessionStorage.setItem("targetBullStartingSetPlayerRule", startingSetPlayerRule);
    router.push("/targetbull/game");
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
          <FontAwesomeIcon icon={faGear} /> {t('targetBull.game.settings')}
        </button>
      </div>

      {/* Title */}
      <div className="w-full text-center">
        <h1 className="text-6xl font-bold text-theme-primary mb-2 tracking-wider">
          {t('targetBull.title')}
        </h1>
        <p className="text-theme-tertiary text-lg">{t('targetBull.subtitle')}</p>
      </div>

      {/* Main configuration */}
      <div className="w-full max-w-3xl bg-theme-card-alpha backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-theme-card">
        <h2 className="text-3xl font-bold mb-6 text-yellow-600">
          {t('targetBull.players.title')}
        </h2>

        <div className="flex gap-4 mb-6">
          <input
            data-testid="player-name-input"
            type="text"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('targetBull.players.placeholder')}
            className="flex-1 px-4 py-3 bg-theme-input border border-theme-input rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-theme-input placeholder-theme-input"
            maxLength={20}
          />
          <button
            data-testid="add-player-button"
            onClick={addPlayer}
            className="px-8 py-3 bg-yellow-700 text-white rounded-lg hover:bg-yellow-600 transition-all font-medium shadow-lg"
          >
            {t('common.add')}
          </button>
        </div>

        {players.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-theme-secondary">
              {t(players.length > 1 ? 'targetBull.players.count_plural' : 'targetBull.players.count', { count: players.length })}
            </h3>
            <div className="space-y-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  data-testid={`player-item-${player.name}`}
                  className="flex items-center justify-between p-4 bg-theme-card rounded-xl border border-theme-card hover:border-yellow-500 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-yellow-600 bg-theme-secondary rounded-full">
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
            {t('targetBull.players.minRequired')}
          </p>
        )}

        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-4 text-yellow-600">
            {t('targetBull.bullSplitMode.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              data-testid="bull-split-split"
              onClick={() => setBullSplitMode("split")}
              className={`group p-6 rounded-xl border-2 transition-all ${
                bullSplitMode === "split"
                  ? "border-yellow-500 bg-yellow-100/50 dark:bg-yellow-900/30 shadow-lg shadow-yellow-500/20"
                  : "border-theme-card bg-theme-card hover:border-yellow-400"
              }`}
            >
              <div className="text-xl font-bold mb-2 text-theme-primary">{t('targetBull.bullSplitMode.split.title')}</div>
              <div className={`text-sm ${bullSplitMode === "split" ? "text-theme-primary" : "text-theme-muted"}`}>
                {t('targetBull.bullSplitMode.split.description')}
              </div>
            </button>
            <button
              data-testid="bull-split-unified"
              onClick={() => setBullSplitMode("unified")}
              className={`group p-6 rounded-xl border-2 transition-all ${
                bullSplitMode === "unified"
                  ? "border-yellow-500 bg-yellow-100/50 dark:bg-yellow-900/30 shadow-lg shadow-yellow-500/20"
                  : "border-theme-card bg-theme-card hover:border-yellow-400"
              }`}
            >
              <div className="text-xl font-bold mb-2 text-theme-primary">{t('targetBull.bullSplitMode.unified.title')}</div>
              <div className={`text-sm ${bullSplitMode === "unified" ? "text-theme-primary" : "text-theme-muted"}`}>
                {t('targetBull.bullSplitMode.unified.description')}
              </div>
            </button>
          </div>
        </div>

        {/* Match format settings */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-4 text-yellow-600">
            Формат матча
          </h3>
          <div className="space-y-6">
            {/* Format selection */}
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-theme-primary">Играть по:</h4>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 p-4 bg-theme-card rounded-xl border border-theme-card hover:border-yellow-500 transition-all cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="matchFormat"
                    value="legs"
                    checked={matchFormat === 'legs'}
                    onChange={() => setMatchFormat('legs')}
                    className="w-5 h-5 text-yellow-600"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-theme-primary">Легам</div>
                    <div className="text-sm text-theme-muted">Игра до победы в определённом количестве легов</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 bg-theme-card rounded-xl border border-theme-card hover:border-yellow-500 transition-all cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="matchFormat"
                    value="sets"
                    checked={matchFormat === 'sets'}
                    onChange={() => setMatchFormat('sets')}
                    className="w-5 h-5 text-yellow-600"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-theme-primary">Сетам</div>
                    <div className="text-sm text-theme-muted">Игра до победы в сетах, каждый сет состоит из легов</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Legs configuration */}
            {matchFormat === 'legs' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="legWinCondition"
                        value="firstTo"
                        checked={legWinCondition === 'firstTo'}
                        onChange={() => setLegWinCondition('firstTo')}
                        className="w-5 h-5 text-yellow-600"
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
                      disabled={legWinCondition !== 'firstTo'}
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
                        className="w-5 h-5 text-yellow-600"
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
                      disabled={legWinCondition !== 'bestOf'}
                    />
                    <span className="text-theme-secondary">легов</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold mb-3 text-theme-primary">Право начать лег</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 bg-theme-card rounded-xl border border-theme-card hover:border-yellow-500 transition-all cursor-pointer">
                      <input
                        type="radio"
                        name="startingPlayerRule"
                        value="alternate"
                        checked={startingPlayerRule === 'alternate'}
                        onChange={() => setStartingPlayerRule('alternate')}
                        className="w-5 h-5 text-yellow-600"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-theme-primary">По очереди</div>
                        <div className="text-sm text-theme-muted">Право начинать лег переходит от игрока к игроку по установленному порядку</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-theme-card rounded-xl border border-theme-card hover:border-yellow-500 transition-all cursor-pointer">
                      <input
                        type="radio"
                        name="startingPlayerRule"
                        value="loser"
                        checked={startingPlayerRule === 'loser'}
                        onChange={() => setStartingPlayerRule('loser')}
                        className="w-5 h-5 text-yellow-600"
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

            {/* Sets configuration */}
            {matchFormat === 'sets' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="setWinCondition"
                        value="firstTo"
                        checked={setWinCondition === 'firstTo'}
                        onChange={() => setSetWinCondition('firstTo')}
                        className="w-5 h-5 text-yellow-600"
                      />
                      <span className="text-theme-primary">До победы в</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={setCount}
                      onChange={(e) => setSetCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="px-4 py-2 bg-theme-input border border-theme-input rounded-lg w-20 text-center font-bold"
                      disabled={setWinCondition !== 'firstTo'}
                    />
                    <span className="text-theme-secondary">сетах</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="setWinCondition"
                        value="bestOf"
                        checked={setWinCondition === 'bestOf'}
                        onChange={() => setSetWinCondition('bestOf')}
                        className="w-5 h-5 text-yellow-600"
                      />
                      <span className="text-theme-primary">Лучший из</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={setCount}
                      onChange={(e) => setSetCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="px-4 py-2 bg-theme-input border border-theme-input rounded-lg w-20 text-center font-bold"
                      disabled={setWinCondition !== 'bestOf'}
                    />
                    <span className="text-theme-secondary">сетов</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold mb-3 text-theme-primary">Легов в каждом сете</h4>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={legsPerSet}
                      onChange={(e) => setLegsPerSet(Math.max(1, parseInt(e.target.value) || 1))}
                      className="px-4 py-2 bg-theme-input border border-theme-input rounded-lg w-20 text-center font-bold"
                    />
                    <span className="text-theme-secondary">легов для победы в сете</span>
                  </div>
                  <p className="text-sm text-theme-muted mt-2">Внутри сета игроки чередуются по очереди.</p>
                </div>

                <div>
                  <h4 className="text-xl font-bold mb-3 text-theme-primary">Право начать сет</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 bg-theme-card rounded-xl border border-theme-card hover:border-yellow-500 transition-all cursor-pointer">
                      <input
                        type="radio"
                        name="startingSetPlayerRule"
                        value="alternate"
                        checked={startingSetPlayerRule === 'alternate'}
                        onChange={() => setStartingSetPlayerRule('alternate')}
                        className="w-5 h-5 text-yellow-600"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-theme-primary">По очереди</div>
                        <div className="text-sm text-theme-muted">Право начинать сет переходит от игрока к игроку по установленному порядку</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-theme-card rounded-xl border border-theme-card hover:border-yellow-500 transition-all cursor-pointer">
                      <input
                        type="radio"
                        name="startingSetPlayerRule"
                        value="loser"
                        checked={startingSetPlayerRule === 'loser'}
                        onChange={() => setStartingSetPlayerRule('loser')}
                        className="w-5 h-5 text-yellow-600"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-theme-primary">Проигравший</div>
                        <div className="text-sm text-theme-muted">Начинает сет проигравший предыдущий сет</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-4 text-yellow-600">
            {t('targetBull.rounds.title')}
          </h3>
          <div className="flex items-center gap-4 bg-theme-card rounded-xl p-4">
            <input
              data-testid="max-rounds-input"
              type="number"
              min="0"
              max="100"
              value={maxRounds}
              onChange={(e) => setMaxRounds(Math.max(0, parseInt(e.target.value) || 0))}
              className="px-6 py-3 bg-theme-input border border-theme-input rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-theme-input w-24 text-center font-bold text-2xl"
            />
            <span className="text-theme-secondary text-sm">
              {t('targetBull.rounds.description')}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-4 text-yellow-600">
            {t('targetBull.targetScore.title')}
          </h3>
          <div className="flex items-center gap-4 bg-theme-card rounded-xl p-4">
            <input
              data-testid="target-score-input"
              type="number"
              min="0"
              max="10000"
              value={targetScore}
              onChange={(e) => setTargetScore(Math.max(0, parseInt(e.target.value) || 0))}
              className="px-6 py-3 bg-theme-input border border-theme-input rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-theme-input w-32 text-center font-bold text-2xl"
            />
            <span className="text-theme-secondary text-sm">
              {t('targetBull.targetScore.description')}
            </span>
          </div>
          <p className="text-sm text-theme-muted mt-2">
            {t('targetBull.targetScore.note')}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            data-testid="start-game-button"
            onClick={startGame}
            disabled={players.length < 2}
            className={`flex-1 px-8 py-4 rounded-xl font-bold text-xl transition-all shadow-lg ${
              players.length < 2
                ? "bg-theme-interactive text-theme-muted cursor-not-allowed"
                : "bg-yellow-700 text-white hover:bg-yellow-600 hover:scale-105"
            }`}
          >
            {t('common.start')}
          </button>
        </div>
      </div>

      {/* Rules */}
      <div className="w-full max-w-3xl bg-game-targetbull-light border-game-targetbull-light rounded-2xl p-6 border-2 backdrop-blur-sm">
        <h3 className="text-2xl font-bold mb-4 text-theme-primary">
          {t('targetBull.rules.title')}
        </h3>
        <ul className="text-theme-secondary space-y-2 mb-4">
          {(t.raw('targetBull.rules.common') as string[]).map((rule, index) => (
            <li key={index}>• {rule}</li>
          ))}
        </ul>
        <div className="bg-theme-card p-4 rounded-xl border border-yellow-500/30">
          <p className="font-bold text-yellow-600 mb-2">{t('targetBull.rules.scoring.title')}</p>
          <ul className="text-theme-primary space-y-1 text-sm">
            {(t.raw('targetBull.rules.scoring.rules') as string[]).map((rule, index) => (
              <li key={index}>• {rule}</li>
            ))}
          </ul>
        </div>
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