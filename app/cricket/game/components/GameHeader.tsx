import { useTranslations } from "next-intl";
import { CricketGameMode } from "@/services/cricket";
import { ZeroOneMode } from "@/services/zeroone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faGear, faCheck } from "@fortawesome/free-solid-svg-icons";

type ConnectionState = "waiting" | "connecting" | "connected" | "error";

interface GameHeaderProps {
  gameMode: CricketGameMode | ZeroOneMode | string;
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

  // Determine if it's a ZeroOne mode
  const isZeroOneMode = typeof gameMode === 'number' && (gameMode === 301 || gameMode === 501 || gameMode === 701);
  const isStringMode = typeof gameMode === 'string';

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-theme-primary tracking-wider">
          {isZeroOneMode ? (
            <>
              01
              <span className="text-accent font-semibold text-base ml-3">
                {gameMode}
              </span>
            </>
          ) : isStringMode ? (
            <>{gameMode}</>
          ) : (
            <>
              CRICKET
              {gameMode === CricketGameMode.CutThroat ? (
                <span className="text-red-400 font-semibold text-base ml-3">
                  {t('cricket.gameMode.cutThroat.title')}
                </span>
              ) : (
                <span className="text-accent font-semibold text-base ml-3">
                  {t('cricket.gameMode.standard.title')}
                </span>
              )}
            </>
          )}
        </h1>
      </div>
      <div className="flex gap-3">
        {onShowLegend && (
          <button
            data-testid="legend-button"
            onClick={onShowLegend}
            className="px-4 py-2 bg-theme-interactive text-theme-interactive bg-theme-interactive-hover rounded-lg text-sm font-medium transition-all shadow-lg flex items-center gap-2"
            title={t('cricket.game.showLegend')}
          >
            <FontAwesomeIcon icon={faBook} /> {t('cricket.game.legend')}
          </button>
        )}
        {onShowSettings && (
          <button
            data-testid="settings-button"
            onClick={onShowSettings}
            className="px-4 py-2 bg-theme-interactive text-theme-interactive bg-theme-interactive-hover rounded-lg text-sm font-medium transition-all shadow-lg flex items-center gap-2"
            title={t('cricket.game.settings')}
          >
            <FontAwesomeIcon icon={faGear} /> {t('cricket.game.settings')}
          </button>
        )}
        {connectionState === "connected" ? (
          <div data-testid="connection-status" className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm shadow-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faCheck} /> {t('cricket.game.connected')}
          </div>
        ) : (
          <button
            data-testid="connect-button"
            onClick={onConnect}
            disabled={connectionState === "connecting"}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 text-sm font-medium disabled:bg-theme-interactive transition-all shadow-lg"
          >
            {connectionState === "connecting"
              ? t('cricket.game.connecting')
              : connectionState === "error"
              ? t('cricket.game.errorRetry')
              : t('cricket.game.connectGranboard')}
          </button>
        )}
      </div>
    </div>
  );
}
