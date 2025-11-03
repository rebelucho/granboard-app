interface SettingsDialogProps {
  show: boolean;
  onClose: () => void;
  onNewGame: () => void;
  onQuit: () => void;
}

export function SettingsDialog({
  show,
  onClose,
  onNewGame,
  onQuit,
}: SettingsDialogProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border-2 border-slate-700 max-w-md w-full overflow-hidden">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-700">
          <h3 className="font-bold text-white text-2xl">Paramètres</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold px-3 py-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={() => {
              onClose();
              onNewGame();
            }}
            className="w-full px-6 py-4 bg-slate-700 text-white rounded-xl hover:bg-slate-600 font-bold text-lg transition-all shadow-lg hover:scale-105"
          >
            🆕 Nouvelle partie
          </button>
          <button
            onClick={() => {
              onClose();
              onQuit();
            }}
            className="w-full px-6 py-4 bg-red-700 text-white rounded-xl hover:bg-red-600 font-bold text-lg transition-all shadow-lg hover:scale-105"
          >
            🚪 Quitter
          </button>
        </div>

        <div className="p-6 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 font-bold transition-all shadow-lg"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
