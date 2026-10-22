"use client";

import { Check, Minus, Plus } from "lucide-react";
import type { ProductSummary } from "@/lib/catalog";
import { useQuote } from "./quote-provider";

export function AddToList({ product, size = "md" }: { product: ProductSummary; size?: "md" | "lg" }) {
  const { qtyOf, add, setQty, ready } = useQuote();
  const qty = ready ? qtyOf(product.id) : 0;
  const info = { name: product.name, spec: product.spec, code: product.id };
  const big = size === "lg";

  if (qty > 0) {
    return (
      <div className={`flex items-center justify-between gap-2 rounded-xl border border-navy-800/20 bg-mist-50 p-1 ${big ? "max-w-xs" : ""}`}>
        <button
          type="button"
          onClick={() => setQty(product.id, qty - 1)}
          className={`grid place-items-center rounded-lg bg-white text-navy-800 hover:bg-mist-100 ${big ? "size-12" : "size-9 sm:size-10"}`}
          aria-label={`Diminuir quantidade de ${product.name}`}
        >
          <Minus aria-hidden="true" className="size-4" />
        </button>
        <span className="flex items-center gap-1.5 text-[14px] font-semibold text-navy-800" aria-live="polite">
          <Check aria-hidden="true" className="hidden size-4 text-whats-600 sm:block" />
          {qty}
          <span className="sr-only sm:not-sr-only">na lista</span>
        </span>
        <button
          type="button"
          onClick={() => add(product.id, 1, info)}
          className={`grid place-items-center rounded-lg bg-white text-navy-800 hover:bg-mist-100 ${big ? "size-12" : "size-9 sm:size-10"}`}
          aria-label={`Aumentar quantidade de ${product.name}`}
        >
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => add(product.id, 1, info)}
      className={big ? "btn-primary w-full sm:w-auto" : "btn-primary w-full !min-h-11 !gap-1.5 !px-3 !text-[14px]"}
    >
      <Plus aria-hidden="true" className="size-4" />
      {big ? "Adicionar à lista de orçamento" : (
        <>
          Adicionar<span className="hidden sm:inline"> à lista</span>
        </>
      )}
    </button>
  );
}
