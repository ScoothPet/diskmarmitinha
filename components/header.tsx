"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipboardList, Menu, Phone, Truck, X } from "lucide-react";
import { nav, site, telLink, whatsappLagoaSantaLink, whatsappLink } from "@/lib/site";
import { useQuote } from "./quote-provider";
import { WhatsAppIcon } from "./icons";

export function Header() {
  const pathname = usePathname();
  const { totalUnits, ready } = useQuote();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

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
        <div className="container-site flex h-10 items-center justify-between gap-4">
          <Link href="/ajuda#frete" className="flex min-w-0 items-center gap-2 hover:text-white">
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
            <a
              href={whatsappLagoaSantaLink("Olá! Vim pelo site e quero falar com a unidade Lagoa Santa.")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 hover:text-white lg:flex"
            >
              <WhatsAppIcon className="size-4 text-gold-300" />
              WhatsApp Lagoa Santa {site.whatsappLagoaSanta.display}
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
            <Link href="/orcamento" className="btn-primary relative !px-4 whitespace-nowrap sm:!px-5" aria-label={`Minha lista de orçamento, ${count} itens`}>
              <ClipboardList aria-hidden="true" className="size-[18px]" />
              <span className="hidden sm:inline">Minha lista</span>
              <span className="grid min-w-6 place-items-center rounded-full bg-white px-1.5 text-[12px] font-bold leading-6 text-navy-800">
                {count}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className="grid size-12 place-items-center rounded-xl border border-mist-300 text-navy-800 xl:hidden"
            >
              {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
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
                <a href={whatsappLink()} className="btn-whats">
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
