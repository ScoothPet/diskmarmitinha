import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { categories, getCategory } from "@/lib/catalog";
import { searchProducts, subcategoriesOf } from "@/lib/catalog-server";
import { CatalogBrowser } from "@/components/catalog-browser";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return { title: category.name, description: category.description };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; sub?: string; pagina?: string }>;
}) {
  const { slug } = await params;
  const { q, sub, pagina } = await searchParams;
  const category = getCategory(slug);
  if (!category) notFound();
  const subcategories = await subcategoriesOf(category.slug);
  const query = typeof q === "string" ? q.slice(0, 120) : "";
  const subcategory = typeof sub === "string" && subcategories.some((s) => s.slug === sub) ? sub : "";
  const page = Math.max(1, Number(pagina) || 1);
  const initial = await searchProducts({ q: query, category: category.slug, subcategory: subcategory || undefined, page });

  return (
    <>
      <section className="relative overflow-hidden border-b border-mist-200 bg-mist-50">
        <div className="container-site grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_420px]">
          <div>
            <nav aria-label="Navegação estrutural" className="flex items-center gap-1.5 text-[13px] text-ink-500">
              <Link href="/catalogo" className="hover:text-navy-800">
                Catálogo
              </Link>
              <ChevronRight aria-hidden="true" className="size-3.5" />
              <span className="text-ink-900">{category.name}</span>
            </nav>
            <h1 className="heading-lg mt-4 text-navy-800">{category.name}</h1>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-500">{category.description}</p>
          </div>
          {category.image && (
            <div className="relative hidden aspect-[4/3] overflow-hidden rounded-3xl lg:block">
              <Image src={category.image} alt="" fill sizes="420px" className="object-cover" priority />
            </div>
          )}
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="container-site">
          <CatalogBrowser key={`${query}|${subcategory}|${page}`} category={category.slug} subcategories={subcategories} initial={initial} initialQuery={query} initialSub={subcategory} />
        </div>
      </section>
    </>
  );
}
