"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Player } from "@/services/cricket";
import { Segment, SegmentID } from "@/services/boardinfo";
import { Granboard } from "@/services/granboard";

interface PlayerOrderModalProps {
  players: Player[];
  granboard: Granboard;
  onOrderDetermined: (orderedPlayers: Player[]) => void;
  onClose: () => void;
}

interface PlayerThrow {
  player: Player;
  segment: Segment | null;
  score: number;
}

export function PlayerOrderModal({
  players,
  granboard,
  onOrderDetermined,
  onClose,
}: PlayerOrderModalProps) {
  const t = useTranslations();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [throws, setThrows] = useState<PlayerThrow[]>(
    players.map((p) => ({ player: p, segment: null, score: 0 }))
  );

  // Calculate score - use the actual dart score
  // Highest score starts first
  const calculateScore = (segment: Segment): number => {
    return segment.Value;
  };

  // Update callback when currentPlayerIndex changes
  useEffect(() => {
    /* eslint-disable react-hooks/immutability */
    granboard.segmentHitCallback = (segment: Segment) => {
      /* eslint-enable react-hooks/immutability */
      // Ignore reset button
      if (segment.ID === SegmentID.RESET_BUTTON) return;

      const score = calculateScore(segment);
      setThrows((prev) => {
        const newThrows = [...prev];
        newThrows[currentPlayerIndex] = {
          ...newThrows[currentPlayerIndex],
          segment,
          score,
        };
        return newThrows;
      });

      // Move to next player after a short delay (if not last player)
      if (currentPlayerIndex < throws.length - 1) {
        setTimeout(() => {
          setCurrentPlayerIndex((prev) => prev + 1);
        }, 1500);
      }
    };
  }, [granboard, currentPlayerIndex, throws.length]);

  const handleFinish = () => {
    // Sort players by score (highest first)
    const sortedThrows = [...throws].sort((a, b) => b.score - a.score);
    const orderedPlayers = sortedThrows.map((t) => t.player);
    onOrderDetermined(orderedPlayers);
  };

  const handleReset = () => {
    // Reset all throws to start over
    setThrows(players.map((p) => ({ player: p, segment: null, score: 0 })));
    setCurrentPlayerIndex(0);
  };

  const allPlayersThrew = throws.every((t) => t.segment !== null);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 border-2 border-green-500 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">
            {t('cricket.playerOrder.modal.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-900/30 rounded-xl border border-blue-500/50">
          <p className="text-sm text-blue-300">
            {t('cricket.playerOrder.modal.subtitle')}
          </p>
        </div>

        {!allPlayersThrew && (
          <div className="mb-6 p-6 bg-green-900/30 rounded-xl border-2 border-green-500">
            <p className="text-2xl font-bold text-green-400 text-center">
              {t('cricket.playerOrder.modal.currentTurn', { player: throws[currentPlayerIndex].player.name })}
            </p>
            <p className="text-center text-slate-300 mt-2">
              {t('cricket.playerOrder.modal.throwDart')}
            </p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {throws.map((throwData, index) => (
            <div
              key={throwData.player.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                index === currentPlayerIndex && !allPlayersThrew
                  ? "border-green-500 bg-green-900/20"
                  : throwData.segment
                  ? "border-slate-600 bg-slate-700/50"
                  : "border-slate-700 bg-slate-900/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 flex items-center justify-center text-xl font-bold text-green-400 bg-slate-800 rounded-full">
                    {index + 1}
                  </span>
                  <span className="text-xl font-medium text-white">
                    {throwData.player.name}
                  </span>
                </div>
                <div className="text-right">
                  {throwData.segment ? (
                    <>
                      <div className="text-2xl font-bold text-green-400">
                        {throwData.segment.ShortName}
                      </div>
                      <div className="text-sm text-slate-400">
                        {t('cricket.playerOrder.modal.score')}: {throwData.score}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500">{t('cricket.playerOrder.modal.waiting')}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {allPlayersThrew && (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-500 hover:to-orange-600 transition-all font-bold text-xl shadow-lg"
            >
              🔄 {t('cricket.playerOrder.modal.retry')}
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-500 hover:to-green-600 transition-all font-bold text-xl shadow-lg"
            >
              ✓ {t('cricket.playerOrder.modal.confirm')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
