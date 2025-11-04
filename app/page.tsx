"use client";

import { Granboard } from "@/services/granboard";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { LanguageSelector } from "./components/LanguageSelector";
import { useSettings } from "./contexts/SettingsContext";

export default function Home() {
  const t = useTranslations();
  const { openDialog } = useSettings();
  const [granboard, setGranboard] = useState<Granboard>();
  const [connectionState, setConnectionState] = useState<
    "waiting" | "connecting" | "connected" | "error"
  >("waiting");

  const onConnectionTest = async () => {
    setConnectionState("connecting");

    try {
      setGranboard(await Granboard.ConnectToBoard());
      setConnectionState("connected");
    } catch (error) {
      console.error(error);
      setConnectionState("error");
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-8 py-12">
      {/* Settings Button - Top Left */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => openDialog()}
          className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-all flex items-center gap-2"
        >
          ⚙️ {t('cricket.game.settings')}
        </button>
      </div>

      {/* Connection Test - Top Right */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <span className="text-slate-400 text-sm">{t('common.bluetooth')} :</span>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            connectionState === "connected"
              ? "bg-green-600 text-white"
              : connectionState === "connecting"
              ? "bg-yellow-600 text-white"
              : connectionState === "error"
              ? "bg-red-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
          onClick={onConnectionTest}
        >
          {t(`common.connectionState.${connectionState}`)}
        </button>
      </div>

      {/* Title */}
      <h1 className="text-6xl font-bold text-white mb-16 tracking-wider">
        {t('home.title')}
      </h1>

      {/* Game Modes */}
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <Link
          href="/01"
          data-testid="game-card-01"
          className="group relative w-full h-32 text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 rounded-2xl text-6xl font-bold flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50"
        >
          <span className="relative z-10">{t('home.modes.01')}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        </Link>

        <Link
          href="/cricket"
          data-testid="game-card-cricket"
          className="group relative w-full h-32 text-white bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-500 hover:via-green-600 hover:to-green-700 rounded-2xl text-6xl font-bold flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-500/50"
        >
          <span className="relative z-10">{t('home.modes.cricket')}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        </Link>
      </div>
    </main>
  );
}
