import { useTranslations } from "next-intl";
import { Segment } from "@/services/boardinfo";
import { PlayerCricketState } from "@/services/cricket";
import { useEffect, useState } from "react";

interface TurnSummaryProps {
  show: boolean;
  currentPlayer: PlayerCricketState;
  hits: Segment[];
  onComplete: () => void;
}

export function TurnSummary({
  show,
  currentPlayer,
  hits,
  onComplete,
}: TurnSummaryProps) {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 animate-fade-in" />

      {/* Summary card */}
      <div className="relative animate-slide-up">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-3xl shadow-2xl p-10 border-4 border-blue-500 min-w-[500px]">
          {/* Player name */}
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-blue-400 mb-2">
              {currentPlayer.player.name}
            </h2>
            <div className="text-xl text-slate-300">{t('cricket.game.turnCompleted')}</div>
          </div>

          {/* Hits */}
          <div className="flex justify-center gap-4">
            {hits.map((hit, index) => (
              <div
                key={index}
                className="bg-slate-700/80 rounded-xl p-6 min-w-[120px] text-center transform hover:scale-110 transition-transform border border-slate-600"
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="text-5xl font-black text-cyan-400">
                  {hit.ShortName}
                </div>
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: 3 - hits.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-slate-700/30 rounded-xl p-6 min-w-[120px] text-center border-2 border-dashed border-slate-600"
              >
                <div className="text-5xl font-black text-slate-600">-</div>
              </div>
            ))}
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl blur-3xl opacity-30 animate-pulse" />
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
