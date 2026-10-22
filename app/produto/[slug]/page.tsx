import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, MessageCircle, Truck } from "lucide-react";
import { getCategory } from "@/lib/catalog";
import { getProductBySlug, relatedProducts } from "@/lib/catalog-server";
import { AddToList } from "@/components/add-to-list";
import { CategoryIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";

// Páginas geradas na primeira visita e guardadas em cache
export const dynamicParams = true;
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description.slice(0, 160) };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const category = getCategory(product.category);
  const sub = category?.subcategories.find((s) => s.slug === product.subcategory);
  const related = relatedProducts(product);

  return (
    <>
      <section className="border-b border-mist-200 bg-mist-50">
        <div className="container-site py-5">
          <nav aria-label="Navegação estrutural" className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-500">
            <Link href="/catalogo" className="hover:text-navy-800">
              Catálogo
            </Link>
            {category && (
              <>
                <ChevronRight aria-hidden="true" className="size-3.5" />
                <Link href={`/catalogo/${category.slug}`} className="hover:text-navy-800">
                  {category.name}
                </Link>
              </>
            )}
            {category && sub && (
              <>
                <ChevronRight aria-hidden="true" className="size-3.5" />
                <Link href={`/catalogo/${category.slug}?sub=${sub.slug}`} className="hover:text-navy-800">
                  {sub.name}
                </Link>
              </>
            )}
          </nav>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container-site grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="grid aspect-square place-items-center rounded-3xl bg-gradient-to-br from-mist-50 to-mist-100">
            {category && <CategoryIcon icon={category.icon} className="size-24 text-navy-800/50 sm:size-32" />}
          </div>

          <div>
            {sub && <p className="eyebrow text-gold-500">{sub.name}</p>}
            <h1 className="mt-3 font-display text-[30px] leading-tight font-semibold text-balance text-navy-800 sm:text-[40px]">
              {product.name}
            </h1>
            <p className="mt-2 text-[13px] text-ink-500">Código {product.id}</p>

            <p className="mt-6 text-[16px] leading-relaxed text-ink-700 sm:text-[17px]">{product.description}</p>

            {product.specs.length > 0 && (
              <dl className="mt-8 divide-y divide-mist-200 rounded-2xl border border-mist-200">
                {product.specs.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-6 px-5 py-3 text-[14px]">
                    <dt className="text-ink-500">{label}</dt>
                    <dd className="text-right font-semibold text-ink-900 first-letter:uppercase">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-8">
              <AddToList product={product} size="lg" />
            </div>

            <ul className="mt-8 grid gap-3 text-[14px] text-ink-700">
              <li className="flex items-start gap-3">
                <MessageCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-navy-800" />
                Monte sua lista e receba valores e prazo pelo WhatsApp.
              </li>
              <li className="flex items-start gap-3">
                <Truck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-navy-800" />
                Entregamos para todo o Brasil.
              </li>
              <li className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-navy-800" />
                Ou retire em uma das lojas, em Belo Horizonte e Lagoa Santa.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-mist-200 py-14 sm:py-20">
          <div className="container-site">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-display text-[26px] font-semibold text-navy-800 sm:text-[32px]">Veja também</h2>
              {category && sub && (
                <Link href={`/catalogo/${category.slug}?sub=${sub.slug}`} className="btn-outline shrink-0">
                  Ver tudo em {sub.name}
                </Link>
              )}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
