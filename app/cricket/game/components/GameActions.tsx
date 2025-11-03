interface GameActionsProps {
  onNewGame: () => void;
  onQuit: () => void;
}

export function GameActions({ onNewGame, onQuit }: GameActionsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onNewGame}
        className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-bold text-sm transition-all shadow-lg hover:scale-105"
      >
        Nouvelle partie
      </button>
      <button
        onClick={onQuit}
        className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 font-bold text-sm transition-all shadow-lg hover:scale-105"
      >
        Quitter
      </button>
    </div>
  );
}
