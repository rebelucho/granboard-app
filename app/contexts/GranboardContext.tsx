"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { Granboard } from "@/services/granboard";
import { Segment } from "@/services/boardinfo";

type ConnectionState = "waiting" | "connecting" | "connected" | "error";

interface GranboardContextType {
  // Instance of the connected board
  granboard: Granboard | null;
  // Current connection state
  connectionState: ConnectionState;
  // Function to manually connect (shows browser pairing dialog)
  connectToBoard: () => Promise<Granboard>;
  // Function to disconnect
  disconnect: () => void;
  // Function to attempt auto-reconnection
  tryAutoConnect: () => Promise<void>;
}

const GranboardContext = createContext<GranboardContextType | undefined>(undefined);

export function GranboardProvider({ children }: { children: ReactNode }) {
  const [granboard, setGranboard] = useState<Granboard | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("waiting");

  // No longer need to manage segmentHitCallback here, it's handled by useGranboardConnection

  const tryAutoConnect = useCallback(async () => {
    setConnectionState("connecting");
    const board = await Granboard.TryAutoConnect();
    if (board) {
      setGranboard(board);
      setConnectionState("connected");
      // segmentHitCallback will be assigned by useGranboardConnection when needed
    } else {
      setConnectionState("waiting");
    }
  }, []);

  const connectToBoard = useCallback(async (): Promise<Granboard> => {
    setConnectionState("connecting");
    try {
      const board = await Granboard.ConnectToBoard();
      setGranboard(board);
      setConnectionState("connected");
      // segmentHitCallback will be assigned by useGranboardConnection when needed
      return board;
    } catch (error) {
      console.error(error);
      setConnectionState("error");
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    // Currently there's no explicit disconnect method on Granboard class
    // We'll just clear the reference and state
    setGranboard(null);
    setConnectionState("waiting");
  }, []);

  // Try auto-connect on mount (only once)
  useEffect(() => {
    tryAutoConnect();
  }, [tryAutoConnect]);

  return (
    <GranboardContext.Provider
      value={{
        granboard,
        connectionState,
        connectToBoard,
        disconnect,
        tryAutoConnect,
      }}
    >
      {children}
    </GranboardContext.Provider>
  );
}

export function useGranboard() {
  const context = useContext(GranboardContext);
  if (!context) {
    throw new Error("useGranboard must be used within a GranboardProvider");
  }
  return context;
}