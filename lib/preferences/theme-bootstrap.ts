import type { ThemeMode } from "./theme";

/**
 * Applies the validated server-side preference before the admin UI paints.
 * System mode is resolved in the browser because the server cannot know the
 * visitor's preferred color scheme.
 */
export function createThemeBootstrapScript(mode: ThemeMode): string {
  const serializedMode = JSON.stringify(mode);

  return `(()=>{try{const root=document.documentElement;const mode=${serializedMode};const prefersDark=Boolean(window.matchMedia?.("(prefers-color-scheme: dark)")?.matches);const isDark=mode==="dark"||(mode==="system"&&prefersDark);root.setAttribute("data-theme-mode",mode);root.classList.toggle("dark",isDark);root.style.colorScheme=isDark?"dark":"light"}catch{}})();`;
}
