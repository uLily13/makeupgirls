"use client";

import { createContext, useContext } from "react";
import { defaultBadgeSettings, type BadgeSettings } from "./products";

const BadgeSettingsContext = createContext<BadgeSettings>(defaultBadgeSettings);

export function BadgeSettingsProvider({
  value,
  children,
}: {
  value: BadgeSettings;
  children: React.ReactNode;
}) {
  return (
    <BadgeSettingsContext.Provider value={value}>
      {children}
    </BadgeSettingsContext.Provider>
  );
}

export function useBadgeSettings(): BadgeSettings {
  return useContext(BadgeSettingsContext);
}
