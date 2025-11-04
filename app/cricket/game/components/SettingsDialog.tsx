import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faVolumeHigh, faVolumeMute } from "@fortawesome/free-solid-svg-icons";

interface SettingsDialogProps {
  show: boolean;
  onClose: () => void;
  onNewGame: () => void;
  onQuit: () => void;
  soundEnabled?: boolean;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  onToggleSound?: () => void;
}

export function SettingsDialog({
  show,
  onClose,
  onNewGame,
  onQuit,
  soundEnabled,
  volume = 0.5,
  onVolumeChange,
  onToggleSound,
}: SettingsDialogProps) {
  if (!show) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange?.(newVolume);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border-2 border-slate-700 max-w-md w-full overflow-hidden">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-700">
          <h3 className="font-bold text-white text-2xl">Paramètres</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold px-3 py-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Sound Control */}
          {onToggleSound && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <label className="text-white font-bold text-base flex items-center gap-2">
                  <FontAwesomeIcon icon={soundEnabled ? faVolumeHigh : faVolumeMute} /> Son
                </label>
                <button
                  onClick={onToggleSound}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    soundEnabled
                      ? "bg-green-600 text-white hover:bg-green-500"
                      : "bg-slate-600 text-white hover:bg-slate-500"
                  }`}
                >
                  {soundEnabled ? "Activé" : "Désactivé"}
                </button>
              </div>
            </div>
          )}

          {/* Volume Control */}
          {onVolumeChange && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <label className="text-white font-bold text-base flex items-center gap-2">
                  <FontAwesomeIcon icon={faVolumeHigh} /> Volume
                </label>
                <span className="text-cyan-400 font-bold text-sm">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                disabled={!soundEnabled}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:bg-cyan-500
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:hover:bg-cyan-400
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:bg-cyan-500
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:hover:bg-cyan-400
                  [&::-moz-range-thumb]:border-0"
              />
              {!soundEnabled && (
                <p className="text-slate-500 text-xs mt-2 text-center">
                  Activez le son pour régler le volume
                </p>
              )}
            </div>
          )}

          {/* Game Actions */}
          <button
            onClick={() => {
              onClose();
              onNewGame();
            }}
            className="w-full px-6 py-4 bg-slate-700 text-white rounded-xl hover:bg-slate-600 font-bold text-lg transition-all shadow-lg hover:scale-105"
          >
            Nouvelle partie
          </button>
          <button
            onClick={() => {
              onClose();
              onQuit();
            }}
            className="w-full px-6 py-4 bg-red-700 text-white rounded-xl hover:bg-red-600 font-bold text-lg transition-all shadow-lg hover:scale-105"
          >
            Quitter
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
