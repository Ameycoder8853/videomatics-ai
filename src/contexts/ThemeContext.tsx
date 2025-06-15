// Using next-themes for robust theme management
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Custom hook to use theme if needed, though next-themes handles most direct usage
import { useTheme as useNextTheme } from "next-themes"

export const useTheme = () => {
  const context = useNextTheme();
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
