"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ClipboardList, Menu, Phone, Search, Truck, X } from "lucide-react";
import { nav, site, telLink, whatsappLagoaSantaLink, whatsappLink } from "@/lib/site";
import { useQuote } from "./quote-provider";
import { WhatsAppIcon } from "./icons";

export function Header() {
  const pathname = usePathname();
  const { totalUnits, ready } = useQuote();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 120);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const count = ready ? totalUnits : 0;

  return (
    <>
      <div className="bg-navy-900 text-[13px] text-mist-200">
        <div className="container-site flex h-10 items-center justify-center gap-4 md:justify-between">
          <Link href="/ajuda#frete" className="flex min-w-0 items-center justify-center gap-2 hover:text-white">
            <Truck aria-hidden="true" className="size-4 shrink-0 text-gold-300" />
            <span className="truncate">
              {site.freeShipping.short}
              <span className="hidden lg:inline"> · consulte as condições</span>
            </span>
          </Link>
          <div className="hidden shrink-0 items-center gap-6 md:flex">
            <a href={telLink} className="flex items-center gap-2 hover:text-white" aria-label={`Telefone ${site.phone.display}`}>
              <Phone aria-hidden="true" className="size-3.5 text-gold-300" />
              {site.phone.display}
            </a>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b bg-white/95 backdrop-blur transition-shadow ${
          scrolled ? "border-mist-200 shadow-soft" : "border-transparent"
        }`}
      >
        <div className="container-site flex h-[80px] items-center sm:h-[90px] lg:h-[96px] justify-between gap-6">
          <Link href="/" aria-label="Disk Marmitinha Casa & Estilo, página inicial" className="shrink-0">
            <Image
              src="/images/logo-disk-marmitinha-vertical.svg"
              alt="Disk Marmitinha casa & estilo"
              width={1267}
              height={480}
              priority
              className="h-[52px] w-auto sm:h-[60px] lg:h-[66px]"
            />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-7 xl:flex">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-2 text-[14px] font-medium transition-colors hover:text-navy-800 ${
                    active ? "text-navy-800" : "text-ink-700"
                  }`}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded bg-navy-800" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((v) => !v);
                setOpen(false);
              }}
              aria-expanded={searchOpen}
              aria-controls="busca-mobile"
              aria-label={searchOpen ? "Fechar busca" : "Buscar produto"}
              className="grid size-12 place-items-center rounded-xl border border-mist-300 bg-white text-navy-800 sm:hidden"
            >
              {searchOpen ? <X aria-hidden="true" className="size-5" /> : <Search aria-hidden="true" className="size-5" />}
            </button>
            <Link
              href="/orcamento"
              className="btn relative min-h-12 border border-mist-300 bg-white !px-0 text-navy-800 whitespace-nowrap hover:border-navy-800 max-sm:size-12 sm:!px-5"
              aria-label={count > 0 ? `Minha lista de orçamento, ${count} itens` : "Minha lista de orçamento"}
            >
              <ClipboardList aria-hidden="true" className="size-5 sm:size-[18px]" />
              <span className="hidden sm:inline">Minha lista</span>
              {count > 0 && (
                <span className="grid min-w-6 place-items-center rounded-full bg-navy-800 px-1.5 text-[12px] font-bold leading-6 text-white max-sm:absolute max-sm:-top-2 max-sm:-right-2 max-sm:ring-2 max-sm:ring-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen((v) => !v);
                setSearchOpen(false);
              }}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className="grid size-12 place-items-center rounded-xl border border-mist-300 text-navy-800 xl:hidden"
            >
              {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
          </div>
        </div>

        <div
          id="busca-mobile"
          className={`grid border-mist-200 bg-white transition-[grid-template-rows,opacity] duration-300 ease-out sm:hidden ${
            searchOpen ? "grid-rows-[1fr] border-t opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
          inert={!searchOpen}
        >
          <div className="overflow-hidden">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                const q = query.trim();
                setSearchOpen(false);
                router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo");
              }}
              className={`container-site flex items-center gap-2 py-3 transition-transform duration-300 ease-out ${
                searchOpen ? "translate-y-0" : "-translate-y-2"
              }`}
            >
              <label htmlFor="busca-header" className="sr-only">
                Buscar produto
              </label>
              <div className="relative min-w-0 flex-1">
                <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-500" />
                <input
                  ref={searchRef}
                  id="busca-header"
                  type="search"
                  enterKeyHint="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="O que você procura?"
                  className="field !pl-12"
                />
              </div>
              <button type="submit" className="btn-primary shrink-0 !px-5">
                Buscar
              </button>
            </form>
          </div>
        </div>

        {open && (
          <div id="menu-mobile" className="h-[calc(100dvh-80px)] sm:h-[calc(100dvh-90px)] overflow-y-auto border-t border-mist-200 bg-white xl:hidden">
            <nav aria-label="Menu" className="container-site flex flex-col py-4">
              <Link href="/" className="border-b border-mist-100 py-4 text-[17px] font-medium text-ink-900">
                Início
              </Link>
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="border-b border-mist-100 py-4 text-[17px] font-medium text-ink-900">
                  {item.label}
                </Link>
              ))}
              <div className="mt-6 grid gap-3">
                <Link href="/orcamento" className="btn-primary">
                  Solicitar orçamento
                </Link>
                <a target="_blank" rel="noopener noreferrer" href={whatsappLink()} className="btn-whats">
                  <WhatsAppIcon className="size-5" />
                  Falar no WhatsApp
                </a>
              </div>
              <div className="mt-6 grid gap-3 text-[15px]">
                <a href={telLink} className="flex items-center gap-3 font-semibold text-navy-800">
                  <Phone aria-hidden="true" className="size-4" />
                  Telefone {site.phone.display}
                </a>
                <a
                  href={whatsappLagoaSantaLink("Olá! Vim pelo site e quero falar com a unidade Lagoa Santa.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-semibold text-navy-800"
                >
                  <WhatsAppIcon className="size-4" />
                  WhatsApp Lagoa Santa {site.whatsappLagoaSanta.display}
                </a>
                <p className="text-[14px] text-ink-500">{site.hoursShort}</p>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
