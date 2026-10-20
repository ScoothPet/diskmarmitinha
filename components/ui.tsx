import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/catalog";
import { CategoryIcon } from "./icons";

export function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  light?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className={`eyebrow ${light ? "text-gold-300" : "text-gold-500"}`}>{eyebrow}</p>
      <h2 className={`heading-lg mt-3 text-balance ${light ? "text-white" : "text-navy-800"}`}>{title}</h2>
      {description && (
        <p className={`mt-4 text-[16px] leading-relaxed sm:text-[17px] ${light ? "text-mist-200" : "text-ink-500"}`}>{description}</p>
      )}
    </div>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/catalogo/${category.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-mist-200 bg-white p-4 transition sm:p-6 duration-200 hover:-translate-y-0.5 hover:border-navy-800 hover:shadow-lift"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-mist-100 sm:size-12 text-navy-800 transition-colors group-hover:bg-navy-800 group-hover:text-white">
        <CategoryIcon icon={category.icon} className="size-5 sm:size-6" />
      </span>
      <h3 className="mt-4 font-display text-[19px] leading-tight sm:mt-5 sm:text-[23px] font-semibold text-navy-800">{category.name}</h3>
      <p className="mt-2 hidden text-[14px] leading-relaxed text-ink-500 sm:block">{category.description}</p>
      <span className="mt-auto hidden items-center gap-2 pt-5 text-[13px] sm:flex font-semibold text-navy-800">
        Ver produtos
        <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-mist-200 bg-mist-50">
      <div className="pointer-events-none absolute -top-40 right-[-10%] size-[520px] rounded-full bg-mist-100 blur-3xl" aria-hidden="true" />
      <div className="container-site relative py-14 sm:py-20">
        <p className="eyebrow text-gold-500">{eyebrow}</p>
        <h1 className="heading-lg mt-3 max-w-3xl text-balance text-navy-800">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-500 sm:text-[17px]">{description}</p>}
        {children}
      </div>
    </section>
  );
}
