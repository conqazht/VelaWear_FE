import * as React from "react";

const LG_BREAKPOINT = 1024;
const LG_QUERY = `(min-width: ${LG_BREAKPOINT}px)`;

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(LG_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(LG_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsLg() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
