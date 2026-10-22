import Link from "next/link";
import { getCategory, type ProductSummary } from "@/lib/catalog";
import { CategoryIcon } from "./icons";
import { AddToList } from "./add-to-list";

export function ProductCard({ product }: { product: ProductSummary }) {
  const category = getCategory(product.category);
  const sub = category?.subcategories.find((s) => s.slug === product.subcategory);
  const href = `/produto/${product.slug}`;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-mist-200 bg-white p-3 transition-shadow hover:shadow-soft sm:p-5">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-mist-50 to-mist-100"
      >
        {category && <CategoryIcon icon={category.icon} className="size-9 text-navy-800/60 sm:size-12" />}
      </Link>
      {sub && (
        <p className="eyebrow mt-3 !text-[10px] !tracking-[0.12em] text-ink-500 sm:mt-4 sm:!text-[11px]">{sub.name}</p>
      )}
      <h3 className="mt-1.5 font-display text-[16px] leading-snug font-semibold text-navy-800 sm:text-[19px]">
        <Link href={href} className="hover:underline">
          {product.name}
        </Link>
      </h3>
      <p className="mt-1 text-[12px] text-ink-500 sm:text-[13px]">{product.spec}</p>
      <div className="mt-auto pt-4">
        <AddToList product={product} />
      </div>
    </article>
  );
}
