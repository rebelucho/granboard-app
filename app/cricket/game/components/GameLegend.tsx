import { CricketGameMode } from "@/services/cricket";

interface GameLegendProps {
  gameMode: CricketGameMode;
}

export function GameLegend({ gameMode }: GameLegendProps) {
  return (
    <div
      className={`rounded-xl p-3 border backdrop-blur-sm ${
        gameMode === CricketGameMode.CutThroat
          ? "bg-red-900/20 border-red-700/50"
          : "bg-blue-900/20 border-blue-700/50"
      }`}
    >
      <h3 className="font-bold mb-2 text-white text-sm">Légende:</h3>
      <div className="grid grid-cols-4 gap-2 text-xs text-slate-300">
        <div>/ = 1 marque</div>
        <div>X = 2 marques</div>
        <div>⊗ = Fermé</div>
        <div className="text-cyan-400">MPR = Moy. marques/tour</div>
      </div>

      {gameMode === CricketGameMode.CutThroat && (
        <div className="mt-2 p-2 bg-slate-800/50 rounded-lg border border-red-500/30">
          <p className="text-xs text-red-400 font-bold">
            ⚠️ Cut Throat: Points en rouge = MAUVAIS!
          </p>
        </div>
      )}
    </div>
  );
}
