"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, CircleCheck, Loader2, Mail, MapPin, Minus, Plus, Store, Trash2, Truck } from "lucide-react";
import { useQuote } from "@/components/quote-provider";
import { WhatsAppIcon } from "@/components/icons";
import { mailtoLink, units, whatsappLink } from "@/lib/site";

type Mode = "entrega" | "retirada";
type Audience = "casa" | "empresa" | "condominio";

type Form = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  uf: string;
  unit: "" | "bh" | "ls";
  name: string;
  phone: string;
  email: string;
  audience: Audience;
  company: string;
  doc: string;
  notes: string;
};

const empty: Form = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  uf: "",
  unit: "",
  name: "",
  phone: "",
  email: "",
  audience: "casa",
  company: "",
  doc: "",
  notes: "",
};

const maskCep = (v: string) => v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
const maskDoc = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11)
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};
const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export function QuoteForm() {
  const { lines, ready, setQty, remove, addCustom, clear, totalUnits } = useQuote();
  const [mode, setMode] = useState<Mode>("entrega");
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form | "items", string>>>({});
  const [cepState, setCepState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [custom, setCustom] = useState({ name: "", qty: 1 });
  const [sent, setSent] = useState<null | { message: string; channel: "whatsapp" | "email" }>(null);
  const [sending, setSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  // Anti-robô: momento em que o formulário abriu e campo invisível que só robôs preenchem
  const openedAt = useRef(Date.now());
  const [trap, setTrap] = useState("");
  // Consentimento para novidades: sempre começa desmarcado (LGPD)
  const [optIn, setOptIn] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Busca de endereço pelo CEP (ViaCEP)
  useEffect(() => {
    const digits = form.cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setCepState("idle");
      return;
    }
    const ctrl = new AbortController();
    setCepState("loading");
    fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data?.erro) {
          setCepState("error");
          return;
        }
        setForm((f) => ({
          ...f,
          street: data.logradouro || f.street,
          district: data.bairro || f.district,
          city: data.localidade || f.city,
          uf: data.uf || f.uf,
        }));
        setErrors((e) => ({ ...e, street: undefined, district: undefined, city: undefined, uf: undefined }));
        setCepState("ok");
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setCepState("error");
      });
    return () => ctrl.abort();
  }, [form.cep]);

  const unit = units.find((u) => u.id === form.unit);

  const message = useMemo(() => {
    const itemLines = lines.map((l) => `- ${l.qty} x ${l.name} (${l.spec})${l.code ? ` [cód. ${l.code}]` : ""}`).join("\n");
    const receive =
      mode === "entrega"
        ? `Recebimento: entrega\nCEP: ${form.cep}\nEndereço: ${form.street}, ${form.number}${form.complement ? ` - ${form.complement}` : ""}\nBairro: ${form.district}\nCidade: ${form.city}/${form.uf}`
        : `Recebimento: retirada na loja ${unit?.name ?? ""}`;
    const audience = { casa: "Para casa", empresa: "Para empresa", condominio: "Para condomínio" }[form.audience];
    const who = [
      `Nome: ${form.name}`,
      `WhatsApp: ${form.phone}`,
      `E-mail: ${form.email.trim()}`,
      `Perfil: ${audience}`,
      form.audience !== "casa" && form.company && `${form.audience === "empresa" ? "Empresa" : "Condomínio"}: ${form.company}`,
      form.doc && `${form.doc.replace(/\D/g, "").length > 11 ? "CNPJ" : "CPF"}: ${form.doc}`,
    ]
      .filter(Boolean)
      .join("\n");
    return `Olá! Gostaria de um orçamento pelo site.\n\nItens:\n${itemLines}\n\n${receive}${form.notes.trim() ? `\n\nObservações: ${form.notes.trim()}` : ""}\n\n${who}`;
  }, [lines, mode, form, unit]);

  function validate() {
    const e: typeof errors = {};
    if (!lines.length) e.items = "Adicione pelo menos um item à lista.";
    if (mode === "entrega") {
      if (form.cep.replace(/\D/g, "").length !== 8) e.cep = "Informe um CEP válido.";
      if (!form.street.trim()) e.street = "Informe o endereço.";
      if (!form.number.trim()) e.number = "Informe o número.";
      if (!form.district.trim()) e.district = "Informe o bairro.";
      if (!form.city.trim()) e.city = "Informe a cidade.";
      if (!/^[A-Za-z]{2}$/.test(form.uf.trim())) e.uf = "UF";
    } else if (!form.unit) {
      e.unit = "Escolha a loja para retirada.";
    }
    if (!form.name.trim()) e.name = "Informe seu nome.";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Informe um WhatsApp com DDD.";
    if (!form.email.trim()) e.email = "Informe seu e-mail.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "E-mail inválido.";
    const docLen = form.doc.replace(/\D/g, "").length;
    if (!docLen) e.doc = "Informe seu CPF ou CNPJ.";
    else if (docLen !== 11 && docLen !== 14) e.doc = "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).";
    if (form.audience !== "casa" && !form.company.trim()) e.company = "Informe o nome.";
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
    }
    return !first;
  }

  /** Registra o pedido por e-mail no servidor do site (aviso à loja + confirmação ao cliente). */
  function register(channel: "whatsapp" | "email") {
    const payload = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      canal: channel,
      nome: form.name.trim(),
      email: form.email.trim(),
      telefone: form.phone,
      perfil: form.audience,
      empresa: form.audience !== "casa" ? form.company.trim() : "",
      documento: form.doc,
      recebimento:
        mode === "entrega"
          ? { tipo: "entrega", cep: form.cep, rua: form.street, numero: form.number, complemento: form.complement, bairro: form.district, cidade: form.city, uf: form.uf }
          : { tipo: "retirada", loja: unit?.name ?? "" },
      itens: lines.map((l) => ({ nome: l.name, spec: l.spec, qtd: l.qty, codigo: l.code })),
      observacoes: form.notes.trim(),
      novidades: optIn,
      site: trap,
      t: openedAt.current,
    };
    return fetch("/api/orcamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  }

  function finish(channel: "whatsapp" | "email") {
    setSent({ message, channel });
    clear();
    setForm((f) => ({ ...f, notes: "" }));
    setOptIn(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function send(channel: "whatsapp" | "email") {
    if (!validate() || sending) return;
    if (channel === "whatsapp") {
      // O WhatsApp nunca espera o e-mail: o registro segue em segundo plano.
      register("whatsapp").catch(() => {});
      window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
      finish("whatsapp");
      return;
    }
    // Por e-mail: o site envia direto. Se falhar, abre o aplicativo de e-mail como antes.
    setSending(true);
    let ok = false;
    try {
      const res = await register("email");
      ok = res.ok;
    } catch {
      ok = false;
    }
    setSending(false);
    if (!ok) window.location.href = mailtoLink(`Pedido de orçamento - ${form.name}`, message);
    finish("email");
  }

  if (!ready) {
    return (
      <div className="grid place-items-center py-24 text-ink-500">
        <Loader2 aria-hidden="true" className="size-6 animate-spin" />
        <span className="sr-only">Carregando sua lista</span>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="card mx-auto max-w-2xl p-8 text-center sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e3f3ea] text-whats-600">
          <CircleCheck aria-hidden="true" className="size-8" />
        </span>
        <h2 className="heading-md mt-6 text-navy-800">Pedido de orçamento enviado</h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-500">
          Sua lista foi enviada para o setor de atendimento da Disk Marmitinha com sucesso!
          <br />
          A nossa equipe vai atender a sua solicitação em horário comercial com valores e prazos.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={whatsappLink(sent.message)} target="_blank" rel="noopener noreferrer" className="btn-whats">
            <WhatsAppIcon className="size-5" />
            Abrir WhatsApp novamente
          </a>
          <button
            type="button"
            className="btn-outline"
            onClick={() => setSent(null)}
          >
            Começar nova lista
          </button>
        </div>
      </div>
    );
  }

  const err = (k: keyof Form) =>
    errors[k] ? (
      <p className="mt-1.5 text-[13px] font-medium text-[#b42318]" id={`err-${k}`}>
        {errors[k]}
      </p>
    ) : null;
  const fieldCls = (k: keyof Form) => `field ${errors[k] ? "!border-[#b42318]" : ""}`;
  const a11y = (k: keyof Form) => ({ "data-field": k, "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `err-${k}` : undefined });

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        send("whatsapp");
      }}
      className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div className="grid gap-6">
        {/* 1. Itens */}
        <section className="card p-6 sm:p-8" aria-labelledby="t-itens">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="t-itens" className="heading-md text-navy-800">
              <span className="text-mist-300">1.</span> Itens
            </h2>
            <Link href="/catalogo" className="text-[14px] font-semibold text-navy-800 hover:underline">
              Adicionar do catálogo
            </Link>
          </div>

          {lines.length === 0 ? (
            <div data-field="items" tabIndex={-1} className={`mt-6 rounded-xl border border-dashed p-6 text-center ${errors.items ? "border-[#b42318]" : "border-mist-300"}`}>
              <p className="text-[15px] text-ink-500">Sua lista está vazia. Adicione produtos do catálogo ou escreva abaixo o que você precisa.</p>
              <Link href="/catalogo" className="btn-primary mt-4">
                Ver catálogo
              </Link>
              {errors.items && <p className="mt-3 text-[13px] font-medium text-[#b42318]">{errors.items}</p>}
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-mist-200">
              {lines.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="min-w-0 flex-1 basis-56">
                    <p className="font-semibold text-navy-800">{l.name}</p>
                    <p className="text-[13px] text-ink-500">{l.spec}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-xl border border-mist-300">
                      <button type="button" onClick={() => setQty(l.id, l.qty - 1)} className="grid size-11 place-items-center text-navy-800 hover:bg-mist-100" aria-label={`Diminuir ${l.name}`}>
                        <Minus aria-hidden="true" className="size-4" />
                      </button>
                      <label className="sr-only" htmlFor={`q-${l.id}`}>
                        Quantidade de {l.name}
                      </label>
                      <input
                        id={`q-${l.id}`}
                        inputMode="numeric"
                        value={l.qty}
                        onChange={(e) => {
                          const n = parseInt(e.target.value.replace(/\D/g, "") || "0", 10);
                          if (n > 0) setQty(l.id, Math.min(n, 99999));
                        }}
                        className="h-11 w-14 border-x border-mist-300 text-center text-[15px] font-semibold focus:outline-none"
                      />
                      <button type="button" onClick={() => setQty(l.id, l.qty + 1)} className="grid size-11 place-items-center text-navy-800 hover:bg-mist-100" aria-label={`Aumentar ${l.name}`}>
                        <Plus aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                    <button type="button" onClick={() => remove(l.id)} className="grid size-11 place-items-center rounded-xl text-ink-500 hover:bg-mist-100 hover:text-[#b42318]" aria-label={`Remover ${l.name}`}>
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div id="item-livre" className="mt-6 scroll-mt-32 rounded-xl bg-mist-50 p-5">
            <p className="text-[14px] font-semibold text-ink-900">Não encontrou no catálogo?</p>
            <p className="mt-1 text-[13px] text-ink-500">Escreva o produto e a quantidade. Nossa equipe confirma a disponibilidade.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="custom-name">
                Produto
              </label>
              <input
                id="custom-name"
                value={custom.name}
                onChange={(e) => setCustom((c) => ({ ...c, name: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom(custom.name, custom.qty);
                    setCustom({ name: "", qty: 1 });
                  }
                }}
                placeholder="Ex.: Pote de vidro com tampa de bambu 800 ml"
                className="field flex-1"
              />
              <label className="sr-only" htmlFor="custom-qty">
                Quantidade
              </label>
              <input
                id="custom-qty"
                inputMode="numeric"
                value={custom.qty}
                onChange={(e) => setCustom((c) => ({ ...c, qty: parseInt(e.target.value.replace(/\D/g, "") || "0", 10) }))}
                className="field sm:!w-24 text-center"
              />
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  addCustom(custom.name, custom.qty || 1);
                  setCustom({ name: "", qty: 1 });
                  setErrors((e) => ({ ...e, items: undefined }));
                }}
                disabled={!custom.name.trim()}
              >
                <Plus aria-hidden="true" className="size-4" />
                Adicionar
              </button>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="notes" className="field-label">
              Observações (opcional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Marca preferida, cor, prazo desejado..."
              className="field !min-h-24 py-3"
            />
          </div>
        </section>

        {/* 2. Recebimento */}
        <section className="card p-6 sm:p-8" aria-labelledby="t-receb">
          <h2 id="t-receb" className="heading-md text-navy-800">
            <span className="text-mist-300">2.</span> Entrega ou retirada
          </h2>
          <fieldset className="mt-6">
            <legend className="sr-only">Como você quer receber</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { v: "entrega", icon: Truck, title: "Receber no endereço", text: "Frete grátis a partir de R$ 150 em BH e região, consulte as condições" },
                  { v: "retirada", icon: Store, title: "Retirar na loja", text: "BH ou Lagoa Santa, com estacionamento" },
                ] as const
              ).map(({ v, icon: Icon, title, text }) => (
                <label
                  key={v}
                  className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors ${
                    mode === v ? "border-navy-800 bg-mist-50" : "border-mist-200 hover:border-mist-300"
                  }`}
                >
                  <input type="radio" name="mode" value={v} checked={mode === v} onChange={() => setMode(v)} className="sr-only" />
                  <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${mode === v ? "bg-navy-800 text-white" : "bg-mist-100 text-navy-800"}`}>
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-navy-800">{title}</span>
                    <span className="block text-[13px] text-ink-500">{text}</span>
                  </span>
                  {mode === v && <Check aria-hidden="true" className="ml-auto size-5 text-navy-800" />}
                </label>
              ))}
            </div>
          </fieldset>

          {mode === "entrega" ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="cep" className="field-label">
                  CEP
                </label>
                <div className="relative">
                  <input
                    id="cep"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(e) => set("cep", maskCep(e.target.value))}
                    className={fieldCls("cep")}
                    {...a11y("cep")}
                  />
                  {cepState === "loading" && <Loader2 aria-hidden="true" className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-ink-500" />}
                  {cepState === "ok" && <Check aria-hidden="true" className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-whats-600" />}
                </div>
                {err("cep")}
                {cepState === "error" && !errors.cep && <p className="mt-1.5 text-[13px] text-ink-500">CEP não encontrado. Preencha o endereço manualmente.</p>}
              </div>
              <div className="flex items-end sm:col-span-4">
                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pb-3 text-[13px] font-medium text-navy-800 underline-offset-2 hover:underline"
                >
                  Não sei meu CEP
                </a>
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="street" className="field-label">
                  Endereço
                </label>
                <input id="street" autoComplete="address-line1" placeholder="Rua, avenida..." value={form.street} onChange={(e) => set("street", e.target.value)} className={fieldCls("street")} {...a11y("street")} />
                {err("street")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="number" className="field-label">
                  Número
                </label>
                <input id="number" placeholder="Nº" value={form.number} onChange={(e) => set("number", e.target.value)} className={fieldCls("number")} {...a11y("number")} />
                {err("number")}
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="complement" className="field-label">
                  Complemento (opcional)
                </label>
                <input id="complement" autoComplete="address-line2" placeholder="Apto, bloco, sala" value={form.complement} onChange={(e) => set("complement", e.target.value)} className="field" />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="district" className="field-label">
                  Bairro
                </label>
                <input id="district" value={form.district} onChange={(e) => set("district", e.target.value)} className={fieldCls("district")} {...a11y("district")} />
                {err("district")}
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="city" className="field-label">
                  Cidade
                </label>
                <input id="city" autoComplete="address-level2" value={form.city} onChange={(e) => set("city", e.target.value)} className={fieldCls("city")} {...a11y("city")} />
                {err("city")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="uf" className="field-label">
                  UF
                </label>
                <input id="uf" autoComplete="address-level1" maxLength={2} value={form.uf} onChange={(e) => set("uf", e.target.value.toUpperCase())} className={fieldCls("uf")} {...a11y("uf")} />
                {err("uf")}
              </div>
              <p className="rounded-xl bg-mist-50 px-4 py-3 text-[13px] leading-relaxed text-ink-700 sm:col-span-6">
                <strong className="font-semibold text-navy-800">Frete grátis a partir de R$ 150 em BH e região, mediante condições.</strong> Consulte as condições: a nossa equipe confirma se o seu pedido tem frete grátis junto com o orçamento. Para outras cidades, entregamos para todo o Brasil e o valor do frete e o prazo também são informados no orçamento.
              </p>
            </div>
          ) : (
            <fieldset className="mt-6" data-field="unit" tabIndex={-1}>
              <legend className="mb-3 text-[14px] font-semibold text-ink-900">Em qual loja você vai retirar?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {units.map((u) => (
                  <label
                    key={u.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                      form.unit === u.id ? "border-navy-800 bg-mist-50" : errors.unit ? "border-[#b42318]/60" : "border-mist-200 hover:border-mist-300"
                    }`}
                  >
                    <input type="radio" name="unit" value={u.id} checked={form.unit === u.id} onChange={() => set("unit", u.id)} className="sr-only" />
                    <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-navy-800" />
                    <span>
                      <span className="block font-semibold text-navy-800">{u.name}</span>
                      <span className="block text-[13px] text-ink-500">
                        {u.street}, {u.cityLine}
                      </span>
                    </span>
                    {form.unit === u.id && <Check aria-hidden="true" className="ml-auto size-5 shrink-0 text-navy-800" />}
                  </label>
                ))}
              </div>
              {errors.unit && <p className="mt-2 text-[13px] font-medium text-[#b42318]">{errors.unit}</p>}
              <p className="mt-4 text-[13px] text-ink-500">Avisamos pelo WhatsApp quando o pedido estiver separado para retirada.</p>
            </fieldset>
          )}
        </section>

        {/* 3. Dados */}
        <section className="card p-6 sm:p-8" aria-labelledby="t-dados">
          <h2 id="t-dados" className="heading-md text-navy-800">
            <span className="text-mist-300">3.</span> Seus dados
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="field-label">
                Nome
              </label>
              <input id="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} className={fieldCls("name")} {...a11y("name")} />
              {err("name")}
            </div>
            <div>
              <label htmlFor="phone" className="field-label">
                WhatsApp
              </label>
              <input id="phone" type="tel" autoComplete="tel-national" placeholder="(31) 90000-0000" value={form.phone} onChange={(e) => set("phone", maskPhone(e.target.value))} className={fieldCls("phone")} {...a11y("phone")} />
              {err("phone")}
            </div>
            <div>
              <label htmlFor="email" className="field-label">
                E-mail
              </label>
              <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={fieldCls("email")} {...a11y("email")} />
              {err("email")}
            </div>
            <div>
              <label htmlFor="doc" className="field-label">
                CPF/CNPJ
              </label>
              <input
                id="doc"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={form.doc}
                onChange={(e) => set("doc", maskDoc(e.target.value))}
                className={fieldCls("doc")}
                {...a11y("doc")}
              />
              {err("doc")}
            </div>
            <fieldset className="sm:col-span-2">
              <legend className="field-label">A compra é para</legend>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["casa", "Minha casa"],
                    ["empresa", "Minha empresa"],
                    ["condominio", "Condomínio"],
                  ] as const
                ).map(([v, label]) => (
                  <label
                    key={v}
                    className={`cursor-pointer rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                      form.audience === v ? "border-navy-800 bg-navy-800 text-white" : "border-mist-300 text-navy-800 hover:border-navy-800"
                    }`}
                  >
                    <input type="radio" name="audience" value={v} checked={form.audience === v} onChange={() => set("audience", v)} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {form.audience !== "casa" && (
              <>
                <div>
                  <label htmlFor="company" className="field-label">
                    {form.audience === "empresa" ? "Nome da empresa" : "Nome do condomínio"}
                  </label>
                  <input id="company" autoComplete="organization" value={form.company} onChange={(e) => set("company", e.target.value)} className={fieldCls("company")} {...a11y("company")} />
                  {err("company")}
                </div>
              </>
            )}
            <label htmlFor="novidades" className="flex cursor-pointer items-start gap-3 rounded-lg border border-mist-200 bg-mist-50 p-4 text-[14px] leading-relaxed text-ink-700 sm:col-span-2">
              <input
                id="novidades"
                type="checkbox"
                checked={optIn}
                onChange={(e) => setOptIn(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-navy-800"
              />
              <span>Quero receber novidades e ofertas da Disk Marmitinha!</span>
            </label>
          </div>
        </section>
      </div>

      {/* Resumo */}
      <aside className="card p-6 sm:p-8 lg:sticky lg:top-28" aria-labelledby="t-resumo">
        <h2 id="t-resumo" className="heading-md text-navy-800">
          Resumo
        </h2>
        <dl className="mt-5 grid gap-3 text-[14px]">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Produtos</dt>
            <dd className="font-semibold">{lines.length}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Unidades</dt>
            <dd className="font-semibold">{totalUnits}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Recebimento</dt>
            <dd className="text-right font-semibold">{mode === "entrega" ? "Entrega" : `Retirada${unit ? ` em ${unit.name}` : ""}`}</dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-mist-200 pt-6">
          <p className="text-[13px] leading-relaxed text-ink-500">
            Sem pagamento pelo site. Você recebe os valores, o frete e o prazo e decide com a nossa equipe.
          </p>
          <button type="submit" className="btn-whats mt-5 w-full">
            <WhatsAppIcon className="size-5" />
            Enviar pelo WhatsApp
          </button>
          <button type="button" onClick={() => send("email")} disabled={sending} aria-busy={sending} className="btn-outline mt-3 w-full disabled:opacity-60">
            {sending ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Mail aria-hidden="true" className="size-4" />}
            {sending ? "Enviando..." : "Enviar por e-mail"}
          </button>
          {/* Campo invisível anti-robô: pessoas não veem nem preenchem */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
            <label htmlFor="dm-hp-campo">Deixe em branco</label>
            <input id="dm-hp-campo" name="dm_hp_campo" type="text" tabIndex={-1} autoComplete="off" data-lpignore="true" data-1p-ignore="true" data-form-type="other" value={trap} onChange={(e) => setTrap(e.target.value)} />
          </div>
          {Object.values(errors).some(Boolean) && (
            <p role="alert" className="mt-4 text-[13px] font-medium text-[#b42318]">
              Confira os campos destacados antes de enviar.
            </p>
          )}
        </div>
        <Link href="/catalogo" className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-navy-800 hover:underline">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Continuar escolhendo
        </Link>
      </aside>
    </form>
  );
}
