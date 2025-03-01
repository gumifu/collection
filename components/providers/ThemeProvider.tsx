"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      // 現在のテーマを取得（ローカルストレージではなく現在のstateから取得）
      const currentTheme = theme === "light" ? "dark" : "light";

      // 適切なアニメーションクラスを適用
      if (theme === "dark") {
        // ライト→ダーク（オレンジ経由）
        document.body.classList.remove("animate-to-light");
        document.body.classList.add("animate-to-dark");

        // アニメーション終了後にクラスを削除
        setTimeout(() => {
          document.body.classList.remove("animate-to-dark");
        }, 500);
      } else {
        // ダーク→ライト
        document.body.classList.remove("animate-to-dark");
        document.body.classList.add("animate-to-light");

        // アニメーション終了後にクラスを削除
        setTimeout(() => {
          document.body.classList.remove("animate-to-light");
        }, 500);
      }

      // テーマを保存して適用
      localStorage.setItem("theme", theme);
      setTheme(theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
