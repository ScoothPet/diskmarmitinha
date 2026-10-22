"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { categories, getCategory, type ProductSummary, type SearchResult } from "@/lib/catalog";
import { ProductCard } from "./product-card";

const fmt = (n: number) => n.toLocaleString("pt-BR");

export function CatalogBrowser({
  category,
  initial,
  initialQuery = "",
  initialSub = "",
}: {
  category?: string;
  initial: SearchResult;
  initialQuery?: string;
  initialSub?: string;
}) {
  const current = category ? getCategory(category) : undefined;
  const [query, setQuery] = useState(initialQuery);
  const [sub, setSub] = useState(initialSub);
  const [items, setItems] = useState<ProductSummary[]>(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [page, setPage] = useState(initial.page);
  const [approximate, setApproximate] = useState(initial.approximate);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const first = useRef(true);
  const reqId = useRef(0);

  const params = (q: string, s: string, p: number) => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (category) sp.set("categoria", category);
    if (s) sp.set("sub", s);
    if (p > 1) sp.set("pagina", String(p));
    return sp;
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalogo?${params(query, sub, 1)}`);
        const data = (await res.json()) as SearchResult;
        if (id !== reqId.current) return;
        setItems(data.items);
        setTotal(data.total);
        setPage(1);
        setApproximate(data.approximate);
      } catch {
        /* mantém o resultado anterior */
      } finally {
        if (id === reqId.current) setLoading(false);
      }
      // Mantém a busca no endereço, para poder compartilhar ou voltar
      const url = new URLSearchParams();
      if (query.trim()) url.set("q", query.trim());
      if (sub) url.set("sub", sub);
      const qs = url.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    }, 220);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sub]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/catalogo?${params(query, sub, page + 1)}`);
      const data = (await res.json()) as SearchResult;
      setItems((prev) => [...prev, ...data.items]);
      setPage(data.page);
    } finally {
      setLoadingMore(false);
    }
  }

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-[14px] font-semibold whitespace-nowrap ${
      active ? "border-navy-800 bg-navy-800 text-white" : "border-mist-300 bg-white text-navy-800 hover:border-navy-800"
    }`;

  return (
    <div className="grid gap-10 lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav aria-label="Categorias" className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-mist-200 bg-white p-3">
          <p className="eyebrow px-3 pt-2 pb-3 text-ink-500">Categorias</p>
          <ul className="grid gap-0.5">
            <li>
              <Link
                href="/catalogo"
                className={`flex justify-between gap-2 rounded-lg px-3 py-2.5 text-[14px] ${!category ? "bg-navy-800 font-semibold text-white" : "text-ink-700 hover:bg-mist-100"}`}
              >
                Todas as categorias
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/catalogo/${c.slug}`}
                  aria-current={category === c.slug ? "page" : undefined}
                  className={`flex justify-between gap-2 rounded-lg px-3 py-2.5 text-[14px] ${
                    category === c.slug ? "bg-navy-800 font-semibold text-white" : "text-ink-700 hover:bg-mist-100"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={category === c.slug ? "text-mist-200" : "text-ink-500"}>{fmt(c.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:hidden" aria-label="Categorias">
          <Link href="/catalogo" className={chip(!category)}>
            Todas
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/catalogo/${c.slug}`} className={chip(category === c.slug)}>
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
              enterKeyHint="search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={current ? `Buscar em ${current.name}` : "Buscar produto, marca ou código"}
              className="field !pl-12 !pr-12"
            />
            {loading ? (
              <Loader2 aria-hidden="true" className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-ink-500" />
            ) : (
              query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpar busca"
                  className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-500 hover:bg-mist-100"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              )
            )}
          </div>
          <p className="text-[14px] text-ink-500" aria-live="polite">
            {fmt(total)} {total === 1 ? "produto" : "produtos"}
          </p>
        </div>

        {current && current.subcategories.length > 1 && (
          <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Subcategorias">
            <button type="button" onClick={() => setSub("")} className={chip(!sub)} aria-pressed={!sub}>
              Tudo
            </button>
            {current.subcategories.map((s) => (
              <button key={s.slug} type="button" onClick={() => setSub(s.slug)} className={chip(sub === s.slug)} aria-pressed={sub === s.slug}>
                {s.name}
              </button>
            ))}
          </div>
        )}

        {approximate && items.length > 0 && (
          <p className="mt-5 text-[14px] text-ink-500">
            Não encontramos exatamente &ldquo;{query}&rdquo;. Veja os produtos mais parecidos.
          </p>
        )}

        {items.length > 0 ? (
          <>
            <div className={`mt-6 grid grid-cols-2 gap-3 transition-opacity sm:gap-4 xl:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {items.length < total && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <p className="text-[13px] text-ink-500">
                  Mostrando {fmt(items.length)} de {fmt(total)}
                </p>
                <button type="button" onClick={loadMore} disabled={loadingMore} className="btn-outline">
                  {loadingMore && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
                  Ver mais produtos
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card mt-6 p-10 text-center">
            <p className="font-display text-[24px] font-semibold text-navy-800">Nenhum produto encontrado</p>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-500">
              Tente outra palavra ou escreva o que você procura na sua lista de orçamento. Nossa equipe confirma a disponibilidade nas lojas.
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
