"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Info, Search, X } from "lucide-react";
import { categories, normalize, products } from "@/lib/catalog";
import { ProductCard } from "./product-card";

export function CatalogBrowser({ initialQuery = "", category }: { initialQuery?: string; category?: string }) {
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      const cat = categories.find((c) => c.slug === p.category)?.name ?? "";
      return normalize(`${p.name} ${p.spec} ${cat}`).includes(q);
    });
  }, [query, category]);

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav aria-label="Categorias" className="sticky top-28 rounded-2xl border border-mist-200 bg-white p-3">
          <p className="eyebrow px-3 pt-2 pb-3 text-ink-500">Categorias</p>
          <ul className="grid gap-0.5">
            <li>
              <Link
                href="/catalogo"
                className={`block rounded-lg px-3 py-2.5 text-[14px] ${!category ? "bg-navy-800 font-semibold text-white" : "text-ink-700 hover:bg-mist-100"}`}
              >
                Todas as categorias
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/catalogo/${c.slug}`}
                  aria-current={category === c.slug ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-[14px] ${
                    category === c.slug ? "bg-navy-800 font-semibold text-white" : "text-ink-700 hover:bg-mist-100"
                  }`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:hidden" aria-label="Categorias">
          <Link href="/catalogo" className={`shrink-0 rounded-full border px-4 py-2 text-[14px] font-semibold ${!category ? "border-navy-800 bg-navy-800 text-white" : "border-mist-300 bg-white text-navy-800"}`}>
            Todas
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/catalogo/${c.slug}`}
              className={`shrink-0 rounded-full border px-4 py-2 text-[14px] font-semibold whitespace-nowrap ${
                category === c.slug ? "border-navy-800 bg-navy-800 text-white" : "border-mist-300 bg-white text-navy-800"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:mt-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <label htmlFor="busca-catalogo" className="sr-only">
              Buscar no catálogo
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-500" />
            <input
              id="busca-catalogo"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto"
              className="field !pl-12"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-500 hover:bg-mist-100"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>
          <p className="text-[14px] text-ink-500" aria-live="polite">
            {results.length} {results.length === 1 ? "item" : "itens"}
          </p>
        </div>

        <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-gold-300/60 bg-[#fdf8ee] px-4 py-3 text-[13px] text-[#6b4a0b]">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Itens ilustrativos. O catálogo completo com os produtos das lojas será integrado em breve. Se não encontrar o que procura, adicione o item na sua lista de orçamento.
        </p>

        {results.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="card mt-6 p-10 text-center">
            <p className="font-display text-[24px] font-semibold text-navy-800">Nenhum item encontrado</p>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-500">
              Temos mais de 20 mil itens nas lojas. Escreva o que você procura na sua lista de orçamento e nossa equipe confirma a disponibilidade.
            </p>
            <Link href="/orcamento#item-livre" className="btn-primary mt-6">
              Adicionar item à lista
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
