import { NextResponse, type NextRequest } from "next/server";
import { emailConfig, emailEnabled, escapeHtml, inscreverNovidades, sendEmail } from "@/lib/resend";

/**
 * Registra o pedido de orçamento por e-mail:
 * 1. aviso para a loja (EMAIL_LOJA), sempre;
 * 2. confirmação ao cliente, com o modelo publicado no painel (RESEND_TEMPLATE_ORCAMENTO), quando configurado.
 * O WhatsApp não depende desta rota.
 */

export const runtime = "nodejs";

type Item = { nome: string; spec?: string; qtd: number; codigo?: string };
type Body = {
  id: string;
  canal: "whatsapp" | "email";
  nome: string;
  email: string;
  telefone: string;
  perfil: "casa" | "empresa" | "condominio";
  empresa?: string;
  documento: string;
  recebimento:
    | { tipo: "entrega"; cep: string; rua: string; numero: string; complemento?: string; bairro: string; cidade: string; uf: string }
    | { tipo: "retirada"; loja: string };
  itens: Item[];
  observacoes?: string;
  /** cliente marcou "quero receber novidades e ofertas" */
  novidades?: boolean;
  /** campo invisível: se vier preenchido, é robô */
  site?: string;
  /** momento em que o formulário foi aberto (ms) */
  t?: number;
};

// Limite simples por IP (por instância): 5 envios a cada 10 minutos.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parse(raw: unknown): Body | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const itensRaw = Array.isArray(b.itens) ? b.itens.slice(0, 200) : [];
  const itens: Item[] = itensRaw
    .map((i) => {
      const o = (i ?? {}) as Record<string, unknown>;
      const qtd = Math.max(1, Math.min(100000, Math.floor(Number(o.qtd) || 0)));
      return { nome: str(o.nome, 200), spec: str(o.spec, 200), qtd, codigo: str(o.codigo, 40) };
    })
    .filter((i) => i.nome);
  const rec = (b.recebimento ?? {}) as Record<string, unknown>;
  const recebimento =
    rec.tipo === "retirada"
      ? { tipo: "retirada" as const, loja: str(rec.loja, 60) }
      : {
          tipo: "entrega" as const,
          cep: str(rec.cep, 10),
          rua: str(rec.rua, 200),
          numero: str(rec.numero, 20),
          complemento: str(rec.complemento, 100),
          bairro: str(rec.bairro, 100),
          cidade: str(rec.cidade, 100),
          uf: str(rec.uf, 2).toUpperCase(),
        };
  const perfil = b.perfil === "empresa" || b.perfil === "condominio" ? b.perfil : "casa";
  const body: Body = {
    id: str(b.id, 64),
    canal: b.canal === "email" ? "email" : "whatsapp",
    nome: str(b.nome, 120),
    email: str(b.email, 200).toLowerCase(),
    telefone: str(b.telefone, 30),
    perfil,
    empresa: str(b.empresa, 160),
    documento: str(b.documento, 30),
    recebimento,
    itens,
    observacoes: str(b.observacoes, 2000),
    novidades: b.novidades === true,
    site: str(b.site, 100),
    t: Number(b.t) || 0,
  };
  if (!body.nome || !EMAIL_RE.test(body.email) || !itens.length || body.telefone.replace(/\D/g, "").length < 10) return null;
  return body;
}

const perfilLabel = { casa: "Para casa", empresa: "Para empresa", condominio: "Para condomínio" };

function avisoLoja(b: Body) {
  const e = escapeHtml;
  const linhasItens = b.itens
    .map(
      (i) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e9f0;text-align:right;white-space:nowrap">${i.qtd}</td>` +
        `<td style="padding:6px 8px;border-bottom:1px solid #e5e9f0">${e(i.nome)}${i.spec ? ` <span style="color:#5a6578">(${e(i.spec)})</span>` : ""}</td>` +
        `<td style="padding:6px 8px;border-bottom:1px solid #e5e9f0;color:#5a6578">${i.codigo ? e(i.codigo) : "-"}</td></tr>`,
    )
    .join("");
  const r = b.recebimento;
  const receb =
    r.tipo === "entrega"
      ? `Entrega<br>${e(r.rua)}, ${e(r.numero)}${r.complemento ? ` - ${e(r.complemento)}` : ""}<br>${e(r.bairro)} - ${e(r.cidade)}/${e(r.uf)}<br>CEP ${e(r.cep)}`
      : `Retirada na loja ${e(r.loja)}`;
  const docTipo = b.documento.replace(/\D/g, "").length > 11 ? "CNPJ" : "CPF";
  const linha = (k: string, v: string) => `<tr><td style="padding:4px 12px 4px 0;color:#5a6578;vertical-align:top">${k}</td><td style="padding:4px 0">${v}</td></tr>`;
  const canal =
    b.canal === "whatsapp"
      ? "O cliente escolheu enviar pelo WhatsApp. Este e-mail é o registro automático do site; confira se a mensagem chegou no WhatsApp antes de atender em duplicidade."
      : "O cliente escolheu enviar por e-mail. Responda direto a este e-mail para falar com ele.";

  const html = `<!doctype html><html><body style="margin:0;background:#f5f8fc;font-family:Arial,Helvetica,sans-serif;color:#1c2533">
<div style="max-width:640px;margin:0 auto;padding:24px">
<div style="background:#16336a;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;font-size:18px;font-weight:bold">Novo pedido de orçamento pelo site</div>
<div style="background:#fff;padding:20px;border:1px solid #dce5f2;border-top:0;border-radius:0 0 8px 8px">
<p style="margin:0 0 16px;padding:10px 12px;background:#fff8e6;border-left:3px solid #e6c27f;font-size:13px;line-height:1.5">${canal}</p>
<table style="border-collapse:collapse;font-size:14px;margin-bottom:16px">
${linha("Nome", e(b.nome))}
${linha("WhatsApp", e(b.telefone))}
${linha("E-mail", e(b.email))}
${linha("Perfil", perfilLabel[b.perfil])}
${b.perfil !== "casa" && b.empresa ? linha(b.perfil === "empresa" ? "Empresa" : "Condomínio", e(b.empresa)) : ""}
${b.documento ? linha(docTipo, e(b.documento)) : ""}
${linha("Recebimento", receb)}
</table>
<table style="border-collapse:collapse;width:100%;font-size:14px">
<tr style="background:#eef3fa"><th style="padding:6px 8px;text-align:right">Qtd</th><th style="padding:6px 8px;text-align:left">Produto</th><th style="padding:6px 8px;text-align:left">Código</th></tr>
${linhasItens}
</table>
${b.observacoes ? `<p style="margin:16px 0 0;font-size:14px"><strong>Observações:</strong><br>${e(b.observacoes).replace(/\n/g, "<br>")}</p>` : ""}
<p style="margin:20px 0 0;font-size:12px;color:#8a94a6">Registro ${e(b.id)}</p>
</div></div></body></html>`;

  const text = [
    "Novo pedido de orçamento pelo site",
    canal,
    "",
    `Nome: ${b.nome}`,
    `WhatsApp: ${b.telefone}`,
    `E-mail: ${b.email}`,
    `Perfil: ${perfilLabel[b.perfil]}`,
    b.perfil !== "casa" && b.empresa ? `${b.perfil === "empresa" ? "Empresa" : "Condomínio"}: ${b.empresa}` : "",
    b.documento ? `${docTipo}: ${b.documento}` : "",
    r.tipo === "entrega"
      ? `Entrega: ${r.rua}, ${r.numero}${r.complemento ? ` - ${r.complemento}` : ""}, ${r.bairro} - ${r.cidade}/${r.uf}, CEP ${r.cep}`
      : `Retirada na loja ${r.loja}`,
    "",
    "Itens:",
    ...b.itens.map((i) => `- ${i.qtd} x ${i.nome}${i.spec ? ` (${i.spec})` : ""}${i.codigo ? ` [cód. ${i.codigo}]` : ""}`),
    b.observacoes ? `\nObservações: ${b.observacoes}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");

  return { html, text };
}

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "anon";
  const origin = req.headers.get("origin") ?? "";
  // Aceita o endereço em que o site foi aberto (Vercel repassa em x-forwarded-host) e o domínio oficial.
  const hosts = new Set(
    [req.headers.get("x-forwarded-host"), req.headers.get("host"), req.nextUrl.host, process.env.NEXT_PUBLIC_SITE_URL]
      .filter(Boolean)
      .map((h) => String(h).replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase()),
  );
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host.toLowerCase();
    } catch {}
    if (!hosts.has(originHost)) {
      console.warn("orcamento: origem recusada", origin, [...hosts].join(","));
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "dados inválidos" }, { status: 400 });
  }
  const b = parse(raw);
  if (!b) {
    console.warn("orcamento: dados inválidos");
    return NextResponse.json({ ok: false, error: "dados inválidos" }, { status: 400 });
  }

  // Robôs: campo invisível preenchido ou formulário enviado rápido demais. Responde "ok" sem enviar nada.
  if (b.site || (b.t && Date.now() - b.t < 3000)) {
    console.warn("orcamento: bloqueado como robô", b.site ? "campo invisível preenchido" : "envio rápido demais");
    return NextResponse.json({ ok: true });
  }
  if (limited(ip)) {
    console.warn("orcamento: limite de envios atingido");
    return NextResponse.json({ ok: false, error: "muitas tentativas" }, { status: 429 });
  }
  if (!emailEnabled()) {
    console.error("orcamento: RESEND_API_KEY não configurada neste deploy");
    return NextResponse.json({ ok: false, error: "e-mail não configurado" }, { status: 503 });
  }

  // Inscrição na lista de novidades roda em paralelo e nunca impede o pedido.
  const inscricao = b.novidades ? inscreverNovidades({ email: b.email, nome: b.nome }) : null;

  const { html, text } = avisoLoja(b);
  const loja = await sendEmail({
    to: emailConfig.loja,
    subject: `[Site] Pedido de orçamento - ${b.nome}`,
    replyTo: b.email,
    html,
    text,
    idempotencyKey: b.id ? `orc-${b.id}-loja` : undefined,
  });
  if (loja.ok) console.info("orcamento: aviso à loja enviado", loja.id, b.canal);
  else console.error("orcamento: aviso à loja falhou", loja.status, loja.error);

  let cliente: "enviado" | "sem-modelo" | "falhou" = "sem-modelo";
  if (emailConfig.templateOrcamento) {
    const r = b.recebimento;
    const res = await sendEmail({
      to: b.email,
      subject: process.env.EMAIL_ASSUNTO_ORCAMENTO || undefined,
      replyTo: emailConfig.loja,
      template: {
        id: emailConfig.templateOrcamento,
        // Precisam existir no modelo da Resend (emails/orcamento-cliente.html), todas como string.
        variables: {
          PRIMEIRO_NOME: b.nome.split(/\s+/)[0],
          // Ex.: "1 produto · 2 unidades" (mesma conta do resumo do site)
          QTD_PRODUTOS: (() => {
            const p = b.itens.length;
            const u = b.itens.reduce((t, i) => t + i.qtd, 0);
            return `${p} ${p === 1 ? "produto" : "produtos"} · ${u} ${u === 1 ? "unidade" : "unidades"}`;
          })(),
          RECEBIMENTO: r.tipo === "entrega" ? `Entrega em ${r.cidade}/${r.uf}` : `Retirada na loja ${r.loja}`,
        },
      },
      idempotencyKey: b.id ? `orc-${b.id}-cliente` : undefined,
    });
    cliente = res.ok ? "enviado" : "falhou";
    if (res.ok) console.info("orcamento: confirmação ao cliente enviada", res.id);
    if (!res.ok) console.error("orcamento: e-mail ao cliente falhou", res.status, res.error);
  }

  let novidades: "inscrito" | "falhou" | "nao" = "nao";
  if (inscricao) {
    const r = await inscricao;
    novidades = r.ok ? "inscrito" : "falhou";
    if (r.ok) console.info("orcamento: inscrito na lista de novidades");
    else console.error("orcamento: inscrição em novidades falhou", r.erro);
  }

  return NextResponse.json({ ok: loja.ok, cliente, novidades }, { status: loja.ok ? 200 : 502 });
}
