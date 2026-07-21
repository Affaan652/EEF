"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "eef-admin-theme";

// Scoped to the admin console only: the attribute lives on <body>, and
// every themed rule is written as `body[data-admin-theme="dark"] .shell`,
// so this never affects the public site or auth pages even though they
// share the same <html>/<body> across client-side navigation.
function applyTheme(theme: Theme) {
  document.body.setAttribute("data-admin-theme", theme);
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setTheme(stored === "dark" ? "dark" : "light");
    setReady(true);
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  if (!ready) return null;

  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      <button
        type="button"
        className="theme-toggle-option"
        aria-pressed={theme === "light"}
        onClick={() => choose("light")}
      >
        Light
      </button>
      <button
        type="button"
        className="theme-toggle-option"
        aria-pressed={theme === "dark"}
        onClick={() => choose("dark")}
      >
        Dark
      </button>
    </div>
  );
}
