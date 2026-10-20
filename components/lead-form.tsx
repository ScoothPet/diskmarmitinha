"use client";

import { useState } from "react";
import { CircleCheck, Mail } from "lucide-react";
import { mailtoLink, units, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

type Variant = "contato" | "empresa";

export function LeadForm({ variant }: { variant: Variant }) {
  const [v, setV] = useState({ name: "", phone: "", email: "", company: "", segment: "", unit: "Belo Horizonte", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof v, value: string) => {
    setV((s) => ({ ...s, [k]: value }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const build = () =>
    variant === "empresa"
      ? `Olá! Quero atendimento para empresa/condomínio.\n\nNome: ${v.name}\nEmpresa/condomínio: ${v.company}\nSegmento: ${v.segment || "-"}\nWhatsApp: ${v.phone}${v.email ? `\nE-mail: ${v.email}` : ""}\nLoja de preferência: ${v.unit}${v.message ? `\n\nNecessidade: ${v.message}` : ""}`
      : `Olá! Vim pelo site.\n\nNome: ${v.name}\nWhatsApp: ${v.phone}${v.email ? `\nE-mail: ${v.email}` : ""}\nLoja de preferência: ${v.unit}\n\nMensagem: ${v.message}`;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!v.name.trim()) e.name = "Informe seu nome.";
    if (v.phone.replace(/\D/g, "").length < 10) e.phone = "Informe um WhatsApp com DDD.";
    if (variant === "empresa" && !v.company.trim()) e.company = "Informe a empresa ou condomínio.";
    if (variant === "contato" && !v.message.trim()) e.message = "Escreva sua mensagem.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const send = (channel: "whatsapp" | "email") => {
    if (!validate()) return;
    const text = build();
    if (channel === "whatsapp") window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
    else window.location.href = mailtoLink(variant === "empresa" ? `Atendimento para empresa - ${v.company}` : `Contato pelo site - ${v.name}`, text);
    setDone(true);
  };

  if (done) {
    return (
      <div className="card p-8 text-center">
        <CircleCheck aria-hidden="true" className="mx-auto size-10 text-whats-600" />
        <p className="heading-md mt-4 text-navy-800">Mensagem pronta para envio</p>
        <p className="mt-2 text-[15px] text-ink-500">Abrimos a conversa com a nossa equipe. Respondemos em horário comercial.</p>
        <button type="button" onClick={() => setDone(false)} className="btn-outline mt-6">
          Voltar ao formulário
        </button>
      </div>
    );
  }

  const E = ({ k }: { k: string }) => (errors[k] ? <p id={`e-${k}`} className="mt-1.5 text-[13px] font-medium text-[#b42318]">{errors[k]}</p> : null);
  const cls = (k: string) => `field ${errors[k] ? "!border-[#b42318]" : ""}`;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        send("whatsapp");
      }}
      className="card grid gap-4 p-6 shadow-soft sm:grid-cols-2 sm:p-8"
    >
      <div className="sm:col-span-2">
        <label htmlFor={`${variant}-name`} className="field-label">Nome</label>
        <input id={`${variant}-name`} autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} className={cls("name")} aria-invalid={!!errors.name} />
        <E k="name" />
      </div>
      {variant === "empresa" && (
        <>
          <div>
            <label htmlFor="empresa-company" className="field-label">Empresa ou condomínio</label>
            <input id="empresa-company" autoComplete="organization" value={v.company} onChange={(e) => set("company", e.target.value)} className={cls("company")} aria-invalid={!!errors.company} />
            <E k="company" />
          </div>
          <div>
            <label htmlFor="empresa-segment" className="field-label">Segmento</label>
            <select id="empresa-segment" value={v.segment} onChange={(e) => set("segment", e.target.value)} className="field">
              <option value="">Selecione</option>
              <option>Restaurante ou marmitaria</option>
              <option>Lanchonete, padaria ou café</option>
              <option>Condomínio</option>
              <option>Escola ou escritório</option>
              <option>Eventos e buffet</option>
              <option>Comércio e varejo</option>
              <option>Outro</option>
            </select>
          </div>
        </>
      )}
      <div>
        <label htmlFor={`${variant}-phone`} className="field-label">WhatsApp</label>
        <input id={`${variant}-phone`} type="tel" autoComplete="tel-national" placeholder="(31) 90000-0000" value={v.phone} onChange={(e) => set("phone", e.target.value)} className={cls("phone")} aria-invalid={!!errors.phone} />
        <E k="phone" />
      </div>
      <div>
        <label htmlFor={`${variant}-email`} className="field-label">E-mail (opcional)</label>
        <input id={`${variant}-email`} type="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} className="field" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${variant}-unit`} className="field-label">Loja de preferência</label>
        <select id={`${variant}-unit`} value={v.unit} onChange={(e) => set("unit", e.target.value)} className="field">
          {units.map((u) => (
            <option key={u.id}>{u.name}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${variant}-message`} className="field-label">
          {variant === "empresa" ? "O que sua empresa precisa? (opcional)" : "Mensagem"}
        </label>
        <textarea
          id={`${variant}-message`}
          rows={4}
          value={v.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder={variant === "empresa" ? "Itens de compra recorrente, volumes, frequência..." : "Conte o que você procura ou cole sua lista de produtos"}
          className={`${cls("message")} !min-h-28 py-3`}
          aria-invalid={!!errors.message}
        />
        <E k="message" />
      </div>
      <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
        <button type="submit" className="btn-whats">
          <WhatsAppIcon className="size-5" />
          Enviar pelo WhatsApp
        </button>
        <button type="button" onClick={() => send("email")} className="btn-outline">
          <Mail aria-hidden="true" className="size-4" />
          Enviar por e-mail
        </button>
      </div>
    </form>
  );
}
