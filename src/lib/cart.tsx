"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

export type CartItem = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  shade: string;
  color?: string; // selected colour name
  qty: number;
};

type State = { items: CartItem[] };

type Action =
  | { type: "add"; item: Omit<CartItem, "qty">; qty?: number }
  | { type: "remove"; slug: string }
  | { type: "qty"; slug: string; qty: number }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { items: action.items };
    case "add": {
      const existing = state.items.find((i) => i.slug === action.item.slug);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.slug === action.item.slug
              ? { ...i, qty: i.qty + (action.qty ?? 1) }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { ...action.item, qty: action.qty ?? 1 }],
      };
    }
    case "remove":
      return { items: state.items.filter((i) => i.slug !== action.slug) };
    case "qty":
      return {
        items: state.items.map((i) =>
          i.slug === action.slug ? { ...i, qty: Math.max(1, action.qty) } : i
        ),
      };
    case "clear":
      return { items: [] };
    default:
      return state;
  }
}

type CartContext = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartContext | null>(null);
const KEY = "makeupgirls_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "hydrate", items: JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state.items));
  }, [state.items, ready]);

  const value = useMemo<CartContext>(() => {
    const count = state.items.reduce((n, i) => n + i.qty, 0);
    const subtotal = state.items.reduce((n, i) => n + i.qty * i.price, 0);
    return {
      items: state.items,
      count,
      subtotal,
      add: (item, qty) => {
        dispatch({ type: "add", item, qty });
        setOpen(true);
      },
      remove: (slug) => dispatch({ type: "remove", slug }),
      setQty: (slug, qty) => dispatch({ type: "qty", slug, qty }),
      clear: () => dispatch({ type: "clear" }),
      open,
      setOpen,
    };
  }, [state.items, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
