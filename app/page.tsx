"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSettings } from "./contexts/SettingsContext";
import { useGranboard } from "./contexts/GranboardContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const t = useTranslations();
  const { openDialog } = useSettings();
  const {
    connectionState: granboardConnectionState,
    connectToBoard,
    disconnect,
    tryAutoConnect,
  } = useGranboard();

  // Connection state is already in English after removing French strings
  const connectionState = granboardConnectionState;

  const onConnectionTest = async () => {
    await connectToBoard();
  };

  return (
    <main className="relative min-h-screen bg-theme-primary flex flex-col items-center justify-center px-8 py-12">
      {/* Settings Button - Top Left */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => openDialog()}
          className="px-4 py-2 bg-theme-interactive text-theme-interactive bg-theme-interactive-hover rounded-lg transition-all flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faGear} className="w-5 h-5" /> {t('cricket.game.settings')}
        </button>
      </div>

      {/* Connection Test - Top Right */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <span className="text-theme-muted text-sm">{t('common.bluetooth')} :</span>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            connectionState === "connected"
              ? "bg-green-600 text-white"
              : connectionState === "connecting"
              ? "bg-yellow-600 text-white"
              : connectionState === "error"
              ? "bg-red-600 text-white"
              : "bg-theme-interactive text-theme-interactive bg-theme-interactive-hover"
          }`}
          onClick={onConnectionTest}
          disabled={connectionState === "connecting"}
        >
          {t(`common.connectionState.${connectionState}`)}
        </button>
      </div>

      {/* Title */}
      <h1 className="text-6xl font-bold text-theme-primary mb-16 tracking-wider">
        {t('home.title')}
      </h1>

      {/* Game Modes */}
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <Link
          href="/01"
          data-testid="game-card-01"
          className="w-full h-32 text-white bg-blue-700 hover:bg-blue-600 rounded-2xl text-6xl font-bold flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50"
        >
          {t('home.modes.01')}
        </Link>

        <Link
          href="/cricket"
          data-testid="game-card-cricket"
          className="w-full h-32 text-white bg-green-700 hover:bg-green-600 rounded-2xl text-6xl font-bold flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-500/50"
        >
          {t('home.modes.cricket')}
        </Link>

        <Link
          href="/targetbull"
          data-testid="game-card-targetbull"
          className="w-full h-32 text-white bg-yellow-700 hover:bg-yellow-600 rounded-2xl text-6xl font-bold flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-yellow-500/50"
        >
          {t('home.modes.targetBull')}
        </Link>
      </div>
    </main>
  );
}
