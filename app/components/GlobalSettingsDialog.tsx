"use client";

import { useSettings } from "@/app/contexts/SettingsContext";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faVolumeHigh, faVolumeMute, faGlobe } from "@fortawesome/free-solid-svg-icons";

export function GlobalSettingsDialog() {
  const { isDialogOpen, closeDialog, volume, soundEnabled, setVolume, toggleSound, customContent } = useSettings();
  const t = useTranslations();

  if (!isDialogOpen) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div data-testid="settings-dialog" className="bg-slate-900 rounded-2xl border-2 border-slate-700 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-700">
          <h3 className="font-bold text-white text-2xl">{t('settings.title')}</h3>
          <button
            data-testid="settings-close-button"
            onClick={closeDialog}
            className="text-slate-400 hover:text-white text-2xl font-bold px-3 py-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Global Settings - Always visible */}

          {/* Sound Control */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-white font-bold text-base flex items-center gap-2">
                <FontAwesomeIcon icon={soundEnabled ? faVolumeHigh : faVolumeMute} /> {t('settings.sound.label')}
              </label>
              <button
                data-testid="sound-toggle-button"
                onClick={toggleSound}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  soundEnabled
                    ? "bg-green-600 text-white hover:bg-green-500"
                    : "bg-slate-600 text-white hover:bg-slate-500"
                }`}
              >
                {t(soundEnabled ? 'settings.sound.enabled' : 'settings.sound.disabled')}
              </button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-bold text-base flex items-center gap-2">
                <FontAwesomeIcon icon={faVolumeHigh} /> {t('settings.volume.label')}
              </label>
              <span className="text-cyan-400 font-bold text-sm">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              data-testid="volume-slider"
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
                {t('settings.volume.enableSoundFirst')}
              </p>
            )}
          </div>

          {/* Language Selector */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-white font-bold text-base flex items-center gap-2">
                <FontAwesomeIcon icon={faGlobe} /> {t('settings.language.label')}
              </label>
              <LanguageSelector />
            </div>
          </div>

          {/* Custom Content - Variable content passed by the context */}
          {customContent && (
            <div className="border-t border-slate-700 pt-4">
              {customContent}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="p-6 pt-4 border-t border-slate-700">
          <button
            onClick={closeDialog}
            className="w-full px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 font-bold transition-all shadow-lg"
          >
            {t('settings.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
