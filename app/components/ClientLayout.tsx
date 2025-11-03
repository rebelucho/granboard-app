"use client";

import { ReactNode } from "react";
import { SettingsProvider } from "@/app/contexts/SettingsContext";
import { GlobalSettingsDialog } from "./GlobalSettingsDialog";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      {children}
      <GlobalSettingsDialog />
    </SettingsProvider>
  );
}
