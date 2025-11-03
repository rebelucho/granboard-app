"use client";

import { useState } from "react";
import { Player } from "@/services/cricket";

interface PlayerOrderDialogProps {
  players: Player[];
  onOrderSet: (orderedPlayers: Player[]) => void;
  onThrowForOrder: () => void;
  onClose: () => void;
}

export function PlayerOrderDialog({
  players,
  onOrderSet,
  onThrowForOrder,
  onClose,
}: PlayerOrderDialogProps) {
  const [showManualOrder, setShowManualOrder] = useState(false);
  const [manualPlayers, setManualPlayers] = useState<Player[]>([...players]);

  const movePlayer = (index: number, direction: "up" | "down") => {
    const newPlayers = [...manualPlayers];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newPlayers.length) return;

    // Swap players
    [newPlayers[index], newPlayers[targetIndex]] = [
      newPlayers[targetIndex],
      newPlayers[index],
    ];

    setManualPlayers(newPlayers);
  };

  const handleValidateManualOrder = () => {
    onOrderSet(manualPlayers);
  };

  if (showManualOrder) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 border-2 border-green-500 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">
              Définir l&apos;ordre manuellement
            </h2>
            <button
              onClick={() => setShowManualOrder(false)}
              className="text-slate-400 hover:text-white text-2xl"
            >
              ←
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-900/30 rounded-xl border border-blue-500/50">
            <p className="text-sm text-blue-300">
              Utilisez les flèches pour organiser l&apos;ordre des joueurs
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {manualPlayers.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border border-slate-600"
              >
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-green-400 bg-slate-800 rounded-full">
                    {index + 1}
                  </span>
                  <span className="text-xl font-medium text-white">
                    {player.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => movePlayer(index, "up")}
                    disabled={index === 0}
                    className={`px-3 py-2 rounded-lg font-bold transition-all ${
                      index === 0
                        ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => movePlayer(index, "down")}
                    disabled={index === manualPlayers.length - 1}
                    className={`px-3 py-2 rounded-lg font-bold transition-all ${
                      index === manualPlayers.length - 1
                        ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleValidateManualOrder}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-500 hover:to-green-600 transition-all font-bold text-xl shadow-lg"
          >
            ✓ Valider l&apos;ordre
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 border-2 border-green-500 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">
            Choisir l&apos;ordre des joueurs
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
            Comment souhaitez-vous déterminer l&apos;ordre des joueurs ?
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={() => {
              const shuffled = [...players].sort(() => Math.random() - 0.5);
              onOrderSet(shuffled);
            }}
            className="w-full p-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg text-left"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎲</span>
              <div>
                <div className="text-xl font-bold">Ordre aléatoire</div>
                <div className="text-sm text-purple-200">
                  Mélange automatique des joueurs
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onThrowForOrder();
              onClose();
            }}
            className="w-full p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg text-left"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎯</span>
              <div>
                <div className="text-xl font-bold">Lancer pour l&apos;ordre</div>
                <div className="text-sm text-blue-200">
                  Le score le plus élevé commence
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowManualOrder(true)}
            className="w-full p-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-500 hover:to-green-600 transition-all shadow-lg text-left"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">✏️</span>
              <div>
                <div className="text-xl font-bold">Ordre manuel</div>
                <div className="text-sm text-green-200">
                  Définir l&apos;ordre vous-même
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onOrderSet(players);
              onClose();
            }}
            className="w-full p-6 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all shadow-lg text-left border-2 border-slate-600"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">📋</span>
              <div>
                <div className="text-xl font-bold">Ordre actuel</div>
                <div className="text-sm text-slate-300">
                  Conserver l&apos;ordre d&apos;ajout des joueurs
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
