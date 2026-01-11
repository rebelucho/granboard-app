import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faBullseye, faChartBar, faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { BullSplitMode } from "@/services/targetbull";

interface LegendDialogProps {
  show: boolean;
  bullSplitMode: BullSplitMode;
  onClose: () => void;
}

export function LegendDialog({ show, bullSplitMode, onClose }: LegendDialogProps) {
  const t = useTranslations();

  if (!show) return null;

  const isSplit = bullSplitMode === BullSplitMode.Split;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div data-testid="legend-dialog" className="bg-theme-card rounded-2xl border-2 border-theme-card max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 md:p-6 pb-3 border-b border-theme-card">
          <h3 className="font-bold text-theme-primary text-xl md:text-2xl">{t('targetBull.legend.title')}</h3>
          <button
            data-testid="legend-close-button"
            onClick={onClose}
            className="text-theme-muted hover:text-theme-primary text-2xl font-bold px-3 py-1 hover:bg-theme-secondary rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 md:p-6 pt-4">
          <div className="space-y-3 md:space-y-4">
            <div className="p-3 md:p-4 bg-theme-elevated-alpha rounded-xl border border-yellow-500/30">
              <p className="text-sm md:text-base text-yellow-500 font-bold mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faBullseye} /> {t('targetBull.legend.objectiveTitle')}
              </p>
              <p className="text-xs md:text-sm text-theme-tertiary">
                {t('targetBull.legend.objectiveDesc')}
              </p>
            </div>

            <div className="p-3 md:p-4 bg-theme-elevated-alpha rounded-xl border border-yellow-500/30">
              <p className="text-sm md:text-base text-yellow-500 font-bold mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faCrosshairs} /> {t('targetBull.legend.scoringTitle')}
              </p>
              <div className="text-xs md:text-sm text-theme-tertiary space-y-2">
                <p>
                  <strong>{t('targetBull.legend.scoringSplitMode')}:</strong> {isSplit ? t('targetBull.legend.scoringSplitDesc') : t('targetBull.legend.scoringUnifiedDesc')}
                </p>
                <ul className="list-disc pl-4">
                  <li>
                    <strong>25</strong> – {isSplit ? t('targetBull.legend.points25Split') : t('targetBull.legend.points25Unified')}
                  </li>
                  <li>
                    <strong>Bull (Single Bull)</strong> – {t('targetBull.legend.pointsBull')}
                  </li>
                  <li>
                    <strong>Double Bull</strong> – {t('targetBull.legend.pointsDoubleBull')}
                  </li>
                </ul>
                <p className="mt-2">
                  {t('targetBull.legend.otherSections')}
                </p>
              </div>
            </div>

            <div className="p-3 md:p-4 bg-theme-elevated-alpha rounded-xl border border-yellow-500/30">
              <p className="text-sm md:text-base text-yellow-500 font-bold mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartBar} /> {t('targetBull.legend.ppdTitle')}
              </p>
              <p className="text-xs md:text-sm text-theme-tertiary">
                {t('targetBull.legend.ppdDesc')}
              </p>
            </div>

            <div className="p-3 md:p-4 bg-theme-elevated-alpha rounded-xl border border-yellow-500/30">
              <p className="text-sm md:text-base text-yellow-500 font-bold mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartBar} /> {t('targetBull.legend.pprTitle')}
              </p>
              <p className="text-xs md:text-sm text-theme-tertiary">
                {t('targetBull.legend.pprDesc')}
              </p>
            </div>

            <div className="p-3 md:p-4 bg-theme-elevated-alpha rounded-xl border border-yellow-500/30">
              <p className="text-sm md:text-base text-yellow-500 font-bold mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartBar} /> {t('targetBull.legend.accuracyTitle')}
              </p>
              <p className="text-xs md:text-sm text-theme-tertiary">
                {t('targetBull.legend.accuracyDesc')}
              </p>
            </div>

            <div className="p-3 md:p-4 bg-theme-elevated-alpha rounded-xl border border-yellow-500/30">
              <p className="text-sm md:text-base text-yellow-500 font-bold mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faBullseye} /> {t('targetBull.legend.winConditionsTitle')}
              </p>
              <p className="text-xs md:text-sm text-theme-tertiary">
                {t('targetBull.legend.winConditionsDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 pt-3 border-t border-theme-card">
          <button
            onClick={onClose}
            className="w-full px-4 md:px-6 py-2 md:py-3 bg-yellow-600 text-white rounded-xl hover:opacity-90 font-bold text-sm md:text-base transition-all shadow-lg"
          >
            {t('targetBull.legend.close')}
          </button>
        </div>
      </div>
    </div>
  );
}