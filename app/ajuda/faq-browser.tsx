"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Search, X } from "lucide-react";
import { faqGroups, type FaqItem } from "@/lib/faq";
import { normalize } from "@/lib/catalog";

function Question({ item, open }: { item: FaqItem; open?: boolean }) {
  return (
    <details id={item.id} open={open} className="group scroll-mt-32 border-b border-mist-200 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
        <span className="text-[16px] font-semibold text-navy-800 sm:text-[17px]">{item.q}</span>
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-mist-100 text-navy-800 transition-transform duration-200 group-open:rotate-180">
          <ChevronDown aria-hidden="true" className="size-4" />
        </span>
      </summary>
      <div className="-mt-1 pr-12 pb-6">
        {item.a.map((p, i) => (
          <p key={i} className="mt-2 text-[15px] leading-relaxed text-ink-700 first:mt-0">
            {p}
          </p>
        ))}
        {item.links && (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {item.links.map((l) =>
              l.href.startsWith("http") ? (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy-800 hover:underline">
                  {l.label}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </a>
              ) : (
                <Link key={l.href} href={l.href} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy-800 hover:underline">
                  {l.label}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </details>
  );
}

export function FaqBrowser() {
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());

  // Abre a pergunta indicada no endereço (ex.: /ajuda#frete)
  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        el.scrollIntoView({ block: "start" });
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  const results = useMemo(() => {
    if (!q) return [];
    return faqGroups.flatMap((g) =>
      g.items.filter((it) => normalize(`${it.q} ${it.a.join(" ")} ${g.title}`).includes(q)).map((it) => ({ ...it, group: g.title })),
    );
  }, [q]);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
      <aside className="min-w-0">
        <div className="lg:sticky lg:top-32">
          <div className="relative">
            <label htmlFor="busca-ajuda" className="sr-only">
              Buscar uma dúvida
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-500" />
            <input
              id="busca-ajuda"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar uma dúvida"
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
          <nav aria-label="Temas" className="mt-5 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
            {faqGroups.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                onClick={() => setQuery("")}
                className="shrink-0 rounded-full border border-mist-300 bg-white px-4 py-2 text-[14px] font-semibold whitespace-nowrap text-navy-800 hover:border-navy-800 lg:rounded-lg lg:border-0 lg:bg-transparent lg:px-3 lg:py-2.5 lg:font-medium lg:text-ink-700 lg:hover:bg-mist-100 lg:hover:text-navy-800"
              >
                {g.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0">
        {q ? (
          <section aria-live="polite">
            <p className="text-[14px] text-ink-500">
              {results.length} {results.length === 1 ? "resultado" : "resultados"} para “{query.trim()}”
            </p>
            {results.length > 0 ? (
              <div className="card mt-4 px-6 sm:px-8">
                {results.map((it) => (
                  <Question key={it.id} item={it} open />
                ))}
              </div>
            ) : (
              <div className="card mt-4 p-8 text-center">
                <p className="font-display text-[22px] font-semibold text-navy-800">Não encontramos essa dúvida</p>
                <p className="mt-2 text-[15px] text-ink-500">Fale com a nossa equipe que a gente responde.</p>
                <Link href="/contato" className="btn-primary mt-5">
                  Falar com a equipe
                </Link>
              </div>
            )}
          </section>
        ) : (
          <div className="grid gap-12">
            {faqGroups.map((g) => (
              <section key={g.id} id={g.id} aria-labelledby={`t-${g.id}`} className="scroll-mt-32">
                <h2 id={`t-${g.id}`} className="heading-md text-navy-800">
                  {g.title}
                </h2>
                <p className="mt-1.5 text-[15px] text-ink-500">{g.description}</p>
                <div className="card mt-5 px-6 sm:px-8">
                  {g.items.map((it) => (
                    <Question key={it.id} item={it} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
