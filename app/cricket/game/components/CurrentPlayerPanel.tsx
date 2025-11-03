import { Segment } from "@/services/boardinfo";
import { PlayerState } from "@/services/cricket";

interface CurrentPlayerPanelProps {
  currentPlayer: PlayerState;
  dartsThrown: number;
  currentRound: number;
  maxRounds: number;
  currentTurnHits: Segment[];
  hasHistory: boolean;
  onUndo: () => void;
  onNextPlayer: () => void;
}

export function CurrentPlayerPanel({
  currentPlayer,
  dartsThrown,
  currentRound,
  maxRounds,
  currentTurnHits,
  hasHistory,
  onUndo,
  onNextPlayer,
}: CurrentPlayerPanelProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-4 border border-slate-700">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">
            <span className="text-green-400">{currentPlayer.player.name}</span>
          </h2>
          <div className="flex gap-3 text-slate-300 text-sm">
            <p>
              Fléchette <span className="font-bold text-white">{dartsThrown}</span> / 3
            </p>
            <span>•</span>
            <p>
              Tour <span className="font-bold text-white">{currentRound}</span> /{" "}
              {maxRounds}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onUndo}
            disabled={!hasHistory}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${
              !hasHistory
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-orange-600 text-white hover:bg-orange-500 hover:scale-105"
            }`}
            title="Annuler le dernier coup"
          >
            ↶ Annuler
          </button>
          <button
            onClick={onNextPlayer}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg bg-red-600 text-white hover:bg-red-500 hover:scale-105"
            title="Passer au joueur suivant"
          >
            🔴 Joueur suivant
          </button>
        </div>
      </div>
    </div>
  );
}
