"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Loader2, Lock, TriangleAlert, Upload } from "lucide-react";
import { juntarListas, lerLista, type LinhaLista } from "@/lib/catalog-build/build";

type Resultado = {
  total: number;
  lojas: { bh: number; ls: number; ambas: number };
  entraram: number;
  sairam: number;
  exemplosEntraram: { id: string; nome: string }[];
  excluidos: { id: string; desc: string; motivo: string }[];
  semCategoria: { id: string; desc: string }[];
};
type Situacao = { total: number; publicadoEm: string | null; origem: string };

const CHAVE = "dm-admin-senha";
const fmt = (n: number) => n.toLocaleString("pt-BR");

async function lerArquivo(f: File): Promise<LinhaLista[]> {
  const buf = await f.arrayBuffer();
  let texto: string;
  try {
    texto = new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    texto = new TextDecoder("windows-1252").decode(buf); // formato padrão da exportação do VendasPCP
  }
  return lerLista(texto);
}

export function CatalogUpload() {
  const [senha, setSenha] = useState("");
  const [entrou, setEntrou] = useState(false);
  const [situacao, setSituacao] = useState<Situacao | null>(null);
  const [bh, setBh] = useState<File | null>(null);
  const [ls, setLs] = useState<File | null>(null);
  const [etapa, setEtapa] = useState<"" | "lendo" | "enviando">("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);

  async function entrar(s: string) {
    setErro("");
    const res = await fetch("/api/admin/catalogo", { headers: { "x-senha": s } });
    if (!res.ok) {
      setErro("Senha incorreta.");
      return false;
    }
    setSituacao(await res.json());
    setEntrou(true);
    try {
      sessionStorage.setItem(CHAVE, s);
    } catch {
      /* sem armazenamento */
    }
    return true;
  }

  useEffect(() => {
    try {
      const s = sessionStorage.getItem(CHAVE);
      if (s) {
        setSenha(s);
        void entrar(s);
      }
    } catch {
      /* sem armazenamento */
    }
  }, []);

  async function enviar(confirmar = false) {
    if (!bh || !ls) return;
    setErro("");
    setAviso("");
    setResultado(null);
    try {
      setEtapa("lendo");
      const [lb, ll] = await Promise.all([lerArquivo(bh), lerArquivo(ls)]);
      if (lb.length < 100 || ll.length < 100) throw new Error("Uma das listas parece vazia ou incompleta. Confira se exportou o cadastro completo de produtos.");
      const itens = juntarListas(lb, ll);
      setEtapa("enviando");
      const res = await fetch("/api/admin/catalogo", {
        method: "POST",
        headers: { "content-type": "application/json", "x-senha": senha },
        body: JSON.stringify({ itens, confirmar }),
      });
      const json = await res.json();
      if (res.status === 409 && json.confirmar) {
        setAviso(json.aviso);
        return;
      }
      if (!res.ok) throw new Error(json.erro ?? "Não foi possível publicar o catálogo.");
      setResultado(json);
      setSituacao({ total: json.total, publicadoEm: new Date().toISOString(), origem: "publicado" });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível ler as listas.");
    } finally {
      setEtapa("");
    }
  }

  if (!entrou) {
    return (
      <form
        className="card mt-8 grid gap-4 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          void entrar(senha);
        }}
      >
        <label htmlFor="senha" className="flex items-center gap-2 text-[15px] font-semibold text-navy-800">
          <Lock aria-hidden="true" className="size-4" /> Senha
        </label>
        <input id="senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} className="field" required />
        {erro && <p className="text-[14px] font-medium text-[#b42318]">{erro}</p>}
        <button type="submit" className="btn-primary w-full sm:w-auto">
          Entrar
        </button>
      </form>
    );
  }

  const campo = (rotulo: string, id: string, arquivo: File | null, set: (f: File | null) => void) => (
    <label htmlFor={id} className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-mist-300 bg-mist-50 p-5 hover:border-navy-800">
      <span className="text-[15px] font-semibold text-navy-800">{rotulo}</span>
      <span className="flex items-center gap-2 text-[14px] text-ink-500">
        <FileText aria-hidden="true" className="size-4 shrink-0" />
        {arquivo ? arquivo.name : "Escolher arquivo (.csv)"}
      </span>
      <input id={id} type="file" accept=".csv,.txt,text/csv,text/plain" className="sr-only" onChange={(e) => set(e.target.files?.[0] ?? null)} />
    </label>
  );

  return (
    <div className="mt-8 grid gap-6">
      <div>
        <h2 className="font-display text-[26px] font-semibold text-navy-800">Atualizar catálogo</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-500">
          Envie as listas de produtos exportadas do VendasPCP das duas lojas. O site entende o que está à venda, cria nomes, descrições e categorias, e
          publica em poucos minutos. Preço e estoque não saem do seu computador: só é enviado se cada produto está à venda em cada loja.
        </p>
      </div>
      {situacao && (
        <p className="rounded-xl bg-mist-50 px-4 py-3 text-[14px] text-ink-700">
          No ar agora: <strong>{fmt(situacao.total)} produtos</strong>
          {situacao.publicadoEm ? `, publicados em ${new Date(situacao.publicadoEm).toLocaleString("pt-BR")}` : " (catálogo inicial)"}.
        </p>
      )}

      <div className="card grid gap-5 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {campo("Lista de Belo Horizonte", "lista-bh", bh, setBh)}
          {campo("Lista de Lagoa Santa", "lista-ls", ls, setLs)}
        </div>
        <p className="text-[13px] text-ink-500">
          Use a mesma exportação do cadastro de produtos do VendasPCP enviada pela Querino (arquivo .csv separado por tabulação), uma de cada loja.
        </p>
        {erro && (
          <p className="flex items-start gap-2 text-[14px] font-medium text-[#b42318]">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> {erro}
          </p>
        )}
        {aviso ? (
          <div className="rounded-xl border border-gold-300/60 bg-[#fdf8ee] p-4 text-[14px] text-[#6b4a0b]">
            <p>{aviso}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-primary !min-h-10" onClick={() => void enviar(true)}>
                Publicar mesmo assim
              </button>
              <button type="button" className="btn-outline !min-h-10" onClick={() => setAviso("")}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button type="button" disabled={!bh || !ls || !!etapa} onClick={() => void enviar()} className="btn-primary w-full disabled:opacity-50 sm:w-auto">
            {etapa ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Upload aria-hidden="true" className="size-4" />}
            {etapa === "lendo" ? "Lendo as listas…" : etapa === "enviando" ? "Publicando…" : "Atualizar catálogo"}
          </button>
        )}
      </div>

      {resultado && (
        <div className="card grid gap-5 p-6 sm:p-8">
          <p className="flex items-center gap-2 text-[17px] font-semibold text-navy-800">
            <CheckCircle2 aria-hidden="true" className="size-5 text-whats-600" /> Catálogo publicado
          </p>
          <dl className="grid grid-cols-2 gap-3 text-[14px] sm:grid-cols-4">
            {[
              ["No site", resultado.total],
              ["Entraram", resultado.entraram],
              ["Saíram", resultado.sairam],
              ["Nas duas lojas", resultado.lojas.ambas],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-xl bg-mist-50 p-3">
                <dt className="text-ink-500">{k}</dt>
                <dd className="mt-1 text-[20px] font-semibold text-navy-800">{fmt(v as number)}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[13px] text-ink-500">As páginas do site se atualizam nos próximos minutos.</p>
          {resultado.semCategoria.length > 0 && (
            <details>
              <summary className="cursor-pointer text-[14px] font-semibold text-navy-800">
                {fmt(resultado.semCategoria.length)} produtos novos ficaram fora por não se encaixarem em nenhuma categoria
              </summary>
              <p className="mt-2 text-[13px] text-ink-500">Envie esta lista para quem cuida do site incluir as regras de categoria.</p>
              <ul className="mt-2 max-h-64 overflow-auto text-[13px] text-ink-700">
                {resultado.semCategoria.map((p) => (
                  <li key={p.id}>
                    {p.id} · {p.desc}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {resultado.exemplosEntraram.length > 0 && (
            <details>
              <summary className="cursor-pointer text-[14px] font-semibold text-navy-800">Alguns produtos que entraram</summary>
              <ul className="mt-2 max-h-64 overflow-auto text-[13px] text-ink-700">
                {resultado.exemplosEntraram.map((p) => (
                  <li key={p.id}>
                    {p.id} · {p.nome}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <details>
            <summary className="cursor-pointer text-[14px] font-semibold text-navy-800">{fmt(resultado.excluidos.length)} itens não exibidos de propósito</summary>
            <ul className="mt-2 max-h-64 overflow-auto text-[13px] text-ink-700">
              {resultado.excluidos.map((p) => (
                <li key={p.id}>
                  {p.id} · {p.desc} — {p.motivo}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
