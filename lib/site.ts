export const site = {
  name: "Disk Marmitinha Casa & Estilo",
  shortName: "Disk Marmitinha",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://diskmarmitinha.com.br",
  description:
    "Atacarejo de embalagens, descartáveis, limpeza e utilidades para casa, empresas e condomínios. Lojas em Belo Horizonte e Lagoa Santa, com entrega para todo o Brasil.",
  whatsapp: {
    display: "(31) 99840-2889",
    number: "5531998402889",
  },
  email: "loja01@diskmarmitinha.com.br",
  instagram: {
    handle: "@diskmarmitinha",
    url: "https://www.instagram.com/diskmarmitinha",
  },
  facebook: {
    name: "Disk Marmitinha Casa & Estilo",
    url: "https://www.facebook.com/p/Disk-Marmitinha-Casa-Estilo-100076353576100/",
  },
  hours: [
    { label: "Segunda a sexta", value: "8h às 18h" },
    { label: "Sábado", value: "8h às 14h" },
    { label: "Domingo", value: "Fechado" },
  ],
  hoursShort: "Seg a sex 8h às 18h · Sáb 8h às 14h",
  since: 1990,
};

export type Unit = {
  id: "bh" | "ls";
  name: string;
  district: string;
  street: string;
  cityLine: string;
  cep?: string;
  mapsUrl: string;
  embedQuery: string;
  image: string;
  imageAlt: string;
  rating: { value: string; count: number };
};

export const units: Unit[] = [
  {
    id: "bh",
    name: "Belo Horizonte",
    district: "Candelária",
    street: "R. Érico Veríssimo, 554",
    cityLine: "Candelária, Belo Horizonte - MG",
    cep: "31520-240",
    mapsUrl: "https://maps.app.goo.gl/VqAZncoaUBVojMFw6",
    embedQuery: "Disk Marmitinha, R. Érico Veríssimo, 554 - Candelária, Belo Horizonte - MG",
    image: "/images/unidade-belo-horizonte.jpg",
    imageAlt: "Fachada da unidade Belo Horizonte da Disk Marmitinha ao entardecer",
    rating: { value: "4,2", count: 75 },
  },
  {
    id: "ls",
    name: "Lagoa Santa",
    district: "Santos Dumont",
    street: "Av. Acadêmico Nilo Figueiredo, 2700",
    cityLine: "Santos Dumont, Lagoa Santa - MG",
    mapsUrl: "https://maps.app.goo.gl/tdT3WZzEEvxAJteQ6",
    embedQuery: "Disk Marmitinha, Av. Acadêmico Nilo Figueiredo, 2700 - Santos Dumont, Lagoa Santa - MG",
    image: "/images/unidade-lagoa-santa.jpg",
    imageAlt: "Fachada da unidade Lagoa Santa da Disk Marmitinha",
    rating: { value: "4,5", count: 68 },
  },
];

export const nav = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/empresas", label: "Empresas e condomínios" },
  { href: "/quem-somos", label: "Quem somos" },
  { href: "/unidades", label: "Unidades" },
  { href: "/ajuda", label: "Ajuda" },
  { href: "/contato", label: "Contato" },
];

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsapp.number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoLink(subject: string, body: string) {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
