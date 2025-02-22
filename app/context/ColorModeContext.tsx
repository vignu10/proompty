"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorMode } from "@chakra-ui/react";

interface ColorModeContextType {
  toggleColorMode: () => void;
  isDark: boolean;
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isDark, setIsDark] = useState(colorMode === "dark");

  useEffect(() => {
    setIsDark(colorMode === "dark");
  }, [colorMode]);

  return (
    <ColorModeContext.Provider value={{ toggleColorMode, isDark }}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorModeContext() {
  const context = useContext(ColorModeContext);
  if (context === undefined) {
    throw new Error("useColorMode must be used within a ColorModeProvider");
  }
  return context;
}
