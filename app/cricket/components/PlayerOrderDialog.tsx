"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Player } from "@/services/cricket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDice,
  faBullseye,
  faPencil,
  faClipboardList,
  faCheck,
  faXmark,
  faArrowLeft,
  faArrowUp,
  faArrowDown
} from "@fortawesome/free-solid-svg-icons";

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
  const t = useTranslations();
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
              {t('cricket.playerOrder.dialog.manualTitle')}
            </h2>
            <button
              onClick={() => setShowManualOrder(false)}
              className="text-slate-400 hover:text-white text-2xl"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-900/30 rounded-xl border border-blue-500/50">
            <p className="text-sm text-blue-300">
              {t('cricket.playerOrder.dialog.manualSubtitle')}
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
                    <FontAwesomeIcon icon={faArrowUp} />
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
                    <FontAwesomeIcon icon={faArrowDown} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleValidateManualOrder}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-500 hover:to-green-600 transition-all font-bold text-xl shadow-lg flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faCheck} /> {t('cricket.playerOrder.dialog.confirm')}
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
            {t('cricket.playerOrder.dialog.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-900/30 rounded-xl border border-blue-500/50">
          <p className="text-sm text-blue-300">
            {t('cricket.playerOrder.dialog.subtitle')}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <button
            data-testid="order-random-button"
            onClick={() => {
              const shuffled = [...players].sort(() => Math.random() - 0.5);
              onOrderSet(shuffled);
            }}
            className="w-full p-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg text-left"
          >
            <div className="flex items-center gap-4">
              <FontAwesomeIcon icon={faDice} className="text-4xl w-12 h-12" />
              <div>
                <div className="text-xl font-bold">{t('cricket.playerOrder.dialog.randomOrder')}</div>
                <div className="text-sm text-purple-200">
                  {t('cricket.playerOrder.dialog.randomOrderDesc')}
                </div>
              </div>
            </div>
          </button>

          <button
            data-testid="order-throw-button"
            onClick={() => {
              onThrowForOrder();
              onClose();
            }}
            className="w-full p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg text-left"
          >
            <div className="flex items-center gap-4">
              <FontAwesomeIcon icon={faBullseye} className="text-4xl w-12 h-12" />
              <div>
                <div className="text-xl font-bold">{t('cricket.playerOrder.dialog.throwForOrder')}</div>
                <div className="text-sm text-blue-200">
                  {t('cricket.playerOrder.dialog.throwForOrderDesc')}
                </div>
              </div>
            </div>
          </button>

          <button
            data-testid="order-manual-button"
            onClick={() => setShowManualOrder(true)}
            className="w-full p-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-500 hover:to-green-600 transition-all shadow-lg text-left"
          >
            <div className="flex items-center gap-4">
              <FontAwesomeIcon icon={faPencil} className="text-4xl w-12 h-12" />
              <div>
                <div className="text-xl font-bold">{t('cricket.playerOrder.dialog.manualOrder')}</div>
                <div className="text-sm text-green-200">
                  {t('cricket.playerOrder.dialog.manualOrderDesc')}
                </div>
              </div>
            </div>
          </button>

          <button
            data-testid="order-current-button"
            onClick={() => {
              onOrderSet(players);
              onClose();
            }}
            className="w-full p-6 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all shadow-lg text-left border-2 border-slate-600"
          >
            <div className="flex items-center gap-4">
              <FontAwesomeIcon icon={faClipboardList} className="text-4xl w-12 h-12" />
              <div>
                <div className="text-xl font-bold">{t('cricket.playerOrder.dialog.currentOrder')}</div>
                <div className="text-sm text-slate-300">
                  {t('cricket.playerOrder.dialog.currentOrderDesc')}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
