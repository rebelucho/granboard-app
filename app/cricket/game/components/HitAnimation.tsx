import { Segment } from "@/services/boardinfo";
import { useEffect, useState } from "react";

interface HitAnimationProps {
  hit: Segment | null;
  onComplete?: () => void;
}

export function HitAnimation({ hit, onComplete }: HitAnimationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (hit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hit, onComplete]);

  if (!hit || !show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
      {/* Overlay with fade */}
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />

      {/* Hit display */}
      <div className="relative animate-bounce-scale">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-3xl shadow-2xl p-16 border-4 border-cyan-500">
          <div className="text-center">
            <div className="text-9xl font-black text-cyan-400">
              {hit.ShortName}
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl blur-3xl opacity-40 animate-pulse" />
      </div>
    </div>
  );
}
