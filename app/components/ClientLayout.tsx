"use client";

import { ReactNode } from "react";
import { SettingsProvider } from "@/app/contexts/SettingsContext";
import { GranboardProvider } from "@/app/contexts/GranboardContext";
import { GlobalSettingsDialog } from "./GlobalSettingsDialog";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <GranboardProvider>
        {children}
        <GlobalSettingsDialog />
      </GranboardProvider>
    </SettingsProvider>
  );
}
