// Gera o catálogo do site a partir das listas de produtos exportadas do VendasPCP (Querino).
// Código puro (sem Node nem navegador): usado pela página /admin/catalogo, pela rota que publica
// o catálogo e pelo script scripts/catalogo/gerar.ts. Nada aqui altera o sistema da Querino.
import { ABREV, ACENTOS, AJUSTES, EXCLUIR, MARCA_NOME, MARCAS, PEQUENAS } from "./regras";

// ---------------------------------------------------------------- leitura das listas

/** Linha de uma lista exportada, só com o que o site usa. */
export type LinhaLista = {
  id: string;
  desc: string;
  grupo: string;
  ncm: string;
  ean: string;
  preco: number;
  estoque: number;
  status: string;
};

/** Lê o texto da lista (TAB, campos entre aspas, cabeçalho na primeira linha). */
export function lerLista(texto: string): LinhaLista[] {
  const linhas = texto.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!linhas.length) return [];
  const campos = (l: string) => l.split("\t").map((c) => c.trim().replace(/^"([\s\S]*)"$/, "$1").replace(/""/g, '"').trim());
  const cab = campos(linhas[0]).map((c) => c.toLowerCase());
  const col = (...nomes: string[]) => {
    const i = cab.findIndex((c) => nomes.some((n) => c.startsWith(n)));
    if (i < 0) throw new Error(`Coluna não encontrada: ${nomes[0]}`);
    return i;
  };
  const iId = col("cód.interno", "cod.interno", "cód. interno");
  const iDesc = col("descrição do produto", "descricao do produto");
  const iGrupo = col("grupo");
  const iPreco = col("preço venda", "preco venda");
  const iEst = col("estoque");
  const iEan = col("cód. barras", "cod. barras");
  const iNcm = col("ncm");
  const iStatus = col("status");
  const num = (s: string) => {
    if (!s) return NaN;
    const n = Number(s.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  };
  const out: LinhaLista[] = [];
  for (const l of linhas.slice(1)) {
    const c = campos(l);
    const id = c[iId];
    if (!id) continue;
    out.push({
      id,
      desc: c[iDesc] ?? "",
      grupo: c[iGrupo] ?? "",
      ncm: c[iNcm] ?? "",
      ean: c[iEan] && c[iEan] !== "0" ? c[iEan] : "",
      preco: num(c[iPreco] ?? ""),
      estoque: num(c[iEst] ?? ""),
      status: c[iStatus] ?? "",
    });
  }
  return out;
}

/** Produto que entra no processamento (já sem preço e estoque, só se está à venda em cada loja). */
export type ItemBase = { id: string; desc: string; grupo: string; ncm: string; ean: string; bh: boolean; ls: boolean; precoBaixo: boolean };

const vendavel = (l?: LinhaLista) => !!l && l.preco > 0 && l.estoque > 0 && l.status !== "FORA DE LINHA";

/** Junta as listas das duas lojas e fica só com o que está à venda em pelo menos uma. */
export function juntarListas(bh: LinhaLista[], ls: LinhaLista[]): ItemBase[] {
  const mb = new Map(bh.map((l) => [l.id, l]));
  const ml = new Map(ls.map((l) => [l.id, l]));
  const ids = new Set([...mb.keys(), ...ml.keys()]);
  const out: ItemBase[] = [];
  for (const id of ids) {
    const b = mb.get(id);
    const l = ml.get(id);
    const vb = vendavel(b);
    const vl = vendavel(l);
    if (!vb && !vl) continue;
    const pick = (k: "desc" | "grupo" | "ncm" | "ean") => (l?.[k] ? l[k] : b?.[k] ?? "");
    const preco = Math.max(b?.preco || 0, l?.preco || 0);
    out.push({ id, desc: pick("desc"), grupo: pick("grupo"), ncm: pick("ncm"), ean: pick("ean"), bh: vb, ls: vl, precoBaixo: preco < 0.1 });
  }
  return out;
}

// ---------------------------------------------------------------- categorias do site

export const CATEGORIAS: [string, string][] = [
  ["Embalagens e Descartáveis", "embalagens-e-descartaveis"],
  ["Utensílios de Cozinha", "utensilios-de-cozinha"],
  ["Panelas", "panelas"],
  ["Organização", "organizacao"],
  ["Limpeza e Higiene", "limpeza-e-higiene"],
  ["Mesa Posta", "mesa-posta"],
  ["Decoração", "decoracao"],
  ["Linha Industrial", "linha-industrial"],
  ["Jardinagem", "jardinagem"],
  ["Casa e Ferramentas", "casa-e-ferramentas"],
  ["Cama, Mesa e Banho", "cama-mesa-e-banho"],
  ["Lazer, Infantil e Pet", "lazer-infantil-e-pet"],
  ["Natal", "natal"],
];
const CAT_SLUG = new Map(CATEGORIAS);

const has = (d: string, ...ws: string[]) => ws.some((w) => new RegExp("(?<![A-Z])" + w).test(d));

function categoria(descOrig: string, grupoOrig: string): [string, string] {
  const d = descOrig.toUpperCase();
  const g = grupoOrig.toUpperCase();
  const f = (d.split(/\s+/).filter(Boolean)[0] ?? "").replace(/^[*.]+|[*.]+$/g, "");
  const em = (...xs: string[]) => xs.includes(f);
  if (f === "NATAL" || d.slice(0, 12).includes("NATAL") || has(d, "PAPAI NOEL", "ARVORE DE NATAL", "PISCA PISCA", "BOLA NATAL")) return ["Natal", "Decoração de Natal"];
  if (em("VASO", "CACHEPO", "POTICHE", "BUQUE", "BOMBONIERE", "LUMINARIA", "CENTRO"))
    return ["Decoração", em("VASO", "CACHEPO", "POTICHE", "BUQUE") ? "Vasos e plantas" : "Objetos decorativos"];
  if (em("ESSENCIA", "HOME") || has(d, "HOME SPRAY")) return ["Decoração", "Aromas e velas"];
  if (em("TORNEIRA", "DUCHA", "RALO", "CHUVEIRO", "SIFAO", "REGISTRO")) return ["Casa e Ferramentas", "Hidráulica"];
  if (em("ESPETO", "GRELHA", "CHURRASQUEIRA", "ACENDEDOR", "BIFETEIRA")) return ["Utensílios de Cozinha", "Churrasco"];
  if (em("BICO") && has(d, "BOLO", "CONFEIT", "WILTON", "DECOR")) return ["Utensílios de Cozinha", "Confeitaria"];
  if (em("CHAIRA", "SOCADOR", "MODELADOR")) return ["Utensílios de Cozinha", "Utensílios de cozinha"];
  if (em("FAQUEIRO")) return ["Mesa Posta", "Talheres"];
  if (em("GAMELA", "RAMEKIN")) return ["Mesa Posta", "Pratos e louças"];
  if (em("MARMITA")) return ["Organização", "Potes e mantimentos"];
  if (em("PANO", "FLANELA", "ESPONJA", "RODO", "VASSOURA")) return ["Limpeza e Higiene", "Limpeza e higiene"];
  if (em("PASSADEIRA", "CAPACHO", "TAPETE")) return ["Decoração", "Têxteis e tapetes"];
  if (em("PORTA", "PORTA-") && has(d, "GUARDANAPO", "COPO", "TALHER", "FRIOS", "MANTEIGA", "BOLO", "QUEIJO", "PALITO", "TEMPERO")) return ["Mesa Posta", "Acessórios de mesa"];
  if (has(d, "DESC\\.", "DESCART", "ISOPOR", "MARMITEX", "BOBINA", "SACO LIXO", "SACO P/ LIXO", "PAPEL ALUM", "FILME PVC", "PALITO", "CANUDO", "C/100", "C/500", "C/1000", "C/50 ", "C/50$", "C/25", "SACOLA", "SACO ", "EMB\\.", "EMBALAGEM", "FITA ADES", "FITA CETIM", "GUARDANAPO PAPEL", "PAPEL TOALHA", "PAPEL HIG", "FORMINHA")) {
    const sub = has(d, "SACO", "SACOLA", "BOBINA")
      ? "Sacos e sacolas"
      : has(d, "COPO", "PRATO", "TALHER", "GARFO", "COLHER", "FACA", "TACA")
        ? "Copos, pratos e talheres descartáveis"
        : has(d, "MARMITA", "POTE", "BAND", "EMB", "MARMITEX", "TAMPA")
          ? "Marmitas e potes"
          : "Papel, filmes e outros";
    return ["Embalagens e Descartáveis", sub];
  }
  if (has(d, "IND\\.", "INDUSTRIAL", "GASTR", "HOTEL", "CALDEIRAO", "PALLET", "CONTENTOR", "CONTEINER", "CAIXA PLAST.*VAZAD", "CX PLAST.*VAZAD", "CX TERMICA", "EPI", "BOTA ", "AVENTAL", "TOUCA", "MASCARA"))
    return ["Linha Industrial", "Cozinha profissional"];
  if (has(d, "BALDE GELO", "BALDE P/ ?GELO", "BALDE ACRIL", "CHAMPAGNE", "CHAMPANHE")) return ["Mesa Posta", "Acessórios de mesa"];
  if (has(d, "LIXEIRA", "BALDE", "VASSOURA", "RODO", "PANO ", "ESPONJA", "DETERG", "ALCOOL", "SABONETE", "DESINFET", "ESCOVA SANIT", "ESCOVA LAVA", "\\bPA ", "MOP", "LUVA", "LIMPA", "ALVEJ", "AMACIANTE", "SABAO", "SANITARIA", "DESENTUP", "PREGADOR", "VARAL", "BACIA", "TANQUE", "CESTO ROUPA")) {
    const sub = d.includes("LIXEIRA") ? "Lixeiras" : has(d, "PREGADOR", "VARAL", "CESTO ROUPA", "BACIA", "TANQUE", "AMACIANTE") ? "Lavanderia" : "Limpeza e higiene";
    return ["Limpeza e Higiene", sub];
  }
  if (has(d, "AROMATIZ", "DIFUSOR", "VELA", "VASO", "CACHEPO", "ABAJUR", "QUADRO", "PORTA RETRATO", "PORTA-RETRATO", "ESCULTURA", "ESTATUA", "ENFEITE", "FLOR ", "ARRANJO", "POTICHE", "ALMOFADA", "MANTA", "TAPETE", "ESPELHO", "CASTICAL", "LANTERNA DECOR", "ORQUIDEA", "FOLHAGEM", "PLANTA ART", "RELOGIO PAREDE", "ADORNO", "OBJETO DECOR", "CENTRO DE MESA")) {
    const sub = has(d, "VASO", "CACHEPO", "FLOR", "ARRANJO", "POTICHE", "ORQUIDEA", "FOLHAGEM", "PLANTA")
      ? "Vasos e plantas"
      : has(d, "AROMATIZ", "DIFUSOR", "VELA")
        ? "Aromas e velas"
        : has(d, "ALMOFADA", "MANTA", "TAPETE")
          ? "Têxteis e tapetes"
          : "Objetos decorativos";
    return ["Decoração", sub];
  }
  if (has(d, "POTE", "ORG\\.", "ORGANIZ", "CESTO", "CAIXA ORG", "CX ORG", "CABIDE", "SAPATEIRA", "GAVETEIRO", "PORTA ", "ESTANTE", "PRATELEIRA", "CAIXA PLAST", "CX PLAST", "BAU", "NICHO", "MANTIMENTO", "DISPENSER", "DISPENSADOR", "SUPORTE", "GANCHO", "CABIDEIRO", "PORTA-")) {
    const sub = has(d, "POTE", "MANTIMENTO") ? "Potes e mantimentos" : d.includes("CESTO") ? "Cestos" : "Caixas e organizadores";
    return ["Organização", sub];
  }
  if (has(d, "PANELA", "CACAROLA", "FRIGIDEIRA", "CHALEIRA", "LEITEIRA", "FERVEDOR", "WOK", "GRILL", "CAÇAROLA", "ESPAGUETEIRA", "CUSCUZEIRA", "PIPOQUEIRA", "TACHO"))
    return ["Panelas", "Panelas e frigideiras"];
  if (has(d, "ASSADEIRA", "FORMA ", "FORMA$", "REFRATARIO", "TABULEIRO", "PIZZA")) return ["Panelas", "Assadeiras e formas"];
  if (has(d, "PRATO", "TACA", "COPO", "XICARA", "CANECA", "TRAVESSA", "SOUSPLAT", "APARELHO", "JOGO JANTAR", "JG JANTAR", "TALHER", "GARFO", "COLHER", "FACA MESA", "FACA CHURR", "SALADEIRA", "PETISQUEIRA", "JARRA", "BOWL", "CUMBUCA", "TIGELA", "RAMEQUIM", "BULE", "ACUCAREIRO", "MANTEIGUEIRA", "JOGO AMERICANO", "LUGAR AMERICANO", "GUARDANAPO", "PORTA GUARDANAPO", "GARRAFA TERMICA", "GARRAFA TERM", "BOLEIRA", "FRUTEIRA", "MOLHEIRA", "SOPEIRA", "PETISQ", "QUEIJEIRA", "PIRES", "CALICE", "CONJ.*CAFE", "CONJ.*CHA", "FARINHEIRA", "PORTA FRIOS", "CAMINHO DE MESA", "TOALHA MESA", "TOALHA DE MESA", "GARRAFA", "DECANTER", "HASHI", "PORTA COPO", "BALDE GELO", "BALDE P/ GELO", "BALDE P/GELO", "BALDE ACRIL", "COQUETELEIRA", "DOSADOR", "PETISQ", "TORRE", "SUPLA")) {
    const sub = has(d, "PRATO", "APARELHO", "JANTAR", "TRAVESSA", "SOUSPLAT", "TIGELA", "BOWL", "CUMBUCA", "RAMEQUIM", "SALADEIRA", "SOPEIRA", "MOLHEIRA")
      ? "Pratos e louças"
      : has(d, "TACA", "COPO", "XICARA", "CANECA", "CALICE", "PIRES")
        ? "Copos, taças e xícaras"
        : has(d, "TALHER", "GARFO", "COLHER", "FACA")
          ? "Talheres"
          : has(d, "BULE", "GARRAFA", "ACUCAREIRO", "CAFE", "CHA ")
            ? "Café e chá"
            : "Acessórios de mesa";
    return ["Mesa Posta", sub];
  }
  if (has(d, "TABUA", "ESCORREDOR", "ESPATULA", "CONCHA", "PEGADOR", "PENEIRA", "RALADOR", "ABRIDOR", "AFIADOR", "BATEDOR", "ROLO", "FUNIL", "MEDIDOR", "ESCUMADEIRA", "FACA", "TESOURA", "SACA ROLHA", "SACA-ROLHA", "ESPREMEDOR", "AMASSADOR", "DESCASCADOR", "MOEDOR", "PILAO", "PINCEL", "BICO CONFEIT", "SACO CONFEIT", "CORTADOR", "FATIADOR", "TERMOMETRO", "LUVA TERM", "PANO DE PRATO", "DESCANSO", "ESCUMAD", "COADOR", "FILTRO", "TAMPA", "ESCORREDOR", "BAND", "PORTA TEMPERO", "GALHETEIRO", "SALEIRO", "PALITEIRO", "LIQUIDIF", "BATEDEIRA", "SANDUICHEIRA", "CAFETEIRA", "AIR FRYER", "PROCESSADOR", "BALANCA")) {
    const sub = has(d, "LIQUIDIF", "BATEDEIRA", "SANDUICHEIRA", "CAFETEIRA", "AIR FRYER", "PROCESSADOR", "ELET")
      ? "Eletroportáteis"
      : has(d, "FACA", "TABUA", "AFIADOR")
        ? "Facas e tábuas"
        : has(d, "BICO", "CONFEIT", "PINCEL", "BATEDOR", "ROLO")
          ? "Confeitaria"
          : "Utensílios de cozinha";
    return ["Utensílios de Cozinha", sub];
  }
  if (has(d, "ALICATE", "CHAVE", "TOMADA", "LAMPADA", "FITA ISOL", "PLACA SINAL", "PLACA ", "ESCADA", "CADEADO", "MANGUEIRA", "EXTENSAO", "PARAFUSO", "MARTELO", "TRENA", "SERROTE", "BROCA", "PILHA", "INTERRUPTOR", "ABRACADEIRA", "COLA", "SILICONE", "REGADOR", "FECHADURA", "LANTERNA"))
    return ["Casa e Ferramentas", "Ferramentas e sinalização"];
  if (has(d, "TOALHA", "LENCOL", "EDREDOM", "COBERTOR", "TRAVESSEIRO", "CORTINA", "JOGO DE BANHO", "ROUPAO", "BANHEIRO", "SABONETEIRA", "PORTA ESCOVA", "BOX"))
    return ["Cama, Mesa e Banho", "Banho e enxoval"];
  if (g.includes("DESCART")) return ["Embalagens e Descartáveis", "Papel, filmes e outros"];
  if (has(g, "LIMPEZA", "HIGIENE")) return ["Limpeza e Higiene", "Limpeza e higiene"];
  if (g.includes("EPI") || g.includes("TERMICOS")) return ["Linha Industrial", "Cozinha profissional"];
  if (has(g, "DECORA", "AROMATIZ")) return ["Decoração", "Objetos decorativos"];
  if (g.includes("FERRAMENT")) return ["Casa e Ferramentas", "Ferramentas e sinalização"];
  return ["Outros", "A revisar"];
}

function ajustar(desc: string, cat: string, sub: string): [string, string] {
  for (const [re, c, s] of AJUSTES) {
    if (re.test(desc)) {
      // Jardinagem pode tirar itens de outras categorias; as demais regras só reclassificam "Outros"
      if (c === "Jardinagem" || cat === "Outros") return [c, s];
    }
  }
  return [cat, sub];
}

function motivoExclusao(item: ItemBase): string {
  const d = item.desc;
  if (/CHASSI|PLACA: |MICROCOMPUTADOR|NOTEBOOK DELL|^A\/E /i.test(d)) return "Patrimônio/uso interno";
  if (/^\*{3,}|DIF\.ICMS|\bIPI\*/i.test(d)) return "Item fiscal/sistema";
  if (/DUPLICADO/i.test(d)) return "Cadastro duplicado";
  if (item.precoBaixo) return "Preço abaixo de R$ 0,10";
  if (EXCLUIR.some((re) => re.test(d))) return "Fora do escopo do site (decisão da empresa)";
  return "";
}

// ---------------------------------------------------------------- marca e nome

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const marcaRe = new RegExp("(?<![A-Z])(" + [...MARCAS].sort((a, b) => b.length - a.length).map(esc).join("|") + ")(?![A-Z])", "g");
const titulo = (x: string) => x.toLowerCase().replace(/(^|\s)(\S)/g, (_, a, b) => a + b.toUpperCase());

function marca(s: string): string {
  const s2 = s.replace(/\*[^*]*\*?/g, " ").split(/\s+/).filter(Boolean).slice(-3).join(" ");
  const f = s2.match(marcaRe);
  if (!f) return "";
  const x = f[f.length - 1];
  return x in MARCA_NOME ? MARCA_NOME[x] : x.length > 3 ? titulo(x) : x;
}

/** Abreviações do cadastro que não estão no dicionário básico (aceitas com ou sem ponto, salvo indicado). */
const ABREV_EXTRA: Record<string, string> = {
  CB: "cabo", CBO: "cabo", CONJ: "conjunto", CJ: "conjunto", CRIST: "cristal", JG: "jogo", DEC: "decorativo", NAT: "natural",
  INDUST: "industrial", HIG: "higiênico", BOR: "borracha", PEROL: "perolado", DIV: "divisórias", DIVIS: "divisórias",
  HERM: "hermético", BASCUL: "basculante", CEL: "celulose", CANAL: "canaleta", PROF: "profissional", MTS: "m", MT: "m",
  INTERF: "interfolhado", TRANSP: "transparente", ARTIC: "articulado", SAB: "sabonete", IMP: "impresso", CORT: "cortador",
  MOD: "modelo", RESERV: "reservatório", PERF: "perfumada", BOB: "bobina", EST: "estampado", SAND: "sanduíche",
  HOSP: "hospitalar", POLET: "polietileno", DESOD: "desodorante", DOBR: "dobrável", AMER: "americano", RAP: "rápido",
  BAQ: "baquelite", POL: "polido", ORIG: "original", DEGUST: "degustação", AROMAT: "aromatizador", OITAV: "oitavado",
  QD: "quadrado", ALUM: "alumínio", DIF: "difusor", GUARD: "guardanapos", UND: "unidade", ANTIA: "antiaderente",
  FORN: "forneável", CERAM: "cerâmica", GRAD: "graduado", ULTRAS: "ultrassônico", LAMP: "lâmpadas", AD: "adesivo",
  LIMP: "limpeza", ILUM: "iluminada", SUP: "suporte", DOM: "doméstico", POT: "potência", COND: "condimentos",
  MULT: "multiuso", QUAD: "quadrado", AUTO: "automático", ESPR: "espremedor", NEUT: "neutralizador", RETANGU: "retangular",
  INFEC: "infectante", GRAV: "gravação", SINT: "sintético", ESC: "escova", RD: "redondo", REF: "refil", ACAB: "acabamento",
  EMB: "embalagem", REFORC: "reforçado", REFORCADO: "reforçado", REFORCADA: "reforçada",
};
/** Abreviações que só valem com ponto (sem ponto podem ser outra palavra ou nome de marca). */
const SO_COM_PONTO = new Set(["DEC", "NAT", "EST", "POL", "MOD", "IMP", "SAB", "DIV", "BOR", "CEL", "DOM", "POT", "SUP", "AD", "ESC", "AUTO", "COND", "PERF", "CANAL", "RAP", "AMER", "FORN", "GRAV", "ORIG", "LIMP", "MULT", "ESPR", "NEUT", "GRAD", "SAND", "HOSP"]);

/** Adjetivos abreviados concordam com a palavra anterior: "Bola Dec." -> "Bola Decorativa". */
function concordar(palavra: string, anteriores: string[]) {
  if (!/(ado|ido|ico|ivo|esso|eto)$/.test(palavra)) return palavra;
  const ant = anteriores.filter((x) => x.trim() && !/^\d/.test(x) && !PEQUENAS.has(x.toLowerCase())).pop() ?? "";
  return /a$/i.test(normalizar(ant)) ? palavra.replace(/o$/, "a") : palavra;
}

function limparAbreviacoes(s: string): string {
  return s
    .replace(/\(FLORARTE\)/g, " ")
    .replace(/\bVOL\.\s?\d+/g, " ")
    .replace(/\bETIQUETA ETIQ\./g, "ETIQUETA")
    .replace(/\bRES\.\s?INFEC\./g, "RESÍDUO INFECTANTE")
    .replace(/\bF\.\s?(DUPLA|SIMPLES)/g, "FOLHA $1")
    .replace(/\bE\.V\.A\.?/g, "EVA")
    .replace(/\bP\.P\./g, "PP")
    .replace(/\bC\.PP\b/g, "CABO PP")
    .replace(/\bF\.P\b/g, "FUNDO PLANO")
    .replace(/\bSOB\.MESA\b/g, "SOBREMESA")
    .replace(/\bLUVA BOR\.\s?FOR\./g, "LUVA BORRACHA FORRADA")
    .replace(/\bGUARDANAPO AP\.\s?AMER\./g, "GUARDANAPO AMERICANO")
    .replace(/\bPARA AP\. /g, "PARA APARELHO ")
    .replace(/\bP\/ AP\. /g, "P/ APARELHO ")
    .replace(/\bLUA\./g, "LUA")
    .replace(/\bOVAL\./g, "OVAL")
    .replace(/\bPANELA\. LINHA/g, "PANELA LINHA")
    .replace(/\bCERAM\.\s?ORG\./g, "CERÂMICA ORGÂNICA")
    // "ALUM.POLIDO", "CB.BAQUELITE", "CERAM.ORG." -> separa as palavras
    .replace(/\b([A-ZÀ-Ú]{2,})\.([A-ZÀ-Ú]{2,})/g, "$1. $2");
}

export function nomeAmigavel(orig: string): string {
  let s = orig.replace(/\*[^*]*\*?/g, " ").replace(/^NATAL\s*-\s*/, "");
  const mk = marca(s);
  if (mk) s = s.toUpperCase().replace(new RegExp("\\s+" + esc(mk.toUpperCase()) + "\\s*$"), "");
  s = s.replace(/\s+1O CLASSIFIC\.?\s*$/, "");
  s = s.replace(/([A-Z]{2,4})\/([A-Z]{2,4})/g, (m, a, b) => (a in ABREV && b in ABREV ? `${ABREV[a]}/${ABREV[b]}`.toUpperCase() : m));
  s = s.replace(/\s*-\s*[A-Z]\d{3,}\s*$/, "");
  s = s.replace(/\b\d{5,}[A-Z]?\b(?=\s*$)/, "");
  s = s.replace(/\bS\.\s?MESA\b/g, "SOBREMESA");
  s = limparAbreviacoes(s);
  s = s.replace(/C\//g, " C/ ").replace(/P\//g, " P/ ").replace(/S\//g, " S/ ");
  const out: string[] = [];
  for (const t of s.trim().split(/(\s+)/)) {
    if (!t) continue;
    if (/^\s+$/.test(t)) {
      out.push(" ");
      continue;
    }
    const k = t.replace(/[.,]+$/, "").replace(/\//g, "");
    if ((k === "C" || k === "P" || k === "S") && t.endsWith("/")) {
      out.push(ABREV[k]);
      continue;
    }
    if (/^\d+([.,]\d+)?(CM|MM|ML|LTS?|L|KG|G|M|W|V|X\d+.*)?$/.test(t)) {
      let x = t.replace(/(\d)LTS?$/, "$1 L").replace(/(\d)(CM|MM|ML|KG|G|W|V)$/, (_, a, b) => a + b.toLowerCase());
      if (/^\d+\.\d+/.test(x)) x = x.replace(/\./g, ",");
      out.push(x.toLowerCase().replace(/ l/g, " L"));
      continue;
    }
    if (k in ACENTOS) {
      out.push(ACENTOS[k]);
      continue;
    }
    if (k in ABREV && (t.endsWith(".") || k.length <= 3)) {
      out.push(ABREV[k]);
      continue;
    }
    if (k.startsWith("S.MESA")) {
      out.push("sobremesa");
      continue;
    }
    if (t.includes("/") && t.split("/").filter(Boolean).every((p) => p in ABREV)) {
      out.push(t.split("/").filter(Boolean).map((p) => ABREV[p]).join("/"));
      continue;
    }
    if (k in ABREV_EXTRA && (t.endsWith(".") || !SO_COM_PONTO.has(k))) {
      out.push(concordar(ABREV_EXTRA[k], out));
      continue;
    }
    out.push(t.toLowerCase());
  }
  let w = out.join("").replace(/\s+/g, " ").replace(/^[\s,-]+|[\s,-]+$/g, "").split(" ");
  w = w.filter((x, i) => i === 0 || x.toLowerCase() !== w[i - 1].toLowerCase());
  w = w.map((x, i) => (i > 0 && PEQUENAS.has(x) ? x : x.slice(0, 1).toUpperCase() + x.slice(1)));
  let r = w.join(" ").replace(/\/([a-zà-ú])/g, (_, c) => "/" + c.toUpperCase());
  if (mk && !r.toLowerCase().includes(mk.toLowerCase())) r = `${r} ${mk}`;
  r = r.trim();
  if (r.length < 4) r = orig.replace(/\*/g, " ").split(/\s+/).filter(Boolean).slice(0, 8).map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(" ");
  return r;
}

// ---------------------------------------------------------------- descrição e características

const USO: Record<string, string> = {
  "Banho e enxoval": "Item para deixar o banheiro e a rotina da casa mais organizados e confortáveis.",
  "Elétrica": "Item elétrico para pequenas instalações, reparos e uso no dia a dia da casa ou do comércio.",
  "Ferramentas e sinalização": "Item para manutenção, pequenos reparos e sinalização de casas, empresas e condomínios.",
  "Fitas e fixação": "Solução prática para fixar, vedar e fazer acabamentos em casa ou no trabalho.",
  "Hidráulica": "Peça para cozinha, banheiro e área de serviço, útil em instalações e na manutenção do dia a dia.",
  "Papelaria": "Item de papelaria para o escritório, a escola e a rotina da loja.",
  "Proteção e acabamento": "Protege móveis, pisos e superfícies e ajuda a conservar a casa por mais tempo.",
  "Aromas e velas": "Perfuma e deixa os ambientes mais acolhedores, ótimo também para presentear.",
  "Objetos decorativos": "Peça decorativa para dar personalidade a salas, quartos e mesas.",
  "Têxteis e tapetes": "Traz conforto e acabamento à decoração, combinando com diferentes estilos de ambiente.",
  "Vasos e plantas": "Peça decorativa para compor ambientes com arranjos, flores e plantas.",
  "Copos, pratos e talheres descartáveis": "Descartável prático para festas, eventos, lanchonetes, restaurantes e o dia a dia da empresa.",
  "Marmitas e potes": "Embalagem para delivery, marmitas, doces e salgados, prática para quem produz e vende alimentos.",
  "Papel, filmes e outros": "Item de embalagem e uso diário para cozinhas, comércios e eventos.",
  "Presentes": "Para embrulhar e apresentar presentes com capricho, em casa ou na sua loja.",
  "Sachês e alimentos": "Porção individual prática para restaurantes, lanchonetes, hotéis e eventos.",
  "Sacos e sacolas": "Para embalar, transportar e armazenar com praticidade no comércio e em casa.",
  "Adubos e substratos": "Nutre e prepara o solo para plantas mais saudáveis em vasos, hortas e jardins.",
  "Ferramentas de jardim": "Ferramenta para cuidar de vasos, canteiros e jardins com mais facilidade.",
  "Plantas artificiais": "Planta artificial que decora sem precisar de rega, ideal para ambientes internos.",
  "Rega": "Para regar plantas, lavar áreas externas e cuidar do jardim com praticidade.",
  "Vasos e jardineiras": "Vaso para cultivo de plantas, flores e temperos, dentro de casa ou na área externa.",
  "Chuva": "Proteção prática para os dias de chuva.",
  "Infantil": "Item pensado para a rotina das crianças em casa e na escola.",
  "Jogos": "Diversão para reunir a família e os amigos.",
  "Lazer e camping": "Para passeios, viagens, piscina e momentos de lazer.",
  "Móveis": "Móvel prático para varandas, áreas de lazer, festas e comércios.",
  "Pet": "Acessório para o dia a dia do seu animal de estimação.",
  "Lavanderia": "Facilita a rotina de lavar, secar e cuidar das roupas.",
  "Limpeza e higiene": "Para a limpeza e a higiene de casas, empresas e condomínios.",
  "Lixeiras": "Ajuda a manter o descarte organizado em cozinhas, banheiros, escritórios e áreas comuns.",
  "Calçados e EPI": "Proteção e segurança para quem trabalha em cozinhas, limpeza e áreas molhadas.",
  "Cozinha profissional": "Linha resistente para restaurantes, escolas, hotéis e cozinhas de grande demanda.",
  "Food service e loja": "Para organizar, expor e operar com eficiência em restaurantes e comércios.",
  "Acessórios de mesa": "Complementa a mesa posta com praticidade e bom acabamento.",
  "Bar e drinks": "Para preparar e servir drinks em casa, no bar ou em festas.",
  "Café e chá": "Para preparar e servir café e chá no dia a dia ou ao receber visitas.",
  "Copos, taças e xícaras": "Para servir bebidas no dia a dia e em ocasiões especiais.",
  "Fondue e rechaud": "Para servir pratos quentes e reunir as pessoas em volta da mesa.",
  "Pratos e louças": "Peça para o dia a dia ou para receber, que combina com diferentes composições de mesa.",
  "Talheres": "Talher para refeições do dia a dia e para a mesa posta.",
  "Toalhas e plástico por metro": "Revestimento para proteger e decorar mesas, vendido por metro ou em peças.",
  "Decoração de Natal": "Decoração para deixar a casa, a loja ou a empresa no clima do Natal.",
  "Caixas e organizadores": "Organiza armários, gavetas, despensas e ambientes, deixando tudo à vista e no lugar.",
  "Cestos": "Cesto para organizar e decorar ao mesmo tempo, em qualquer ambiente da casa.",
  "Potes e mantimentos": "Para guardar, conservar e organizar alimentos na despensa e na geladeira.",
  "Assadeiras e formas": "Para assar bolos, tortas, pães e carnes em casa ou na produção de alimentos.",
  "Panelas e frigideiras": "Panela para o preparo do dia a dia, em casa ou na cozinha profissional.",
  "Churrasco": "Acessório para preparar e servir o churrasco.",
  "Confeitaria": "Item de confeitaria para decorar e preparar bolos, doces e salgados.",
  "Eletroportáteis": "Eletroportátil que agiliza o preparo de alimentos na cozinha.",
  "Facas e tábuas": "Para cortar, fatiar e preparar alimentos com segurança e precisão.",
  "Utensílios de cozinha": "Utensílio que facilita o preparo e o serviço de alimentos no dia a dia.",
};

const MATERIAIS: [RegExp, string][] = [
  [/\bACO INOX|\bINOX\b/, "aço inox"], [/\bALUM\b|ALUM\.|ALUMINIO/, "alumínio"], [/PORC\.|PORCELANA/, "porcelana"],
  [/CERAM\.|CERAMICA|STONEWARE/, "cerâmica"], [/CRISTAL/, "cristal"], [/VIDRO/, "vidro"], [/MELAMINA/, "melamina"],
  [/SILICONE/, "silicone"], [/ACRIL/, "acrílico"], [/BAMBU|BAMBOO/, "bambu"], [/MADEIRA|\bMAD\./, "madeira"],
  [/\bMDF\b/, "MDF"], [/POLIET/, "polietileno"], [/POLIPROP|\bPP\b/, "polipropileno"], [/ISOPOR/, "isopor"],
  [/KRAFT/, "papel kraft"], [/PAPELAO/, "papelão"], [/\bPVC\b/, "PVC"], [/FERRO/, "ferro"], [/ESMALTAD/, "metal esmaltado"],
  [/ALGODAO/, "algodão"], [/MICROFIBRA/, "microfibra"], [/FIBRA NATURAL|RATTAN|JUTA|SISAL/, "fibra natural"],
  [/POLIESTER/, "poliéster"], [/\bTNT\b/, "TNT"], [/BORRACHA/, "borracha"], [/RESINA/, "resina"], [/ARGILA|BARRO/, "argila"],
  [/PLAST\.|PLASTICO|PLASTICA|\bPLAST\b/, "plástico"], [/METAL/, "metal"],
];
const CORES: [RegExp, string][] = [
  [/\bPT\b|\bPTO\b|PRETO|PRETA|BLACK/, "preto"], [/\bBCO\b|\bBCA\b|\bBC\b|BRANCO|BRANCA/, "branco"], [/\bVM\b|VERMELH/, "vermelho"],
  [/\bAZ\b|AZUL/, "azul"], [/\bVD\b|VERDE/, "verde"], [/\bCZ\b|CINZA/, "cinza"], [/\bRS\b|ROSA\b|ROSE\b/, "rosa"],
  [/\bAM\b|AMAREL/, "amarelo"], [/DOURAD|\bOURO\b|GOLD/, "dourado"], [/PRATEAD|\bPRATA\b/, "prateado"], [/TRANSP/, "transparente"],
  [/BEGE/, "bege"], [/MARROM/, "marrom"], [/NUDE/, "nude"], [/MOSTARDA/, "mostarda"], [/TERRACOTA|TERRA COTA/, "terracota"],
  [/LARANJA/, "laranja"], [/LILAS|ROXO|ROXA/, "roxo"], [/COBRE/, "cobre"], [/MARFIM/, "marfim"], [/AREIA/, "areia"],
];

export function normalizar(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
export function slugify(t: string) {
  return normalizar(t).replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function numBr(x: string) {
  const v = Number(x.replace(",", "."));
  if (!Number.isFinite(v)) return x;
  return String(Math.round(v * 100) / 100).replace(".", ",");
}

type Atributos = Partial<Record<"Material" | "Cor" | "Capacidade" | "Medidas" | "Tamanho" | "Conteúdo" | "Peças" | "Embalagem" | "Voltagem" | "Marca", string>>;

function atributos(desc: string): Atributos {
  const d = desc.toUpperCase().replace(/\*[^*]*\*?/g, " ");
  const a: Atributos = {};
  let m = d.match(/(\d+[.,]?\d*)\s?X\s?(\d+[.,]?\d*)(?:\s?X\s?(\d+[.,]?\d*))?\s?(CM|MM|MTS|M)\b/);
  if (m) {
    const partes = [m[1], m[2], m[3]].filter(Boolean).map((p) => numBr(p!));
    a.Medidas = `${partes.join(" x ")} ${m[4] === "MTS" ? "m" : m[4].toLowerCase()}`;
  } else {
    m = d.match(/(?<![\d/.,])(\d+[.,]?\d*)\s?(CM|MM)\b/);
    if (m) a.Tamanho = `${numBr(m[1])} ${m[2].toLowerCase()}`;
  }
  m = d.match(/(?<![\d/.,])(\d+[.,]?\d*)\s?(ML|LTS|LT|L)\b/);
  if (m) a.Capacidade = `${numBr(m[1])} ${m[2] === "ML" ? "ml" : "L"}`;
  m = d.match(/(?<![\d/.,])(\d+[.,]?\d*)\s?(KG|GR|G)\b/);
  if (m) a["Conteúdo"] = `${numBr(m[1])} ${m[2] === "KG" ? "kg" : "g"}`;
  m = d.match(/\b(127|220|110)\s?V\b|BIVOLT/);
  if (m) a.Voltagem = m[0].includes("BIVOLT") ? "Bivolt" : `${m[1]} V`;
  m = d.match(/C\/\s?(\d{2,5})\b(?!\s?(CM|MM|ML|L|LTS|KG|G)\b)/);
  if (m && Number(m[1]) > 1) a.Embalagem = `com ${Number(m[1]).toLocaleString("pt-BR")} unidades`;
  else {
    m = d.match(/\b(\d{1,3})\s?(PCS|PECAS|PÇS)\b/);
    if (m && Number(m[1]) > 1) a["Peças"] = `${Number(m[1])} peças`;
  }
  for (const [re, nome] of MATERIAIS) if (re.test(d)) { a.Material = nome; break; }
  for (const [re, nome] of CORES) if (re.test(d)) { a.Cor = nome; break; }
  return a;
}

const PARA_TIPO = new Set(["aco", "inox", "aluminio", "plastico", "plastica", "vidro", "porcelana", "ceramica", "madeira", "cristal", "com", "para", "sem", "em"]);
function tipo(nome: string, a: Atributos) {
  const pare = new Set([normalizar(a.Material ?? "").split(" ").pop() ?? "", normalizar(a.Cor ?? ""), normalizar(a.Marca ?? "#")]);
  const palavras: string[] = [];
  for (const w of nome.split(" ")) {
    const nw = normalizar(w);
    if (/^[\d"'(-]/.test(nw) || pare.has(nw) || PARA_TIPO.has(nw)) break;
    palavras.push(w);
    if (palavras.length === 4) break;
  }
  const t = palavras.join(" ") || nome.split(" ")[0];
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function descricao(nome: string, sub: string, a: Atributos, mk: string) {
  const frases: string[] = [];
  const det: string[] = [];
  if (a.Material) det.push(`em ${a.Material}`);
  if (a.Cor) det.push(`na cor ${a.Cor}`);
  if (a.Capacidade) det.push(`com capacidade de ${a.Capacidade}`);
  if (a.Medidas) det.push(`medindo ${a.Medidas}`);
  else if (a.Tamanho) det.push(`com ${a.Tamanho}`);
  if (det.length) frases.push(`${tipo(nome, a)} ${det.length > 1 ? det.slice(0, -1).join(", ") + " e " + det[det.length - 1] : det[0]}.`);
  frases.push(USO[sub] ?? "Produto disponível nas lojas Disk Marmitinha.");
  if (a.Embalagem) frases.push(`Vendido em embalagem ${a.Embalagem}.`);
  else if (a["Peças"]) frases.push(`Conjunto com ${a["Peças"]}.`);
  if (mk) frases.push(`Produto da marca ${mk}.`);
  return frases.join(" ");
}

function resumo(a: Atributos, mk: string) {
  for (const k of ["Embalagem", "Capacidade", "Medidas", "Tamanho", "Conteúdo", "Peças"] as const) {
    if (a[k]) return k === "Embalagem" ? `Embalagem ${a[k]}` : a[k]!;
  }
  if (a.Material) return a.Material.charAt(0).toUpperCase() + a.Material.slice(1);
  return mk || "Unidade";
}

// ---------------------------------------------------------------- saída

/** Formato gravado em produtos.json (chaves curtas para o arquivo ficar leve). */
export type ProdutoSite = { id: string; s: string; n: string; c: string; sc: string; d: string; r: string; e: [string, string][]; k: string };
export type CategoriaSite = { slug: string; nome: string; total: number; subcategorias: { slug: string; nome: string; total: number }[] };
export type Catalogo = {
  geradoEm: string;
  produtos: ProdutoSite[];
  categorias: CategoriaSite[];
  excluidos: { id: string; desc: string; motivo: string }[];
  semCategoria: { id: string; desc: string }[];
  lojas: { bh: number; ls: number; ambas: number };
};

export function gerarCatalogo(itens: ItemBase[]): Catalogo {
  const produtos: ProdutoSite[] = [];
  const excluidos: Catalogo["excluidos"] = [];
  const semCategoria: Catalogo["semCategoria"] = [];
  const subs = new Map<string, Map<string, { slug: string; nome: string; total: number }>>();
  const lojas = { bh: 0, ls: 0, ambas: 0 };

  for (const it of itens) {
    const motivo = motivoExclusao(it);
    if (motivo) {
      excluidos.push({ id: it.id, desc: it.desc, motivo });
      continue;
    }
    const [cat, sub] = ajustar(it.desc, ...categoria(it.desc, it.grupo));
    const cs = CAT_SLUG.get(cat);
    if (!cs) {
      semCategoria.push({ id: it.id, desc: it.desc });
      continue;
    }
    if (it.bh && it.ls) lojas.ambas++;
    else if (it.bh) lojas.bh++;
    else lojas.ls++;
    const nome = nomeAmigavel(it.desc);
    const mk = marca(it.desc);
    const a = atributos(it.desc);
    if (mk) a.Marca = mk;
    const ss = slugify(sub);
    if (!subs.has(cs)) subs.set(cs, new Map());
    const m = subs.get(cs)!;
    if (!m.has(ss)) m.set(ss, { slug: ss, nome: sub, total: 0 });
    m.get(ss)!.total++;
    const chave = Array.from(
      new Set(normalizar([nome, it.desc.replace(/\*/g, " "), cat, sub, mk, a.Material ?? "", a.Cor ?? "", it.id, it.ean].join(" ")).replace(/[/.,-]/g, " ").split(/\s+/).filter(Boolean)),
    ).join(" ");
    produtos.push({
      id: it.id,
      s: `${slugify(nome).slice(0, 70).replace(/-+$/, "")}-${it.id}`,
      n: nome,
      c: cs,
      sc: ss,
      d: descricao(nome, sub, a, mk),
      r: resumo(a, mk),
      e: (["Material", "Cor", "Capacidade", "Medidas", "Tamanho", "Conteúdo", "Peças", "Embalagem", "Voltagem", "Marca"] as const)
        .filter((k) => a[k])
        .map((k) => [k, a[k]!] as [string, string]),
      k: chave,
    });
  }

  const ordem = new Map(CATEGORIAS.map(([, s], i) => [s, i]));
  produtos.sort((x, y) => ordem.get(x.c)! - ordem.get(y.c)! || (x.sc < y.sc ? -1 : x.sc > y.sc ? 1 : 0) || (normalizar(x.n) < normalizar(y.n) ? -1 : normalizar(x.n) > normalizar(y.n) ? 1 : 0));
  const categorias = CATEGORIAS.map(([nome, slug]) => {
    const list = Array.from(subs.get(slug)?.values() ?? []).sort((a, b) => b.total - a.total);
    return { slug, nome, total: list.reduce((n, s) => n + s.total, 0), subcategorias: list };
  });
  return { geradoEm: new Date().toISOString(), produtos, categorias, excluidos, semCategoria, lojas };
}
