import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { themeColors, type ThemeMode } from "../styles/variables";
import {
  loadWorkspaceTheme,
  saveWorkspaceTheme,
} from "../utils/workspaceSettings";

export interface ThemeContextType {
  theme: ThemeMode;
  colors: typeof themeColors.light | typeof themeColors.dark;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  loadWorkspaceTheme: (workspacePath: string) => Promise<void>;
  saveWorkspaceTheme: (workspacePath: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

// Default theme detection
const getSystemTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Storage key for global theme preference
const GLOBAL_THEME_STORAGE_KEY = "images-manager-global-theme";

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";

    const stored = localStorage.getItem(GLOBAL_THEME_STORAGE_KEY);
    if (stored && (stored === "light" || stored === "dark")) {
      return stored;
    }

    return getSystemTheme();
  });

  // Update document class and localStorage when theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Add current theme class
    root.classList.add(theme);

    // Debug logging
    console.log("Theme changed to:", theme);
    console.log("Document classes:", root.className);

    // Store global preference
    localStorage.setItem(GLOBAL_THEME_STORAGE_KEY, theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark"
          ? themeColors.dark.background.primary
          : themeColors.light.background.primary
      );
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't set a preference
      const stored = localStorage.getItem(GLOBAL_THEME_STORAGE_KEY);
      if (!stored) {
        setThemeState(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setThemeState((current) => (current === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  // Load theme preference for a specific workspace
  const loadWorkspaceThemePreference = async (workspacePath: string) => {
    try {
      const workspaceTheme = await loadWorkspaceTheme(workspacePath);
      if (workspaceTheme) {
        setThemeState(workspaceTheme);
      }
    } catch (error) {
      console.error("Failed to load workspace theme:", error);
    }
  };

  // Save current theme as workspace preference
  const saveWorkspaceThemePreference = async (workspacePath: string) => {
    try {
      await saveWorkspaceTheme(workspacePath, theme);
    } catch (error) {
      console.error("Failed to save workspace theme:", error);
    }
  };

  const colors = themeColors[theme];
  const isDark = theme === "dark";

  const value: ThemeContextType = {
    theme,
    colors,
    toggleTheme,
    setTheme,
    isDark,
    loadWorkspaceTheme: loadWorkspaceThemePreference,
    saveWorkspaceTheme: saveWorkspaceThemePreference,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
