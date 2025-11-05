import { useTranslations } from "next-intl";
import { Player, PlayerState as PlayerCricketState, calculateMPR, CricketGameMode } from "@/services/cricket";
import { PlayerState as PlayerZeroOneState, calculatePPD, calculateAverage, ZeroOneMode } from "@/services/zeroone";

type GameMode = CricketGameMode | ZeroOneMode;
type PlayerState = PlayerCricketState | PlayerZeroOneState;

interface GameOverBannerProps {
  winner: Player;
  players: PlayerState[];
  totalRounds: number;
  gameMode: GameMode;
  onNewGame: () => void;
  onQuit: () => void;
}

// Type guards
function isCricketPlayer(player: PlayerState): player is PlayerCricketState {
  return 'totalMarks' in player;
}

function isCricketMode(mode: GameMode): mode is CricketGameMode {
  return typeof mode === 'string';
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

  const isCricket = isCricketMode(gameMode);

  // Sort players by ranking (winner first, then by score or MPR)
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.player.id === winner.id) return -1;
    if (b.player.id === winner.id) return 1;

    if (isCricket) {
      const aCricket = a as PlayerCricketState;
      const bCricket = b as PlayerCricketState;
      if (gameMode === CricketGameMode.CutThroat) {
        // Cut Throat: Lower score is better
        return aCricket.totalPoints - bCricket.totalPoints;
      } else {
        // Standard: Higher score is better
        return bCricket.totalPoints - aCricket.totalPoints;
      }
    } else {
      // 01 mode: Lower remaining score is better
      const aZeroOne = a as PlayerZeroOneState;
      const bZeroOne = b as PlayerZeroOneState;
      return aZeroOne.currentScore - bZeroOne.currentScore;
    }
  });

  return (
    <div className="bg-yellow-600 text-white p-8 rounded-2xl shadow-2xl border-2 border-yellow-400">
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
      <div className="bg-theme-card backdrop-blur-sm rounded-xl p-6 mb-6">
        <h3 className="text-2xl font-bold text-theme-primary mb-4 text-center">
          {isCricket ? t('cricket.game.gameStats') : t('zeroOne.game.gameStats')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-theme-tertiary">
                <th className="p-3 text-left font-bold text-theme-tertiary">{t('cricket.game.rank')}</th>
                <th className="p-3 text-left font-bold text-theme-tertiary">{t('cricket.game.player')}</th>
                {isCricket ? (
                  <>
                    <th className="p-3 text-center font-bold text-theme-tertiary">{t('cricket.game.points')}</th>
                    <th className="p-3 text-center font-bold text-theme-tertiary">{t('cricket.game.marks')}</th>
                    <th className="p-3 text-center font-bold text-theme-tertiary">{t('cricket.game.mpr')}</th>
                  </>
                ) : (
                  <>
                    <th className="p-3 text-center font-bold text-theme-tertiary">{t('zeroOne.game.remaining')}</th>
                    <th className="p-3 text-center font-bold text-theme-tertiary">{t('zeroOne.game.average')}</th>
                    <th className="p-3 text-center font-bold text-theme-tertiary">PPD</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((playerState, index) => {
                const isWinner = playerState.player.id === winner.id;
                return (
                  <tr
                    key={playerState.player.id}
                    className={`border-b border-theme-tertiary ${
                      isWinner ? "bg-yellow-500/20" : ""
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
                        <span className="text-theme-tertiary font-semibold">
                          {index + 1}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-theme-primary">
                      {playerState.player.name}
                      {isWinner && (
                        <span className="ml-2 text-yellow-600">👑</span>
                      )}
                    </td>
                    {isCricket && isCricketPlayer(playerState) ? (
                      <>
                        <td
                          className={`p-3 text-center font-bold ${
                            gameMode === CricketGameMode.CutThroat
                              ? "text-red-600"
                              : "text-accent"
                          }`}
                        >
                          {playerState.totalPoints}
                        </td>
                        <td className="p-3 text-center font-semibold text-theme-primary">
                          {playerState.totalMarks}
                        </td>
                        <td className="p-3 text-center font-bold text-accent text-lg">
                          {calculateMPR(playerState).toFixed(2)}
                        </td>
                      </>
                    ) : !isCricket && !isCricketPlayer(playerState) ? (
                      <>
                        <td className="p-3 text-center font-bold text-accent">
                          {playerState.currentScore}
                        </td>
                        <td className="p-3 text-center font-semibold text-theme-primary">
                          {calculateAverage(playerState).toFixed(2)}
                        </td>
                        <td className="p-3 text-center font-bold text-accent text-lg">
                          {calculatePPD(playerState).toFixed(2)}
                        </td>
                      </>
                    ) : null}
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
          className="px-8 py-3 bg-white text-yellow-700 rounded-xl hover:bg-theme-secondary font-bold text-lg transition-all shadow-lg hover:scale-105"
        >
          {t('cricket.game.newGame')}
        </button>
        <button
          onClick={onQuit}
          className="px-8 py-3 bg-theme-secondary text-theme-primary rounded-xl hover:bg-theme-tertiary font-bold text-lg transition-all shadow-lg hover:scale-105"
        >
          {t('cricket.game.quit')}
        </button>
      </div>
    </div>
  );
}
