"use client";

import React, {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

// Interfaccia per la gestione del tempo nel sito
interface TimeContextType {
  currentTime: Date;
  setCurrentTime: Dispatch<SetStateAction<Date>>;
}

// Creazione del contesto per la gestione del tempo
const TimeContext = createContext<TimeContextType | undefined>(undefined);

export function TimeProvider({
  children,
  initialTime,
}: {
  children: React.ReactNode;
  initialTime: Date;
}) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date(initialTime));

  return (
    <TimeContext.Provider value={{ currentTime, setCurrentTime }}>
      {children}
    </TimeContext.Provider>
  );
}

export function useTime() {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error("useTime must be used within a TimeProvider");
  }
  return context;
}
