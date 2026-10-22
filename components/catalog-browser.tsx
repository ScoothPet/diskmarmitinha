"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import { categories, getCategory, type ProductSummary, type SearchResult, type Subcategory } from "@/lib/catalog";
import { ProductCard } from "./product-card";

/** Números de página a mostrar: 1 … 4 5 6 … 20 */
function pageList(page: number, pages: number): (number | "…")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - (nums[i - 1] as number) > 1) out.push("…");
    out.push(n);
  });
  return out;
}

type Props = { category?: string; subcategories?: Subcategory[]; initial: SearchResult };
type UrlState = { q: string; sub: string; page: number } | null;

/**
 * A página chega pronta (em cache) com a primeira página de produtos. Busca, linha e página
 * vêm do endereço (?q=, ?sub=, ?pagina=) e são consultadas na API depois de carregar.
 */
export function CatalogBrowser(props: Props) {
  return (
    <Suspense fallback={<Browser {...props} url={null} />}>
      <WithUrl {...props} />
    </Suspense>
  );
}

function WithUrl(props: Props) {
  const sp = useSearchParams();
  const url = { q: sp.get("q") ?? "", sub: sp.get("sub") ?? "", page: Math.max(1, Number(sp.get("pagina")) || 1) };
  return <Browser {...props} url={url} />;
}

function Browser({ category, subcategories = [], initial, url }: Props & { url: UrlState }) {
  const initialQuery = "";
  const initialSub = "";
  const current = category ? getCategory(category) : undefined;
  const [query, setQuery] = useState(initialQuery);
  const [sub, setSub] = useState(initialSub);
  const [page, setPage] = useState(initial.page);
  const [data, setData] = useState<{ items: ProductSummary[]; pages: number; total: number; approximate: boolean }>(initial);
  const [loading, setLoading] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const reqId = useRef(0);
  const scrollOnLoad = useRef(false);

  // Endereço mudou (abriu com ?q=, voltou no navegador, buscou pelo cabeçalho): acompanha
  const urlKey = url ? `${url.q}|${url.sub}|${url.page}` : "";
  useEffect(() => {
    if (!url) return;
    if (url.q === query && url.sub === sub && url.page === page) return;
    lastFilters.current = `${url.q}|${url.sub}`;
    setQuery(url.q);
    setSub(url.sub);
    setPage(url.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  // Busca e filtros voltam para a página 1
  const lastFilters = useRef(`${initialQuery}|${initialSub}`);
  useEffect(() => {
    const key = `${query}|${sub}`;
    if (key !== lastFilters.current) {
      lastFilters.current = key;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }
    if (first.current) {
      first.current = false;
      return;
    }
    const id = ++reqId.current;
    const ctrl = new AbortController();
    setLoading(true);
    const t = window.setTimeout(
      async () => {
        const sp = new URLSearchParams();
        if (query.trim()) sp.set("q", query.trim());
        if (category) sp.set("categoria", category);
        if (sub) sp.set("sub", sub);
        if (page > 1) sp.set("pagina", String(page));
        try {
          const res = await fetch(`/api/catalogo?${sp}`, { signal: ctrl.signal });
          const json = (await res.json()) as SearchResult;
          if (id !== reqId.current) return;
          setData(json);
          if (scrollOnLoad.current) {
            scrollOnLoad.current = false;
            topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } catch {
          /* mantém o resultado anterior */
        } finally {
          if (id === reqId.current) setLoading(false);
        }
        if (ctrl.signal.aborted) return;
        // Mantém busca, linha e página no endereço, para compartilhar ou voltar
        sp.delete("categoria");
        const qs = sp.toString();
        window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
      },
      scrollOnLoad.current ? 0 : 220,
    );
    return () => {
      window.clearTimeout(t);
      ctrl.abort(); // cancela a busca anterior enquanto a pessoa digita
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sub, page]);

  const goTo = (p: number) => {
    if (p < 1 || p > data.pages || p === page) return;
    scrollOnLoad.current = true;
    setPage(p);
  };

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-[14px] font-semibold whitespace-nowrap ${
      active ? "border-navy-800 bg-navy-800 text-white" : "border-mist-300 bg-white text-navy-800 hover:border-navy-800"
    }`;
  const pageBtn = "grid h-11 min-w-11 place-items-center rounded-xl border px-3 text-[15px] font-semibold";

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav aria-label="Categorias" className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-mist-200 bg-white p-3">
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

      <div className="min-w-0" ref={topRef} style={{ scrollMarginTop: "7rem" }}>
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

        <div className="relative mt-4 w-full sm:max-w-md lg:mt-0">
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

        {current && subcategories.length > 1 && (
          <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Linhas">
            <button type="button" onClick={() => setSub("")} className={chip(!sub)} aria-pressed={!sub}>
              Tudo
            </button>
            {subcategories.map((s) => (
              <button key={s.slug} type="button" onClick={() => setSub(s.slug)} className={chip(sub === s.slug)} aria-pressed={sub === s.slug}>
                {s.name}
              </button>
            ))}
          </div>
        )}

        {data.approximate && data.items.length > 0 && (
          <p className="mt-5 text-[14px] text-ink-500">
            Não encontramos exatamente &ldquo;{query}&rdquo;. Veja os produtos mais parecidos.
          </p>
        )}

        {data.items.length > 0 ? (
          <>
            <div className={`mt-6 grid grid-cols-2 gap-3 transition-opacity sm:gap-4 xl:grid-cols-3 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
              {data.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {data.pages > 1 && (
              <nav aria-label="Páginas" className="mt-10 flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => goTo(page - 1)}
                    disabled={page <= 1}
                    aria-label="Página anterior"
                    className={`${pageBtn} border-mist-300 bg-white text-navy-800 hover:border-navy-800 disabled:opacity-40 disabled:hover:border-mist-300`}
                  >
                    <ChevronLeft aria-hidden="true" className="size-5" />
                  </button>
                  {/* No celular mostra só "página X de Y"; no computador, os números */}
                  <span className="px-3 text-[14px] font-semibold text-navy-800 sm:hidden">
                    {page} de {data.pages}
                  </span>
                  <div className="hidden items-center gap-2 sm:flex">
                    {pageList(page, data.pages).map((n, i) =>
                      n === "…" ? (
                        <span key={`e${i}`} className="px-1 text-ink-500">
                          …
                        </span>
                      ) : (
                        <button
                          key={n}
                          type="button"
                          onClick={() => goTo(n)}
                          aria-current={n === page ? "page" : undefined}
                          className={`${pageBtn} ${n === page ? "border-navy-800 bg-navy-800 text-white" : "border-mist-300 bg-white text-navy-800 hover:border-navy-800"}`}
                        >
                          {n}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => goTo(page + 1)}
                    disabled={page >= data.pages}
                    aria-label="Próxima página"
                    className={`${pageBtn} border-mist-300 bg-white text-navy-800 hover:border-navy-800 disabled:opacity-40 disabled:hover:border-mist-300`}
                  >
                    <ChevronRight aria-hidden="true" className="size-5" />
                  </button>
                </div>
              </nav>
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
