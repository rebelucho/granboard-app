import { useState, useEffect } from "react";
import { Segment } from "@/services/boardinfo";
import { Player } from "@/services/cricket";

export type PlayerTurn = {
  round: number;
  hits: Segment[];
};

export type PlayerTurnHistory = {
  [playerId: string]: PlayerTurn[];
};

export function usePlayerTurnHistory() {
  const [turnHistory, setTurnHistory] = useState<PlayerTurnHistory>({});

  const addTurn = (player: Player, round: number, hits: Segment[]) => {
    if (hits.length === 0) return;

    setTurnHistory((prev) => {
      const playerTurns = prev[player.id] || [];

      // Vérifier si ce round n'est pas déjà enregistré pour éviter les doublons
      const roundExists = playerTurns.some(turn => turn.round === round);
      if (roundExists) {
        console.log(`⚠️ Round ${round} already recorded for player ${player.name}`);
        return prev;
      }

      return {
        ...prev,
        [player.id]: [
          ...playerTurns,
          { round, hits },
        ],
      };
    });
  };

  const clearHistory = () => {
    setTurnHistory({});
  };

  const getPlayerHistory = (playerId: string): PlayerTurn[] => {
    return turnHistory[playerId] || [];
  };

  return {
    turnHistory,
    addTurn,
    clearHistory,
    getPlayerHistory,
  };
}
