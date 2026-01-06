import { useGranboard } from "@/app/contexts/GranboardContext";
import { Segment } from "@/services/boardinfo";
import { useEffect } from "react";

type ConnectionState = "waiting" | "connecting" | "connected" | "error";

export function useGranboardConnection(
  onSegmentHit?: (segment: Segment) => void
) {
  const {
    granboard,
    connectionState,
    connectToBoard,
    // setSegmentHitCallback, // no longer needed
  } = useGranboard();

  // Update granboard's segment hit callback directly when onSegmentHit or granboard changes
  useEffect(() => {
    if (granboard) {
      const callback = onSegmentHit ?? undefined;
      console.log('useGranboardConnection: assigning callback to granboard', callback);
      /* eslint-disable react-hooks/immutability */
      granboard.segmentHitCallback = callback;
      /* eslint-enable react-hooks/immutability */
    } else {
      console.log('useGranboardConnection: granboard is null, cannot assign callback');
    }
  }, [granboard, onSegmentHit]);

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
    isConnected: connectionState === "connected",
    setLEDs,
    clearLEDs,
  };
}
