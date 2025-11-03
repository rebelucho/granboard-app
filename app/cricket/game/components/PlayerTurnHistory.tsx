import { useTranslations } from "next-intl";
import { Player } from "@/services/cricket";
import { PlayerTurn } from "../hooks/usePlayerTurnHistory";
import { Segment } from "@/services/boardinfo";

interface PlayerTurnHistoryProps {
  player: Player;
  turns: PlayerTurn[];
  currentTurnHits: Segment[];
  currentRound: number;
}

export function PlayerTurnHistory({ player, turns, currentTurnHits, currentRound }: PlayerTurnHistoryProps) {
  const t = useTranslations();

  return (
    <div className="bg-slate-900 rounded-xl shadow-2xl border-2 border-slate-700 h-full flex flex-col overflow-hidden">
      <h3 className="text-lg font-bold text-white px-4 py-3 border-b-2 border-cyan-500 flex-shrink-0">
        {t('cricket.game.history')} - {player.name}
      </h3>
      <div className="overflow-y-auto flex-1 p-4 space-y-2">
        {/* Current turn */}
        <div className="bg-gradient-to-r from-cyan-900/50 to-slate-800/50 rounded-lg p-2 border-2 border-cyan-500">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-cyan-400">
              {t('cricket.game.round')} {currentRound} ({t('cricket.game.inProgress')})
            </span>
            <span className="text-xs text-cyan-400">
              {currentTurnHits.length} / 3 {t('cricket.game.darts')}
            </span>
          </div>
          <div className="flex gap-1.5">
            {currentTurnHits.length > 0 ? (
              <>
                {currentTurnHits.map((hit, hitIdx) => (
                  <div
                    key={hitIdx}
                    className={`flex-1 bg-slate-700/50 rounded px-2 py-1.5 text-center ${
                      hitIdx === currentTurnHits.length - 1 ? "ring-2 ring-green-400" : ""
                    }`}
                  >
                    <div className="text-sm font-bold text-white">
                      {hit.ShortName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {hit.Value}
                    </div>
                  </div>
                ))}
                {/* Fill remaining dart slots */}
                {currentTurnHits.length < 3 &&
                  Array.from({ length: 3 - currentTurnHits.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="flex-1 bg-slate-700/20 rounded px-2 py-1.5 text-center"
                    >
                      <div className="text-sm text-slate-600">-</div>
                      <div className="text-xs text-slate-600">0</div>
                    </div>
                  ))}
              </>
            ) : (
              /* No darts thrown yet */
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-1 bg-slate-700/20 rounded px-2 py-1.5 text-center"
                >
                  <div className="text-sm text-slate-600">-</div>
                  <div className="text-xs text-slate-600">0</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Previous turns */}
        {turns.length > 0 ? (
          [...turns].reverse().map((turn, idx) => {
            return (
              <div
                key={`${turn.round}-${idx}`}
                className="bg-slate-800/50 rounded-lg p-2 border border-slate-700"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-cyan-400">
                    {t('cricket.game.round')} {turn.round}
                  </span>
                  <span className="text-xs text-slate-400">
                    {turn.hits.length} {t('cricket.game.darts')}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {turn.hits.map((hit, hitIdx) => (
                    <div
                      key={hitIdx}
                      className="flex-1 bg-slate-700/50 rounded px-2 py-1.5 text-center"
                    >
                      <div className="text-sm font-bold text-white">
                        {hit.ShortName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {hit.Value}
                      </div>
                    </div>
                  ))}
                  {/* Fill empty dart slots */}
                  {turn.hits.length < 3 &&
                    Array.from({ length: 3 - turn.hits.length }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="flex-1 bg-slate-700/20 rounded px-2 py-1.5 text-center"
                      >
                        <div className="text-sm text-slate-600">-</div>
                        <div className="text-xs text-slate-600">0</div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-slate-500 text-center py-4 text-sm">
            {t('cricket.game.noCompletedTurns')}
          </div>
        )}
      </div>
    </div>
  );
}
