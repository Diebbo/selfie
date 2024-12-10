"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface ReloadContextType {
  reloadEvents: boolean;
  setReloadEvents: (value: boolean) => void;
}

export const ReloadContext = createContext<ReloadContextType | undefined>(undefined);

export function ReloadProvider({ children }: { children: ReactNode }) {
  const [reloadEvents, setReloadEvents] = useState(false);

  return (
    <ReloadContext.Provider value={{ reloadEvents, setReloadEvents }}>
      {children}
    </ReloadContext.Provider>
  );
}

export function useReload() {
  const context = useContext(ReloadContext);
  if (context === undefined) {
    throw new Error('useReload must be used within a ReloadProvider');
  }
  return context;
}

export const mobileContext = createContext({});
