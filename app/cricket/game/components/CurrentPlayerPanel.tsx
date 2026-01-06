import { useTranslations } from "next-intl";
import { Segment } from "@/services/boardinfo";
import { PlayerState as PlayerCricketState } from "@/services/cricket";
import { PlayerState as PlayerZeroOneState } from "@/services/zeroone";
import { PlayerTargetBullState } from "@/services/targetbull";

type PlayerState = PlayerCricketState | PlayerZeroOneState | PlayerTargetBullState;

interface CurrentPlayerPanelProps {
  currentPlayer: PlayerState;
  dartsThrown: number;
  currentRound: number;
  maxRounds: number;
  currentTurnHits: Segment[];
  hasHistory: boolean;
  onUndo: () => void;
  onNextPlayer: () => void;
}

export function CurrentPlayerPanel({
  currentPlayer,
  dartsThrown,
  currentRound,
  maxRounds,
  currentTurnHits,
  hasHistory,
  onUndo,
  onNextPlayer,
}: CurrentPlayerPanelProps) {
  const t = useTranslations();

  return (
    <div className="bg-theme-elevated-alpha backdrop-blur-sm rounded-xl shadow-2xl p-4 border border-theme-card">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-theme-primary mb-1">
            <span className="text-accent">{currentPlayer.player.name}</span>
          </h2>
          <div className="flex gap-3 text-theme-tertiary text-sm">
            <p data-testid="dart-counter">
              {t('cricket.game.dart')} <span className="font-bold text-theme-primary">{dartsThrown}</span> / 3
            </p>
            <span>•</span>
            <p data-testid="round-counter">
              {t('cricket.game.round')} <span className="font-bold text-theme-primary">{currentRound}</span>
              {maxRounds > 0 && <> / {maxRounds}</>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-testid="undo-button"
            onClick={onUndo}
            disabled={!hasHistory}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${
              !hasHistory
                ? "bg-theme-interactive text-theme-muted cursor-not-allowed"
                : "bg-orange-600 text-white hover:bg-orange-500 hover:scale-105"
            }`}
            title={t('cricket.game.undoLastMove')}
          >
            ↶ {t('cricket.game.undo')}
          </button>
          <button
            data-testid="next-player-button"
            onClick={onNextPlayer}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg bg-red-600 text-white hover:bg-red-500 hover:scale-105"
            title={t('cricket.game.nextPlayerTooltip')}
          >
            🔴 {t('cricket.game.nextPlayer')}
          </button>
        </div>
      </div>
    </div>
  );
}
