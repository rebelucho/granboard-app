import { useState, useEffect } from "react";
import { Granboard } from "@/services/granboard";
import { Segment } from "@/services/boardinfo";

type ConnectionState = "déconnecté" | "connexion" | "connecté" | "erreur";

export function useGranboardConnection(
  onSegmentHit?: (segment: Segment) => void
) {
  const [granboard, setGranboard] = useState<Granboard | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("déconnecté");

  // Try to auto-connect on mount
  useEffect(() => {
    const tryAutoConnect = async () => {
      setConnectionState("connexion");
      const board = await Granboard.TryAutoConnect();
      if (board) {
        setGranboard(board);
        setConnectionState("connecté");
      } else {
        setConnectionState("déconnecté");
      }
    };

    tryAutoConnect();
  }, []); // Empty deps - only run on mount

  // Update granboard callback when onSegmentHit changes
  useEffect(() => {
    if (granboard && onSegmentHit) {
      /* eslint-disable react-hooks/immutability */
      granboard.segmentHitCallback = onSegmentHit;
      /* eslint-enable react-hooks/immutability */
    }
  }, [granboard, onSegmentHit]);

  const connectToBoard = async () => {
    setConnectionState("connexion");
    try {
      const board = await Granboard.ConnectToBoard();
      if (onSegmentHit) {
        board.segmentHitCallback = onSegmentHit;
      }
      setGranboard(board);
      setConnectionState("connecté");
    } catch (error) {
      console.error(error);
      setConnectionState("erreur");
    }
  };

  const setLEDs = async (segments: number[]) => {
    if (granboard) {
      await granboard.setLEDs(segments);
    }
  };

  const clearLEDs = async () => {
    if (granboard) {
      await granboard.clearLEDs();
    }
  };

  return {
    granboard,
    connectionState,
    connectToBoard,
    isConnected: connectionState === "connecté",
    setLEDs,
    clearLEDs,
  };
}
