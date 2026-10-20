"use client";

import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";
import { getCategory, type Product } from "@/lib/catalog";
import { CategoryIcon } from "./icons";
import { useQuote } from "./quote-provider";

export function ProductCard({ product }: { product: Product }) {
  const { qtyOf, add, setQty, ready } = useQuote();
  const category = getCategory(product.category);
  const qty = ready ? qtyOf(product.id) : 0;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-mist-200 bg-white p-3 transition-shadow hover:shadow-soft sm:p-5">
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-mist-50 to-mist-100">
        {category && <CategoryIcon icon={category.icon} className="size-9 text-navy-800/70 sm:size-12" />}
        {product.audience && (
          <span className="absolute top-2 left-2 hidden rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink-700 sm:top-3 sm:left-3 sm:block">
            {product.audience}
          </span>
        )}
      </div>
      {category && (
        <Link href={`/catalogo/${category.slug}`} className="eyebrow mt-3 !text-[10px] !tracking-[0.12em] text-ink-500 hover:text-navy-800 sm:mt-4 sm:!text-[11px]">
          {category.name}
        </Link>
      )}
      <h3 className="mt-1.5 font-display text-[17px] leading-snug font-semibold text-navy-800 sm:text-[20px]">{product.name}</h3>
      <p className="mt-1 text-[12px] text-ink-500 sm:text-[13px]">{product.spec}</p>

      <div className="mt-auto pt-4">
        {qty > 0 ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-navy-800/20 bg-mist-50 p-1">
            <button
              type="button"
              onClick={() => setQty(product.id, qty - 1)}
              className="grid size-9 place-items-center rounded-lg bg-white sm:size-10 text-navy-800 hover:bg-mist-100"
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
              onClick={() => add(product.id)}
              className="grid size-9 place-items-center rounded-lg bg-white sm:size-10 text-navy-800 hover:bg-mist-100"
              aria-label={`Aumentar quantidade de ${product.name}`}
            >
              <Plus aria-hidden="true" className="size-4" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => add(product.id)} className="btn-primary w-full !min-h-11 !gap-1.5 !px-3 !text-[14px]">
            <Plus aria-hidden="true" className="size-4" />
            Adicionar<span className="hidden sm:inline"> à lista</span>
          </button>
        )}
      </div>
    </article>
  );
}
