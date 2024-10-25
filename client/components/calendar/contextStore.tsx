import { createContext } from "react";

export interface ReloadContextType {
  reloadEvents: boolean;
  setReloadEvents: (value: boolean) => void;
}

export const reloadContext = createContext<ReloadContextType | undefined>(undefined);

export const mobileContext = createContext({});
