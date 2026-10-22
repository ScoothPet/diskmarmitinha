// Só para código de servidor (páginas, rotas de API).
// O catálogo vigente fica no Vercel Blob (publicado pela página /admin/catalogo). Se ainda não houver
// nenhum publicado, usa o catálogo embutido em data/catalogo (gerado por scripts/catalogo/gerar.ts).
import fs from "node:fs";
import path from "node:path";
import { list as listBlobs } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import { normalize, PAGE_SIZE, type Product, type ProductSummary, type SearchResult, type Subcategory } from "./catalog";
import type { CategoriaSite, ProdutoSite } from "./catalog-build/build";

type Raw = ProdutoSite;
export const CATALOGO_PREFIXO = "catalogo/versoes/";
export const CATALOGO_TAG = "catalogo";

type Indexed = {
  raw: Raw;
  order: number;
  nameWords: string[];
  words: string[];
};

type Loaded = {
  key: string;
  list: Indexed[];
  bySlug: Map<string, Indexed>;
  byId: Map<string, Indexed>;
  subs: Map<string, Subcategory[]>;
  subName: Map<string, string>;
};
let cache: Loaded | null = null;
let loading: Promise<Loaded> | null = null;

function stem(w: string) {
  if (w.length > 4 && w.endsWith("oes")) return w.slice(0, -3) + "ao";
  if (w.length > 4 && w.endsWith("aes")) return w.slice(0, -3) + "ao";
  if (w.length > 4 && w.endsWith("eis")) return w.slice(0, -3) + "el";
  if (w.length > 4 && (w.endsWith("res") || w.endsWith("zes"))) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s")) return w.slice(0, -1);
  return w;
}

function tokens(text: string) {
  const out: string[] = [];
  for (const w of normalize(text).split(/[^a-z0-9]+/)) {
    if (!w) continue;
    out.push(stem(w));
    // "500ml" também vira "500" e "ml"; "c100" vira "c" e "100"
    const parts = w.match(/[a-z]+|[0-9]+/g);
    if (parts && parts.length > 1) for (const p of parts) out.push(stem(p));
  }
  return out;
}

/** Endereço da versão mais recente publicada no Blob (guardado em cache até a próxima publicação). */
const versaoAtual = unstable_cache(
  async (): Promise<string | null> => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
    try {
      const { blobs } = await listBlobs({ prefix: CATALOGO_PREFIXO, limit: 1000 });
      if (!blobs.length) return null;
      blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
      return blobs[0].url;
    } catch {
      return null;
    }
  },
  ["catalogo-versao-atual"],
  { tags: [CATALOGO_TAG], revalidate: 3600 },
);

function index(produtos: Raw[], categorias: CategoriaSite[], key: string): Loaded {
  const list = produtos.map<Indexed>((raw, order) => ({
    raw,
    order,
    nameWords: Array.from(new Set(tokens(raw.n))),
    words: Array.from(new Set(tokens(`${raw.n} ${raw.k}`))),
  }));
  const subs = new Map(categorias.map((c) => [c.slug, c.subcategorias.map((s) => ({ slug: s.slug, name: s.nome }))]));
  const subName = new Map(categorias.flatMap((c) => c.subcategorias.map((s) => [`${c.slug}/${s.slug}`, s.nome] as [string, string])));
  return { key, list, subs, subName, bySlug: new Map(list.map((p) => [p.raw.s, p])), byId: new Map(list.map((p) => [p.raw.id, p])) };
}

function embutido(): Loaded {
  const dir = path.join(process.cwd(), "data", "catalogo");
  const produtos = JSON.parse(fs.readFileSync(path.join(dir, "produtos.json"), "utf8")) as Raw[];
  const categorias = JSON.parse(fs.readFileSync(path.join(dir, "categorias.json"), "utf8")) as CategoriaSite[];
  return index(produtos, categorias, "embutido");
}

async function load(): Promise<Loaded> {
  const url = (await versaoAtual()) ?? "embutido";
  if (cache?.key === url) return cache;
  if (!loading) {
    loading = (async () => {
      try {
        if (url === "embutido") return embutido();
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Blob ${res.status}`);
        const data = (await res.json()) as { produtos: Raw[]; categorias: CategoriaSite[] };
        return index(data.produtos, data.categorias, url);
      } catch (e) {
        console.error("Falha ao carregar o catálogo publicado; usando o embutido", e);
        return cache ?? embutido();
      }
    })().finally(() => {
      loading = null;
    });
  }
  cache = await loading;
  return cache;
}

function summary(p: Indexed, l: Loaded): ProductSummary {
  const r = p.raw;
  return { id: r.id, slug: r.s, name: r.n, category: r.c, subcategory: r.sc, subcategoryName: l.subName.get(`${r.c}/${r.sc}`) ?? "", spec: r.r };
}

function full(p: Indexed, l: Loaded): Product {
  return { ...summary(p, l), description: p.raw.d, specs: p.raw.e };
}

// Termos que o cliente digita e como eles aparecem nos cadastros (já normalizados e no singular)
const SINONIMOS: Record<string, string[]> = {
  marmita: ["marmita", "marmitex", "quentinha"],
  marmitex: ["marmitex", "marmita"],
  quentinha: ["marmitex", "marmita"],
  lixo: ["lixo", "lixeira"],
  lixeira: ["lixeira", "lixo"],
  descartavel: ["descartavel", "desc"],
  caixa: ["caixa", "cx"],
  organizador: ["organizador", "org"],
  embalagem: ["embalagem", "emb"],
  talher: ["talher", "garfo", "faca", "colher", "faqueiro"],
  vasilha: ["pote", "vasilha"],
  tupperware: ["pote", "hermetico"],
  tapoer: ["pote", "hermetico"],
  cesta: ["cesta", "cesto", "cestinha"],
  cesto: ["cesto", "cesta", "cestinha"],
  planta: ["planta", "folhagem", "samambaia", "suculenta", "orquidea", "flor"],
  adubo: ["adubo", "fertilizante", "substrato"],
  terra: ["terra", "substrato"],
  vaso: ["vaso", "cachepo", "jardineira"],
  sacola: ["sacola", "saco"],
  pano: ["pano", "flanela"],
  guarda: ["guarda"],
  copo: ["copo", "caneca", "taca"],
  xicara: ["xicara", "caneca"],
  forma: ["forma", "assadeira"],
  assadeira: ["assadeira", "forma"],
  panela: ["panela", "cacarola", "caldeirao", "frigideira"],
  frigideira: ["frigideira", "panela"],
  garrafa: ["garrafa", "garrafao"],
  termica: ["termica", "termico"],
  termico: ["termico", "termica"],
  natal: ["natal", "noel", "pisca"],
  epi: ["epi", "luva", "avental", "touca", "mascara", "bota"],
  sabao: ["sabao", "detergente", "lava"],
  pressao: ["pressao"],
  bandeja: ["bandeja", "band"],
  travessa: ["travessa", "trav"],
  pet: ["pet", "comedouro", "bebedouro"],
  litro: ["litro", "lts", "lt", "l"],
  lt: ["lt", "lts", "l", "litro"],
  mililitro: ["ml"],
  centimetro: ["cm"],
  metro: ["metro", "mt", "mts", "m"],
  quilo: ["kg", "quilo"],
  kilo: ["kg"],
  antiderrapante: ["antiderrapante", "anti"],
};

const STOP = new Set(["de", "da", "do", "das", "dos", "para", "pra", "com", "e", "em", "o", "a", "os", "as", "um", "uma", "p", "c"]);

function editDistanceAtMost1(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function matchWord(words: string[], alts: string[], fuzzy: boolean) {
  for (const alt of alts) {
    for (const w of words) {
      // Termos curtos (ml, l, cm, kg...) só valem como palavra inteira
      if (alt.length <= 2 ? w === alt : w.startsWith(alt)) return true;
      // Tolerância a um erro de digitação, comparando com a palavra inteira ou com o começo dela
      if (fuzzy && alt.length >= 5 && (editDistanceAtMost1(alt, w) || editDistanceAtMost1(alt, w.slice(0, alt.length)))) return true;
    }
  }
  return false;
}

export async function searchProducts({
  q = "",
  category,
  subcategory,
  page = 1,
  pageSize = PAGE_SIZE,
}: {
  q?: string;
  category?: string;
  subcategory?: string;
  page?: number;
  pageSize?: number;
}): Promise<SearchResult> {
  const l = await load();
  const { list, byId } = l;
  let pool = list;
  if (category) pool = pool.filter((p) => p.raw.c === category);
  if (subcategory) pool = pool.filter((p) => p.raw.sc === subcategory);

  const terms = tokens(q).filter((t) => !STOP.has(t));
  let approximate = false;
  let ranked: Indexed[];

  if (!terms.length) {
    ranked = pool;
  } else {
    const groups = Array.from(new Set(terms)).map((t) => Array.from(new Set([t, ...(SINONIMOS[t] ?? [])])));
    const run = (fuzzy: boolean, minHits: number) => {
      const scored: { p: Indexed; score: number }[] = [];
      for (const p of pool) {
        let hits = 0;
        let score = 0;
        groups.forEach((alts, i) => {
          if (matchWord(p.nameWords, alts.slice(0, 1), fuzzy)) {
            hits++;
            score += 4;
            if (i === 0 && p.nameWords[0]?.startsWith(alts[0])) score += 4;
            else if (p.nameWords.slice(0, 3).some((w) => w.startsWith(alts[0]))) score += 2;
          } else if (matchWord(p.nameWords, alts, fuzzy)) {
            hits++;
            score += 2;
            if (i === 0 && alts.some((a) => p.nameWords[0]?.startsWith(a))) score += 2;
          } else if (matchWord(p.words, alts, fuzzy)) {
            hits++;
            score += 1;
          }
        });
        if (hits >= minHits) scored.push({ p, score: score + hits * 10 });
      }
      return scored.sort((a, b) => b.score - a.score || a.p.order - b.p.order).map((s) => s.p);
    };
    ranked = run(false, groups.length);
    if (!ranked.length) {
      ranked = run(true, groups.length);
      approximate = ranked.length > 0;
    }
    if (!ranked.length && groups.length > 1) {
      ranked = run(true, groups.length - 1);
      approximate = ranked.length > 0;
    }
    // Código interno digitado direto
    const exact = /^\d{1,6}$/.test(q.trim()) ? byId.get(q.trim()) : undefined;
    if (exact && (!category || exact.raw.c === category)) ranked = [exact, ...ranked.filter((p) => p !== exact)];
  }

  const pages = Math.max(1, Math.ceil(ranked.length / pageSize));
  const atual = Math.min(Math.max(1, page), pages);
  const start = (atual - 1) * pageSize;
  return {
    items: ranked.slice(start, start + pageSize).map((p) => summary(p, l)),
    total: ranked.length,
    page: atual,
    pages,
    pageSize,
    approximate,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const l = await load();
  const p = l.bySlug.get(slug);
  return p && full(p, l);
}

export async function relatedProducts(product: Product, limit = 8): Promise<ProductSummary[]> {
  const l = await load();
  const same = l.list.filter((p) => p.raw.sc === product.subcategory && p.raw.c === product.category && p.raw.id !== product.id);
  const first = tokens(product.name)[0];
  same.sort((a, b) => Number(b.nameWords[0] === first) - Number(a.nameWords[0] === first) || a.order - b.order);
  return same.slice(0, limit).map((p) => summary(p, l));
}

export async function allProductSlugs() {
  return (await load()).list.map((p) => p.raw.s);
}

/** Subcategorias com produtos no catálogo vigente. */
export async function subcategoriesOf(category: string): Promise<Subcategory[]> {
  return (await load()).subs.get(category) ?? [];
}

/** Ids e versão do catálogo vigente (usado para mostrar o que mudou numa nova publicação). */
export async function currentCatalogInfo() {
  const l = await load();
  return { versao: l.key, ids: new Set(l.list.map((p) => p.raw.id)), total: l.list.length };
}
