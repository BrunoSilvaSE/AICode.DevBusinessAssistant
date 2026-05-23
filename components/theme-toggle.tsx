"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className="flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-md hover:bg-accent transition-colors overflow-hidden"
    >
      <span
        className="transition-all duration-300"
        style={{
          transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.8)",
          opacity: isDark ? 1 : 0,
          position: "absolute",
        }}
      >
        <Sun className="h-4 w-4" />
      </span>
      <span
        className="transition-all duration-300"
        style={{
          transform: isDark ? "rotate(-90deg) scale(0.8)" : "rotate(0deg) scale(1)",
          opacity: isDark ? 0 : 1,
          position: "absolute",
        }}
      >
        <Moon className="h-4 w-4" />
      </span>
    </button>
  );
}
