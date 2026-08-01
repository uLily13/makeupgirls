"use client";

import {
  createContext,
  useContext,
  useOptimistic,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/(store)/account/actions";

type Ctx = {
  loggedIn: boolean;
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  count: number;
};

const FavCtx = createContext<Ctx | null>(null);

export function FavoritesProvider({
  initial,
  loggedIn,
  children,
}: {
  initial: string[];
  loggedIn: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [favs, setFavs] = useOptimistic(
    initial,
    (state: string[], slug: string) =>
      state.includes(slug)
        ? state.filter((s) => s !== slug)
        : [...state, slug]
  );

  const toggle = (slug: string) => {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      setFavs(slug);
      await toggleFavorite(slug);
      router.refresh();
    });
  };

  return (
    <FavCtx.Provider
      value={{
        loggedIn,
        has: (slug) => favs.includes(slug),
        toggle,
        count: favs.length,
      }}
    >
      {children}
    </FavCtx.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavCtx);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
