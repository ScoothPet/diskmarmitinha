"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { products } from "@/lib/catalog";

export type QuoteLine = {
  id: string;
  name: string;
  spec: string;
  qty: number;
  custom?: boolean;
};

type QuoteContextValue = {
  lines: QuoteLine[];
  totalUnits: number;
  ready: boolean;
  qtyOf: (id: string) => number;
  add: (id: string, qty?: number) => void;
  addCustom: (name: string, qty: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const QuoteContext = createContext<QuoteContextValue | null>(null);
const STORAGE_KEY = "dm-quote-v1";

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as QuoteLine[];
        if (Array.isArray(parsed)) setLines(parsed.filter((l) => l && l.id && l.qty > 0));
      }
    } catch {
      /* armazenamento indisponível */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* armazenamento indisponível */
    }
  }, [lines, ready]);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const add = useCallback((id: string, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === id);
      if (existing) return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
      const product = products.find((p) => p.id === id);
      if (!product) return prev;
      return [...prev, { id, name: product.name, spec: product.spec, qty }];
    });
  }, []);

  const addCustom = useCallback((name: string, qty: number) => {
    const clean = name.trim();
    if (!clean || qty <= 0) return;
    setLines((prev) => [
      ...prev,
      { id: `custom-${Date.now().toString(36)}`, name: clean, spec: "Item solicitado pelo cliente", qty, custom: true },
    ]);
  }, []);

  const remove = useCallback((id: string) => setLines((prev) => prev.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<QuoteContextValue>(() => {
    const map = new Map(lines.map((l) => [l.id, l.qty]));
    return {
      lines,
      ready,
      totalUnits: lines.reduce((sum, l) => sum + l.qty, 0),
      qtyOf: (id) => map.get(id) ?? 0,
      add,
      addCustom,
      setQty,
      remove,
      clear,
    };
  }, [lines, ready, add, addCustom, setQty, remove, clear]);

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote deve ser usado dentro de QuoteProvider");
  return ctx;
}
