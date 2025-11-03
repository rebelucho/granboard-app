import { useTranslations } from "next-intl";
import { CricketGameMode } from "@/services/cricket";

type ConnectionState = "déconnecté" | "connexion" | "connecté" | "erreur";

interface GameHeaderProps {
  gameMode: CricketGameMode;
  connectionState: ConnectionState;
  onConnect: () => void;
  onShowLegend?: () => void;
  onShowSettings?: () => void;
}

export function GameHeader({
  gameMode,
  connectionState,
  onConnect,
  onShowLegend,
  onShowSettings,
}: GameHeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-wider">
          CRICKET
          {gameMode === CricketGameMode.CutThroat ? (
            <span className="text-red-400 font-semibold text-base ml-3">
              {t('cricket.gameMode.cutThroat.title')}
            </span>
          ) : (
            <span className="text-blue-400 font-semibold text-base ml-3">
              {t('cricket.gameMode.standard.title')}
            </span>
          )}
        </h1>
      </div>
      <div className="flex gap-3">
        {onShowLegend && (
          <button
            onClick={onShowLegend}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm font-medium transition-all shadow-lg"
            title={t('cricket.game.showLegend')}
          >
            📖 {t('cricket.game.legend')}
          </button>
        )}
        {onShowSettings && (
          <button
            onClick={onShowSettings}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm font-medium transition-all shadow-lg"
            title={t('cricket.game.settings')}
          >
            ⚙️ {t('cricket.game.settings')}
          </button>
        )}
        {connectionState === "connecté" ? (
          <div className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm shadow-lg">
            ✓ {t('cricket.game.connected')}
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={connectionState === "connexion"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm font-medium disabled:bg-slate-700 transition-all shadow-lg"
          >
            {connectionState === "connexion"
              ? t('cricket.game.connecting')
              : connectionState === "erreur"
              ? t('cricket.game.errorRetry')
              : t('cricket.game.connectGranboard')}
          </button>
        )}
      </div>
    </div>
  );
}
