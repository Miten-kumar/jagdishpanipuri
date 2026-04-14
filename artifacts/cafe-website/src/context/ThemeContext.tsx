import { createContext, useContext, useEffect, useState } from "react";
import { useGetTheme } from "@workspace/api-client-react";

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  refetch: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: "25 90% 55%",
  secondaryColor: "35 80% 93%",
  accentColor: "15 80% 50%",
  fontFamily: "Inter",
  refetch: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: theme, refetch } = useGetTheme();

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty("--primary", theme.primaryColor);
    root.style.setProperty("--secondary", theme.secondaryColor);
    root.style.setProperty("--accent", theme.accentColor);
    root.style.setProperty("--sidebar-primary", theme.primaryColor);
    const fontFamily = theme.fontFamily || "Inter";
    root.style.setProperty("--app-font-sans", `'${fontFamily}', sans-serif`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{
      primaryColor: theme?.primaryColor ?? "25 90% 55%",
      secondaryColor: theme?.secondaryColor ?? "35 80% 93%",
      accentColor: theme?.accentColor ?? "15 80% 50%",
      fontFamily: theme?.fontFamily ?? "Inter",
      refetch,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
