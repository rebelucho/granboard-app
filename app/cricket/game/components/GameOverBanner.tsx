import { useTranslations } from "next-intl";
import { Player, PlayerState, calculateMPR, CricketGameMode } from "@/services/cricket";

interface GameOverBannerProps {
  winner: Player;
  players: PlayerState[];
  totalRounds: number;
  gameMode: CricketGameMode;
  onNewGame: () => void;
  onQuit: () => void;
}

export function GameOverBanner({
  winner,
  players,
  totalRounds,
  gameMode,
  onNewGame,
  onQuit,
}: GameOverBannerProps) {
  const t = useTranslations();
  // Sort players by ranking (winner first, then by score or MPR)
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.player.id === winner.id) return -1;
    if (b.player.id === winner.id) return 1;

    if (gameMode === CricketGameMode.CutThroat) {
      // Cut Throat: Lower score is better
      return a.totalPoints - b.totalPoints;
    } else {
      // Standard: Higher score is better
      return b.totalPoints - a.totalPoints;
    }
  });

  return (
    <div className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white p-8 rounded-2xl shadow-2xl border-2 border-yellow-400">
      <h2 className="text-5xl font-bold mb-2 text-center">
        🎉 {t('cricket.game.wonGame', { name: winner.name })} 🎉
      </h2>
      <p className="text-xl text-center mb-6 text-yellow-100">
        {t('cricket.game.gameEndedAfter', {
          rounds: totalRounds,
          roundsLabel: totalRounds > 1 ? t('cricket.game.rounds') : t('cricket.game.round').toLowerCase()
        })}
      </p>

      {/* Statistics Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 mb-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">
          {t('cricket.game.gameStats')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="p-3 text-left font-bold text-slate-700">{t('cricket.game.rank')}</th>
                <th className="p-3 text-left font-bold text-slate-700">{t('cricket.game.player')}</th>
                <th className="p-3 text-center font-bold text-slate-700">{t('cricket.game.points')}</th>
                <th className="p-3 text-center font-bold text-slate-700">{t('cricket.game.marks')}</th>
                <th className="p-3 text-center font-bold text-slate-700">{t('cricket.game.mpr')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((playerState, index) => {
                const isWinner = playerState.player.id === winner.id;
                return (
                  <tr
                    key={playerState.player.id}
                    className={`border-b border-slate-200 ${
                      isWinner ? "bg-yellow-100" : ""
                    }`}
                  >
                    <td className="p-3 text-center">
                      {index === 0 ? (
                        <span className="text-2xl">🥇</span>
                      ) : index === 1 ? (
                        <span className="text-2xl">🥈</span>
                      ) : index === 2 ? (
                        <span className="text-2xl">🥉</span>
                      ) : (
                        <span className="text-slate-600 font-semibold">
                          {index + 1}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      {playerState.player.name}
                      {isWinner && (
                        <span className="ml-2 text-yellow-600">👑</span>
                      )}
                    </td>
                    <td
                      className={`p-3 text-center font-bold ${
                        gameMode === CricketGameMode.CutThroat
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {playerState.totalPoints}
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-700">
                      {playerState.totalMarks}
                    </td>
                    <td className="p-3 text-center font-bold text-cyan-600 text-lg">
                      {calculateMPR(playerState).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onNewGame}
          className="px-8 py-3 bg-white text-yellow-700 rounded-xl hover:bg-slate-100 font-bold text-lg transition-all shadow-lg hover:scale-105"
        >
          {t('cricket.game.newGame')}
        </button>
        <button
          onClick={onQuit}
          className="px-8 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 font-bold text-lg transition-all shadow-lg hover:scale-105"
        >
          {t('cricket.game.quit')}
        </button>
      </div>
    </div>
  );
}
