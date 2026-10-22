import { NextResponse, type NextRequest } from "next/server";
import { searchProducts } from "@/lib/catalog-server";

export function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const page = Number(p.get("pagina") ?? "1");
  const result = searchProducts({
    q: (p.get("q") ?? "").slice(0, 120),
    category: p.get("categoria") || undefined,
    subcategory: p.get("sub") || undefined,
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 500) : 1,
  });
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
