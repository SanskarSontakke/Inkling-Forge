"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  grainEnabled: boolean;
  setGrainEnabled: (enabled: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentChapter: string;
  setCurrentChapter: (chapter: string) => void;
  isChapterLoading: boolean;
  simulateChapterLoad: (chapter: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/** Instantly apply theme class to <html> without waiting for React to re-render */
function applyThemeClass(theme: Theme) {
  const root = window.document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [grainEnabled, setGrainEnabledState] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentChapter, setCurrentChapter] = useState<string>("CHAPTER 42");
  const [isChapterLoading, setIsChapterLoading] = useState<boolean>(false);

  // Load initial settings from localStorage synchronously on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("comic-blast-theme") as Theme | null;
    const savedGrain = localStorage.getItem("comic-blast-grain");

    if (savedTheme === "dark" || savedTheme === "light") {
      setThemeState(savedTheme);
      applyThemeClass(savedTheme);
    } else {
      // Apply default light theme class immediately
      applyThemeClass("light");
    }

    if (savedGrain !== null) {
      setGrainEnabledState(savedGrain === "true");
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    // Apply class instantly — don't wait for React state to propagate
    applyThemeClass(newTheme);
    setThemeState(newTheme);
    localStorage.setItem("comic-blast-theme", newTheme);
  };

  const setGrainEnabled = (enabled: boolean) => {
    setGrainEnabledState(enabled);
    localStorage.setItem("comic-blast-grain", String(enabled));
  };

  const simulateChapterLoad = (chapter: string) => {
    setIsChapterLoading(true);
    setCurrentChapter(chapter);
    setTimeout(() => {
      setIsChapterLoading(false);
    }, 1200);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        grainEnabled,
        setGrainEnabled,
        searchQuery,
        setSearchQuery,
        currentChapter,
        setCurrentChapter: simulateChapterLoad,
        isChapterLoading,
        simulateChapterLoad,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
