import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { del, list, put } from "@vercel/blob";
import { revalidatePath, revalidateTag } from "next/cache";
import { gerarCatalogo, type ItemBase } from "@/lib/catalog-build/build";
import { CATALOGO_PREFIXO, CATALOGO_TAG, currentCatalogInfo } from "@/lib/catalog-server";

export const maxDuration = 60;

function autorizado(req: NextRequest) {
  const esperada = process.env.ADMIN_CATALOGO_SENHA ?? "";
  const enviada = req.headers.get("x-senha") ?? "";
  if (!esperada || !enviada) return false;
  const a = Buffer.from(esperada);
  const b = Buffer.from(enviada);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function negar() {
  await new Promise((r) => setTimeout(r, 800)); // atrasa tentativas de adivinhar a senha
  return NextResponse.json({ erro: "Senha incorreta." }, { status: 401 });
}

/** Situação atual do catálogo (também serve para conferir a senha). */
export async function GET(req: NextRequest) {
  if (!autorizado(req)) return negar();
  const info = await currentCatalogInfo();
  let publicadoEm: string | null = null;
  if (info.versao !== "embutido") {
    const { blobs } = await list({ prefix: CATALOGO_PREFIXO, limit: 1000 });
    publicadoEm = blobs.find((b) => b.url === info.versao)?.uploadedAt?.toString() ?? null;
  }
  return NextResponse.json({ total: info.total, publicadoEm, origem: info.versao === "embutido" ? "embutido" : "publicado" });
}

/** Recebe os produtos já lidos das duas listas (sem preço nem estoque), gera e publica o catálogo. */
export async function POST(req: NextRequest) {
  if (!autorizado(req)) return negar();
  let body: { itens?: ItemBase[]; confirmar?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Arquivo inválido." }, { status: 400 });
  }
  const itens = Array.isArray(body.itens) ? body.itens : [];
  if (!itens.length) return NextResponse.json({ erro: "Nenhum produto à venda encontrado nas listas." }, { status: 400 });

  const novo = gerarCatalogo(itens);
  const atual = await currentCatalogInfo();
  const novosIds = new Set(novo.produtos.map((p) => p.id));
  const entraram = novo.produtos.filter((p) => !atual.ids.has(p.id)).map((p) => ({ id: p.id, nome: p.n }));
  const sairam = [...atual.ids].filter((id) => !novosIds.has(id));

  // Proteção contra lista errada ou incompleta: queda grande pede confirmação
  if (!body.confirmar && atual.total > 0 && novo.produtos.length < atual.total * 0.6) {
    return NextResponse.json(
      { confirmar: true, aviso: `O catálogo novo tem ${novo.produtos.length} produtos, bem menos que os ${atual.total} de hoje. Confira se exportou as listas completas das duas lojas.` },
      { status: 409 },
    );
  }

  const conteudo = JSON.stringify({ geradoEm: novo.geradoEm, produtos: novo.produtos, categorias: novo.categorias });
  try {
    await put(`${CATALOGO_PREFIXO}${Date.now()}.json`, conteudo, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
    });
  } catch (e) {
    console.error("Falha ao gravar o catálogo no Blob", e);
    return NextResponse.json({ erro: "Não foi possível salvar o catálogo. Tente de novo em alguns minutos; se continuar, avise quem cuida do site." }, { status: 500 });
  }

  // Mantém só as 5 versões mais recentes
  try {
    const { blobs } = await list({ prefix: CATALOGO_PREFIXO, limit: 1000 });
    const antigos = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt)).slice(5);
    if (antigos.length) await del(antigos.map((b) => b.url));
  } catch {
    /* limpeza é opcional */
  }

  revalidateTag(CATALOGO_TAG);
  revalidatePath("/", "layout");

  return NextResponse.json({
    total: novo.produtos.length,
    lojas: novo.lojas,
    entraram: entraram.length,
    sairam: sairam.length,
    exemplosEntraram: entraram.slice(0, 30),
    excluidos: novo.excluidos,
    semCategoria: novo.semCategoria,
  });
}
