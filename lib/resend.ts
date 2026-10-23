/**
 * Envio de e-mail direto pela API da Resend, só no servidor.
 * O site não depende do painel de e-mail: se a Resend falhar, o pedido
 * pelo WhatsApp continua funcionando normalmente.
 *
 * Variáveis de ambiente (projeto diskmarmitinha na Vercel):
 * - RESEND_API_KEY              chave com permissão "Sending access" (obrigatória)
 * - EMAIL_FROM                  remetente (padrão: Disk Marmitinha <dm.digital@diskmarmitinha.com.br>)
 * - EMAIL_LOJA                  quem recebe os avisos do site (padrão: dm.digital@diskmarmitinha.com.br)
 * - RESEND_TEMPLATE_ORCAMENTO   ID do modelo publicado no painel para o e-mail ao cliente (opcional)
 */

const API = "https://api.resend.com/emails";

export const emailConfig = {
  from: process.env.EMAIL_FROM || "Disk Marmitinha <dm.digital@diskmarmitinha.com.br>",
  loja: process.env.EMAIL_LOJA || "dm.digital@diskmarmitinha.com.br",
  templateOrcamento: process.env.RESEND_TEMPLATE_ORCAMENTO || "",
};

export const emailEnabled = () => Boolean(process.env.RESEND_API_KEY);

type Base = { to: string; subject?: string; replyTo?: string; idempotencyKey?: string };
type WithHtml = Base & { html: string; text?: string };
type WithTemplate = Base & { template: { id: string; variables: Record<string, string | number> } };

export type SendResult = { ok: true; id: string } | { ok: false; status: number; error: string };

export async function sendEmail(msg: WithHtml | WithTemplate): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, status: 0, error: "RESEND_API_KEY não configurada" };

  const body: Record<string, unknown> = { from: emailConfig.from, to: [msg.to] };
  if (msg.subject) body.subject = msg.subject;
  if (msg.replyTo) body.reply_to = msg.replyTo;
  if ("template" in msg) body.template = msg.template;
  else {
    body.html = msg.html;
    if (msg.text) body.text = msg.text;
  }

  const headers: Record<string, string> = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  if (msg.idempotencyKey) headers["Idempotency-Key"] = msg.idempotencyKey;

  // Uma nova tentativa só para limite de taxa (429) e erro do servidor (5xx).
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(API, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000) });
      const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (res.ok && data.id) return { ok: true, id: data.id };
      if (res.status !== 429 && res.status < 500) return { ok: false, status: res.status, error: data.message ?? "erro" };
      if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
      else return { ok: false, status: res.status, error: data.message ?? "erro" };
    } catch (e) {
      if (attempt === 1) return { ok: false, status: 0, error: e instanceof Error ? e.message : "falha de rede" };
    }
  }
  return { ok: false, status: 0, error: "falha" };
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
