export type IconKey =
  | "embalagens-e-descartaveis"
  | "utensilios-de-cozinha"
  | "panelas"
  | "organizacao"
  | "limpeza-e-higiene"
  | "mesa-posta"
  | "decoracao"
  | "linha-industrial"
  | "jardinagem"
  | "casa-e-ferramentas"
  | "cama-mesa-e-banho"
  | "lazer-infantil-e-pet"
  | "natal";

export type Subcategory = { slug: string; name: string };

export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: IconKey;
  image?: string;
};

/** Produto como aparece em listas e cards (sem descrição longa nem índice de busca). */
export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  subcategoryName: string;
  spec: string;
};

export type Product = ProductSummary & {
  description: string;
  specs: [string, string][];
};

const textos: Record<string, { description: string; image?: string }> = {
  "embalagens-e-descartaveis": {
    description: "Marmitas, potes, copos, pratos, sacos, sacolas, sachês e embalagens para presente, para o comércio e para eventos.",
  },
  "utensilios-de-cozinha": {
    description: "Facas, tábuas, utensílios, confeitaria, churrasco e eletroportáteis para casa e cozinha profissional.",
    image: "/images/cozinha-panela.jpg",
  },
  panelas: {
    description: "Panelas, frigideiras, assadeiras e formas para o dia a dia e para a produção de alimentos.",
    image: "/images/panelas.jpg",
  },
  organizacao: {
    description: "Potes, caixas, cestos e organizadores para cozinha, despensa, armários e lavanderia.",
    image: "/images/organizadores.jpg",
  },
  "limpeza-e-higiene": {
    description: "Produtos e utensílios de limpeza, lixeiras e itens de lavanderia para casas, empresas e condomínios.",
  },
  "mesa-posta": {
    description: "Pratos, copos, taças, talheres, itens de café e acessórios para servir bem no dia a dia.",
    image: "/images/mesa-posta.jpg",
  },
  decoracao: {
    description: "Vasos decorativos, objetos, aromas, velas, tapetes e têxteis para dar estilo à casa.",
    image: "/images/manta.jpg",
  },
  "linha-industrial": {
    description: "Linha para restaurantes, escolas, hotéis e comércios: cozinha profissional, food service e EPI.",
  },
  jardinagem: {
    description: "Vasos e jardineiras, adubos e substratos, rega, ferramentas e plantas artificiais.",
  },
  "casa-e-ferramentas": {
    description: "Ferramentas, hidráulica, elétrica, fitas, proteção de móveis, sinalização e papelaria.",
  },
  "cama-mesa-e-banho": {
    description: "Itens de banho e enxoval para deixar a casa mais confortável.",
    image: "/images/toalhas.jpg",
  },
  "lazer-infantil-e-pet": {
    description: "Guarda-chuvas, piscina, camping, móveis de área externa, itens infantis, jogos e pet.",
  },
  natal: {
    description: "Enfeites, árvores, luzes e decoração de Natal para casas, lojas e empresas.",
  },
};

const ORDEM: [string, string][] = [
  ["embalagens-e-descartaveis", "Embalagens e Descartáveis"],
  ["utensilios-de-cozinha", "Utensílios de Cozinha"],
  ["panelas", "Panelas"],
  ["organizacao", "Organização"],
  ["limpeza-e-higiene", "Limpeza e Higiene"],
  ["mesa-posta", "Mesa Posta"],
  ["decoracao", "Decoração"],
  ["linha-industrial", "Linha Industrial"],
  ["jardinagem", "Jardinagem"],
  ["casa-e-ferramentas", "Casa e Ferramentas"],
  ["cama-mesa-e-banho", "Cama, Mesa e Banho"],
  ["lazer-infantil-e-pet", "Lazer, Infantil e Pet"],
  ["natal", "Natal"],
];

export const categories: Category[] = ORDEM.map(([slug, name]) => ({
  slug,
  name,
  description: textos[slug]?.description ?? "",
  image: textos[slug]?.image,
  icon: slug as IconKey,
}));

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export const PAGE_SIZE = 24;

export type SearchResult = { items: ProductSummary[]; total: number; page: number; pages: number; pageSize: number; approximate: boolean };
