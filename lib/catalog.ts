export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: IconKey;
  image?: string;
};

export type IconKey =
  | "descartaveis"
  | "embalagens"
  | "limpeza"
  | "higiene"
  | "duraveis"
  | "papelaria"
  | "churrasco"
  | "organizacao"
  | "cozinha"
  | "mesa-posta"
  | "decoracao"
  | "lixeiras";

export type Product = {
  id: string;
  name: string;
  category: string;
  spec: string;
  audience?: "Casa" | "Negócio" | "Casa e negócio";
};

export const categories: Category[] = [
  { slug: "descartaveis", name: "Descartáveis", description: "Copos, pratos, talheres, guardanapos e itens para festas e eventos.", icon: "descartaveis" },
  { slug: "embalagens", name: "Embalagens", description: "Marmitex, potes, sacolas e caixas para delivery e comércio.", icon: "embalagens" },
  { slug: "limpeza", name: "Limpeza", description: "Produtos e utensílios para limpeza de casas, empresas e condomínios.", icon: "limpeza" },
  { slug: "higiene-e-protecao", name: "Higiene Pessoal e Proteção", description: "Papel, luvas, toucas e itens de cuidado e segurança.", icon: "higiene" },
  { slug: "duraveis", name: "Duráveis", description: "Garrafas, jarras, potes e utilidades feitas para durar.", icon: "duraveis" },
  { slug: "papelaria", name: "Papelaria", description: "Material para escritório, escola e para a rotina da loja.", icon: "papelaria" },
  { slug: "churrasco", name: "Churrasco", description: "Carvão, espetos, tábuas e acessórios para o churrasco.", icon: "churrasco" },
  { slug: "organizacao", name: "Organização", description: "Caixas, cestos e organizadores para cada ambiente.", icon: "organizacao", image: "/images/organizadores.jpg" },
  { slug: "cozinha", name: "Cozinha", description: "Panelas, utensílios e louças para casa e cozinha industrial.", icon: "cozinha", image: "/images/panelas.jpg" },
  { slug: "mesa-posta", name: "Mesa Posta", description: "Pratos, copos, jogos americanos e peças para receber bem.", icon: "mesa-posta", image: "/images/mesa-posta.jpg" },
  { slug: "decoracao", name: "Decoração", description: "Cestos, mantas, vasos e peças para dar estilo à casa.", icon: "decoracao", image: "/images/manta.jpg" },
  { slug: "lixeiras", name: "Lixeiras", description: "Lixeiras, coletores e sacos para todos os ambientes.", icon: "lixeiras" },
];

const raw: [string, string, string, Product["audience"]][] = [
  ["Copo descartável 200 ml", "descartaveis", "Pacote com 100 unidades", "Casa e negócio"],
  ["Prato descartável raso 21 cm", "descartaveis", "Pacote com 10 unidades", "Casa e negócio"],
  ["Kit talher descartável 3 em 1", "descartaveis", "Caixa com 100 kits", "Negócio"],
  ["Guardanapo de papel 30 x 30 cm", "descartaveis", "Pacote com 50 folhas", "Casa e negócio"],

  ["Marmitex de isopor 750 ml", "embalagens", "Pacote com 100 unidades", "Negócio"],
  ["Marmitex de alumínio nº 8", "embalagens", "Caixa com 100 unidades", "Negócio"],
  ["Pote redondo com tampa 500 ml", "embalagens", "Pacote com 25 unidades", "Negócio"],
  ["Sacola plástica reforçada 40 x 50 cm", "embalagens", "Pacote com 1 kg", "Negócio"],

  ["Detergente neutro 5 L", "limpeza", "Galão de 5 litros", "Casa e negócio"],
  ["Desinfetante concentrado 2 L", "limpeza", "Frasco de 2 litros", "Casa e negócio"],
  ["Pano multiuso em rolo", "limpeza", "Rolo com 300 panos", "Negócio"],
  ["Rodo de alumínio 60 cm", "limpeza", "Unidade", "Casa e negócio"],

  ["Papel higiênico folha dupla", "higiene-e-protecao", "Fardo com 64 rolos", "Casa e negócio"],
  ["Luva de procedimento", "higiene-e-protecao", "Caixa com 100 unidades", "Negócio"],
  ["Touca descartável sanfonada", "higiene-e-protecao", "Pacote com 100 unidades", "Negócio"],
  ["Papel toalha interfolhado", "higiene-e-protecao", "Fardo com 1.000 folhas", "Negócio"],

  ["Garrafa térmica 1 L", "duraveis", "Unidade", "Casa"],
  ["Jarra de vidro 1,5 L", "duraveis", "Unidade", "Casa"],
  ["Pote hermético de vidro 1 L", "duraveis", "Unidade", "Casa"],
  ["Bandeja retangular de inox", "duraveis", "Unidade", "Casa e negócio"],

  ["Caderno universitário 10 matérias", "papelaria", "Unidade", "Casa"],
  ["Fita adesiva transparente 45 mm", "papelaria", "Pacote com 6 rolos", "Negócio"],
  ["Bobina para máquina de cartão", "papelaria", "Caixa com 30 bobinas", "Negócio"],
  ["Etiqueta adesiva para preço", "papelaria", "Rolo com 1.000 etiquetas", "Negócio"],

  ["Carvão vegetal 3 kg", "churrasco", "Saco de 3 kg", "Casa"],
  ["Espeto de aço inox 65 cm", "churrasco", "Unidade", "Casa"],
  ["Tábua de corte em madeira", "churrasco", "Unidade", "Casa"],
  ["Kit churrasco com faca e garfo", "churrasco", "Kit com 2 peças", "Casa"],

  ["Caixa organizadora 30 L", "organizacao", "Unidade", "Casa"],
  ["Organizador de geladeira", "organizacao", "Unidade", "Casa"],
  ["Cesto organizador em fibra", "organizacao", "Unidade", "Casa"],
  ["Porta-temperos giratório", "organizacao", "Unidade", "Casa"],

  ["Panela de pressão 20 L", "cozinha", "Unidade", "Negócio"],
  ["Jogo de panelas antiaderente", "cozinha", "Jogo com 5 peças", "Casa"],
  ["Kit utensílios de silicone", "cozinha", "Kit com 5 peças", "Casa"],
  ["Escorredor de louça em aço", "cozinha", "Unidade", "Casa"],

  ["Aparelho de jantar 20 peças", "mesa-posta", "Jogo", "Casa"],
  ["Jogo de taças de cristal", "mesa-posta", "Caixa com 6 unidades", "Casa"],
  ["Jogo americano trançado", "mesa-posta", "Kit com 4 unidades", "Casa"],
  ["Faqueiro de inox 24 peças", "mesa-posta", "Estojo", "Casa"],

  ["Manta decorativa de algodão", "decoracao", "Unidade", "Casa"],
  ["Vaso decorativo de cerâmica", "decoracao", "Unidade", "Casa"],
  ["Cesto de corda com alças", "decoracao", "Unidade", "Casa"],
  ["Fruteira de fibra natural", "decoracao", "Unidade", "Casa"],

  ["Lixeira com pedal 12 L", "lixeiras", "Unidade", "Casa"],
  ["Lixeira de inox 30 L", "lixeiras", "Unidade", "Casa e negócio"],
  ["Kit coleta seletiva 4 cores", "lixeiras", "Kit com 4 lixeiras", "Negócio"],
  ["Saco de lixo 100 L reforçado", "lixeiras", "Pacote com 100 unidades", "Negócio"],
];

export const products: Product[] = raw.map(([name, category, spec, audience], i) => ({
  id: `p${String(i + 1).padStart(3, "0")}`,
  name,
  category,
  spec,
  audience,
}));

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function productsByCategory(slug: string) {
  return products.filter((p) => p.category === slug);
}

export function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
