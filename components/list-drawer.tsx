"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ClipboardList, Minus, Plus, Trash2, X } from "lucide-react";
import { useQuote } from "./quote-provider";

export function ListDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, totalUnits, setQty, remove, ready } = useQuote();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const empty = !ready || lines.length === 0;

  return (
    <div className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`} inert={!open} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-navy-950/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-lista"
        className={`absolute top-0 right-0 flex h-full w-[88vw] max-w-[420px] flex-col bg-white shadow-lift transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-mist-200 px-5 py-4">
          <h2 id="titulo-lista" className="font-display text-[24px] font-semibold text-navy-800">
            Minha lista{!empty && <span className="ml-2 text-[16px] font-medium text-ink-500">({totalUnits})</span>}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar lista"
            className="grid size-10 place-items-center rounded-lg text-navy-800 hover:bg-mist-100"
          >
            <X aria-hidden="true" className="size-6" />
          </button>
        </div>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-mist-100 text-navy-800">
              <ClipboardList aria-hidden="true" className="size-8" strokeWidth={1.5} />
            </span>
            <p className="mt-5 font-display text-[22px] font-semibold text-navy-800">Sua lista está vazia</p>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-500">Adicione produtos do catálogo para pedir seu orçamento.</p>
            <Link href="/catalogo" onClick={onClose} className="btn-primary mt-6">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-mist-200 overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.id} className="py-4">
                  <p className="font-semibold text-navy-800">{l.name}</p>
                  <p className="text-[13px] text-ink-500">{l.spec}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-xl border border-mist-300">
                      <button type="button" onClick={() => setQty(l.id, l.qty - 1)} className="grid size-9 place-items-center text-navy-800 hover:bg-mist-100" aria-label={`Diminuir ${l.name}`}>
                        <Minus aria-hidden="true" className="size-4" />
                      </button>
                      <span className="min-w-9 text-center text-[14px] font-semibold" aria-live="polite">
                        {l.qty}
                      </span>
                      <button type="button" onClick={() => setQty(l.id, l.qty + 1)} className="grid size-9 place-items-center text-navy-800 hover:bg-mist-100" aria-label={`Aumentar ${l.name}`}>
                        <Plus aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                    <button type="button" onClick={() => remove(l.id)} className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-mist-100 hover:text-[#b42318]" aria-label={`Remover ${l.name}`}>
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="grid gap-3 border-t border-mist-200 p-5">
              <Link href="/orcamento" onClick={onClose} className="btn-primary w-full">
                Solicitar orçamento
              </Link>
              <button type="button" onClick={onClose} className="btn-outline w-full">
                Continuar navegando
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
