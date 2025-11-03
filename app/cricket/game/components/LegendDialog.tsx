import { CricketGameMode } from "@/services/cricket";

interface LegendDialogProps {
  show: boolean;
  gameMode: CricketGameMode;
  onClose: () => void;
}

export function LegendDialog({ show, gameMode, onClose }: LegendDialogProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border-2 border-slate-700 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 md:p-6 pb-3 border-b border-slate-700">
          <h3 className="font-bold text-white text-xl md:text-2xl">Légende</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold px-3 py-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 md:p-6 pt-4">
          <div className="space-y-3 md:space-y-4">
          <div>
            <h4 className="text-base md:text-lg font-bold text-cyan-400 mb-2 md:mb-3">Symboles de marques</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-sm md:text-base text-slate-300">
              <div className="flex items-center gap-2 md:gap-3 bg-slate-800/50 p-2 md:p-3 rounded-lg">
                <span className="text-xl md:text-2xl font-bold text-cyan-400">/</span>
                <span>1 marque (Simple)</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 bg-slate-800/50 p-2 md:p-3 rounded-lg">
                <span className="text-xl md:text-2xl font-bold text-cyan-400">X</span>
                <span>2 marques (Double)</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 bg-slate-800/50 p-2 md:p-3 rounded-lg">
                <span className="text-xl md:text-2xl font-bold text-green-400">⊗</span>
                <span>Fermé (3 marques)</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 bg-slate-800/50 p-2 md:p-3 rounded-lg">
                <span className="text-xl md:text-2xl font-bold text-slate-500">⊗</span>
                <span>Fermé par tous</span>
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4 bg-slate-800/50 rounded-xl border border-cyan-500/30">
            <p className="text-sm md:text-base text-cyan-400 font-bold mb-2">
              📊 MPR (Marks Per Round)
            </p>
            <p className="text-xs md:text-sm text-slate-300">
              Nombre moyen de marques par tour. Un bon joueur atteint 3+ MPR.
            </p>
            <ul className="list-disc list-inside mt-2 text-xs md:text-sm text-slate-300 space-y-1">
              <li>Simple = 1 marque</li>
              <li>Double = 2 marques</li>
              <li>Triple = 3 marques</li>
            </ul>
          </div>

          <div className="p-3 md:p-4 bg-slate-800/50 rounded-xl border border-blue-500/30">
            <p className="text-sm md:text-base text-blue-400 font-bold mb-2">
              🎯 Mode Standard
            </p>
            <p className="text-xs md:text-sm text-slate-300">
              Fermez vos numéros (3 marques) puis scorez des points en continuant à viser ces numéros.
              Le joueur avec le plus de points gagne !
            </p>
          </div>

          {gameMode === CricketGameMode.CutThroat && (
            <div className="p-3 md:p-4 bg-slate-800/50 rounded-xl border border-red-500/30">
              <p className="text-sm md:text-base text-red-400 font-bold mb-2">
                ⚠️ Mode Cut Throat
              </p>
              <p className="text-xs md:text-sm text-slate-300">
                Les points (affichés en rouge) sont MAUVAIS ! Quand vous touchez un numéro fermé
                par vous mais pas par vos adversaires, vous leur donnez des points.
                Fermez vos cibles rapidement pour éviter de recevoir des points.
                Le joueur avec le MOINS de points gagne !
              </p>
            </div>
          )}
          </div>
        </div>

        <div className="p-4 md:p-6 pt-3 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-4 md:px-6 py-2 md:py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 font-bold text-sm md:text-base transition-all shadow-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
