import {
  PlayerTargetBullState,
  BullSplitMode,
  calculatePPD,
  calculatePPR,
  calculateAccuracy,
} from "@/services/targetbull";
import { useTranslations } from "next-intl";

interface ScoreBoardProps {
  players: PlayerTargetBullState[];
  currentPlayerIndex: number;
  gameFinished: boolean;
  bullSplitMode: BullSplitMode;
}

export function ScoreBoard({
  players,
  currentPlayerIndex,
  gameFinished,
  bullSplitMode,
}: ScoreBoardProps) {
  const t = useTranslations();

  // Determine target values based on bull split mode
  const getTargetValues = () => {
    if (bullSplitMode === BullSplitMode.Split) {
      return { "25": 25, "Bull": 50 };
    } else {
      return { "25": 50, "Bull": 50 };
    }
  };

  const targetValues = getTargetValues();

  return (
    <div className="bg-theme-card rounded-xl shadow-2xl border-2 border-theme-card h-full flex flex-col overflow-hidden">
      <div className="overflow-auto flex-1">
        <div className="space-y-2 p-4">
          {players.map((playerState, idx) => {
            const isCurrentPlayer = idx === currentPlayerIndex;
            const totalHits = playerState.hits25 + playerState.hitsBull + playerState.hitsDoubleBull;

            return (
              <div
                key={playerState.player.id}
                data-testid={`scoreboard-player-${playerState.player.name}`}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isCurrentPlayer && !gameFinished
                    ? "border-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 shadow-xl ring-4 ring-yellow-500 dark:ring-yellow-500"
                    : "border-yellow-700 bg-yellow-700 dark:border-yellow-700 dark:bg-yellow-700"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {isCurrentPlayer && !gameFinished && (
                      <span className="text-yellow-500 text-2xl animate-pulse">
                        ▶
                      </span>
                    )}
                    <span
                      className={`text-xl font-bold ${
                        isCurrentPlayer && !gameFinished
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-white"
                      }`}
                    >
                      {playerState.player.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white font-medium">
                      {playerState.totalScore} {t('targetBull.game.points')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Total Score */}
                  <div className="text-center">
                    <div
                      className={`text-5xl font-bold mb-1 ${
                        isCurrentPlayer && !gameFinished
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-white"
                      }`}
                    >
                      {playerState.totalScore}
                    </div>
                    <div
                      className={`text-xs uppercase tracking-wide ${
                        isCurrentPlayer && !gameFinished
                          ? "text-yellow-500 font-bold"
                          : "text-white font-semibold"
                      }`}
                    >
                      {t('targetBull.game.totalScore')}
                    </div>
                  </div>

                  {/* Target hits breakdown */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${
                        isCurrentPlayer && !gameFinished
                          ? "text-yellow-500"
                          : "text-white"
                      }`}>
                        {t('targetBull.game.singleBull')} ({bullSplitMode === BullSplitMode.Split ? 25 : 50})
                      </span>
                      <span className={`font-bold ${
                        isCurrentPlayer && !gameFinished
                          ? "text-yellow-500"
                          : "text-white"
                      }`}>
                        {playerState.hits25} × {targetValues["25"]} = {playerState.hits25 * targetValues["25"]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${
                        isCurrentPlayer && !gameFinished
                          ? "text-yellow-500"
                          : "text-white"
                      }`}>
                        {t('targetBull.game.doubleBull')} (50)
                      </span>
                      <span className={`font-bold ${
                        isCurrentPlayer && !gameFinished
                          ? "text-yellow-500"
                          : "text-white"
                      }`}>
                        {playerState.hitsDoubleBull} × 50 = {playerState.hitsDoubleBull * 50}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistics row */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-yellow-500/30">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      isCurrentPlayer && !gameFinished
                        ? "text-yellow-500"
                        : "text-white"
                    }`}>
                      {calculatePPD(playerState).toFixed(2)}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-white/80">
                      PPD
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      isCurrentPlayer && !gameFinished
                        ? "text-yellow-500"
                        : "text-white"
                    }`}>
                      {calculatePPR(playerState).toFixed(2)}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-white/80">
                      PPR
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      isCurrentPlayer && !gameFinished
                        ? "text-yellow-500"
                        : "text-white"
                    }`}>
                      {calculateAccuracy(playerState).toFixed(2)}%
                    </div>
                    <div className="text-xs uppercase tracking-wide text-white/80">
                      {t('targetBull.game.accuracy')}
                    </div>
                  </div>
                </div>

                {/* Additional info */}
                <div className="flex justify-between items-center mt-3 text-xs text-white/70">
                  <span>
                    {t('targetBull.game.darts')}: {playerState.dartsThrown}
                  </span>
                  <span>
                    {t('targetBull.game.rounds')}: {playerState.roundsPlayed}
                  </span>
                  <span>
                    {t('targetBull.game.hits')}: {totalHits}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}