"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

interface SettingsContextType {
  // Volume settings
  volume: number;
  soundEnabled: boolean;
  setVolume: (volume: number) => void;
  toggleSound: () => void;

  // Dialog state
  isDialogOpen: boolean;
  openDialog: (customContent?: ReactNode) => void;
  closeDialog: () => void;
  customContent?: ReactNode;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [volume, setVolumeState] = useState(0.5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customContent, setCustomContent] = useState<ReactNode | undefined>();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedVolume = localStorage.getItem('granboard_volume');
    const savedSoundEnabled = localStorage.getItem('granboard_sound_enabled');
    const shouldReopenSettings = localStorage.getItem('granboard_reopen_settings');

    if (savedVolume) {
      setVolumeState(parseFloat(savedVolume));
    }
    if (savedSoundEnabled) {
      setSoundEnabled(savedSoundEnabled === 'true');
    }

    // Reopen settings dialog if it was open before language change
    if (shouldReopenSettings === 'true') {
      localStorage.removeItem('granboard_reopen_settings');
      setIsDialogOpen(true);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    localStorage.setItem('granboard_volume', newVolume.toString());
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('granboard_sound_enabled', newValue.toString());
      return newValue;
    });
  }, []);

  const openDialog = useCallback((customContent?: ReactNode) => {
    setCustomContent(customContent);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setCustomContent(undefined);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        volume,
        soundEnabled,
        setVolume,
        toggleSound,
        isDialogOpen,
        openDialog,
        closeDialog,
        customContent,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
