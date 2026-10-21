import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Boxes,
  Building2,
  Car,
  Check,
  ClipboardList,
  MapPin,
  Search,
  Star,
  Truck,
} from "lucide-react";
import { categories } from "@/lib/catalog";
import { site, units, whatsappLink } from "@/lib/site";
import { CategoryCard, SectionHeading } from "@/components/ui";
import { WhatsAppIcon } from "@/components/icons";

const highlights = [
  { icon: BadgeCheck, title: "Qualidade", text: "Marcas confiáveis em cada linha" },
  { icon: Boxes, title: "Variedade", text: "Mais de 20 mil itens nas lojas" },
  { icon: ClipboardList, title: "Praticidade", text: "Orçamento direto pelo WhatsApp" },
  { icon: Car, title: "Estacionamento", text: "Nas duas unidades" },
  { icon: Truck, title: "Frete grátis", text: "A partir de R$ 150 em BH e região" },
];

const steps = [
  { n: "01", title: "Monte sua lista", text: "Navegue pelo catálogo ou escreva o que precisa. Não encontrou um item? Adicione mesmo assim." },
  { n: "02", title: "Escolha como receber", text: "Informe o CEP e o endereço para entrega ou escolha retirar em uma das lojas." },
  { n: "03", title: "Receba o orçamento", text: "Nossa equipe confere a disponibilidade e responde com valores e prazo pelo WhatsApp." },
];

const ambientes = [
  { title: "Cozinha completa", text: "Panelas, utensílios e louças para o dia a dia e para a cozinha profissional.", image: "/images/panelas.jpg", href: "/catalogo/cozinha" },
  { title: "Organização", text: "Potes, caixas e organizadores para geladeira, despensa e lavanderia.", image: "/images/organizadores.jpg", href: "/catalogo/organizacao" },
  { title: "Casa & estilo", text: "Cestos, mantas e peças de decoração que deixam a casa mais acolhedora.", image: "/images/toalhas.jpg", href: "/catalogo/decoracao" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy-900 text-white">
        <Image
          src="/images/unidade-lagoa-santa.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[60%_55%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,22,47,0.88)_0%,rgba(14,35,71,0.82)_55%,rgba(8,22,47,0.94)_100%)] lg:bg-[linear-gradient(90deg,rgba(8,22,47,0.95)_0%,rgba(14,35,71,0.86)_48%,rgba(14,35,71,0.45)_100%)]"
        />
        <div className="container-site grid gap-12 pt-16 pb-14 sm:pt-24 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-16 lg:pt-28 lg:pb-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[12px] font-semibold tracking-[0.16em] uppercase backdrop-blur">
              <MapPin aria-hidden="true" className="size-3.5 text-gold-300" />
              Belo Horizonte e Lagoa Santa
            </p>
            <h1 className="heading-xl mt-6 max-w-3xl text-balance">
              Tudo o que sua <strong className="font-bold">casa</strong> e sua <strong className="font-bold">empresa</strong> precisam, em um só lugar.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-mist-200 sm:text-[18px]">
              Embalagens, descartáveis, limpeza, utilidades e decoração com preço de atacarejo. Monte sua lista, peça o orçamento e receba onde estiver ou retire na loja. Frete grátis a partir de R$ 150 em BH e região.
            </p>

            <form action="/catalogo" method="get" role="search" className="mt-9 hidden max-w-xl items-center sm:flex gap-2 rounded-2xl bg-white p-2 shadow-lift">
              <label htmlFor="busca-home" className="sr-only">
                Buscar produto
              </label>
              <Search aria-hidden="true" className="ml-3 size-5 shrink-0 text-ink-500" />
              <input
                id="busca-home"
                name="q"
                type="search"
                placeholder="O que você procura?"
                className="min-h-12 w-full min-w-0 bg-transparent px-1 text-[15px] text-ink-900 placeholder:text-ink-500/80 focus:outline-none"
              />
              <button type="submit" className="btn-primary shrink-0 !px-5">
                Buscar
              </button>
            </form>

            <div className="mt-8 flex flex-wrap gap-3 sm:mt-6">
              <Link href="/orcamento" className="btn-light">
                Solicitar orçamento
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <a target="_blank" rel="noopener noreferrer" href={whatsappLink("Olá! Gostaria de um orçamento.")} className="btn-ghost-light">
                <WhatsAppIcon className="size-5" />
                Falar no WhatsApp
              </a>
            </div>
          </div>

          <div className="hidden rounded-3xl border border-white/15 bg-white/[0.07] p-7 backdrop-blur-md lg:block">
            <p className="eyebrow text-gold-300">Orçamento sem compromisso</p>
            <ul className="mt-5 grid gap-5">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="font-display text-[26px] leading-none font-semibold text-gold-300">{s.n}</span>
                  <span>
                    <span className="block font-semibold">{s.title}</span>
                    <span className="mt-1 block text-[14px] leading-relaxed text-mist-200">{s.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/catalogo" className="btn-light mt-7 w-full">
              Começar pelo catálogo
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 bg-navy-950/40 backdrop-blur">
          <dl className="container-site grid grid-cols-2 gap-x-6 gap-y-5 py-7 sm:grid-cols-4">
            {[
              ["Desde", "1990"],
              ["Mais de", "20 mil itens"],
              ["Lojas", "BH e Lagoa Santa"],
              ["Entrega", "Todo o Brasil"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] tracking-[0.14em] text-mist-300 uppercase">{k}</dt>
                <dd className="mt-1 font-display text-[24px] leading-tight font-semibold sm:text-[28px]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Diferenciais */}
      <section aria-label="Diferenciais" className="border-b border-mist-200 bg-white">
        {/* Celular: carrossel vertical animado */}
        <div className="container-site py-6 sm:hidden">
          <div className="ticker-window relative h-[84px] overflow-hidden rounded-2xl border border-mist-200 bg-mist-50 motion-reduce:h-auto">
            <ul className="animate-ticker-y motion-reduce:animate-none">
              {[...highlights, ...highlights].map(({ icon: Icon, title, text }, i) => (
                <li
                  key={`${title}-${i}`}
                  aria-hidden={i >= highlights.length ? true : undefined}
                  className={`flex h-[84px] items-center gap-4 px-5 ${i >= highlights.length ? "motion-reduce:hidden" : ""}`}
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-navy-800 text-white">
                    <Icon aria-hidden="true" className="size-6" strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[16px] font-semibold text-navy-800">{title}</span>
                    <span className="block text-[14px] leading-snug text-ink-500">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tablet e desktop */}
        <ul className="container-site hidden gap-6 py-10 sm:grid sm:grid-cols-2 lg:grid-cols-5">
          {highlights.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mist-100 text-navy-800">
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.6} />
              </span>
              <span>
                <span className="block text-[15px] font-semibold text-navy-800">{title}</span>
                <span className="block text-[13px] text-ink-500">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Categorias */}
      <section className="bg-mist-50 py-20 sm:py-28">
        <div className="container-site">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Catálogo"
              title={<>Escolha por <strong className="font-semibold">categoria</strong></>}
              description="As principais linhas das nossas lojas. Adicione os itens à sua lista e peça o orçamento de uma vez."
            />
            <Link href="/catalogo" className="btn-outline shrink-0">
              Ver catálogo completo
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {categories.map((c) => (
              <CategoryCard key={c.slug} category={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Ambientes */}
      <section className="py-20 sm:py-28">
        <div className="container-site">
          <SectionHeading
            eyebrow="Casa & Estilo"
            title={<>Muito além das <strong className="font-semibold">embalagens</strong></>}
            description="A marca nasceu como fábrica de marmitex e hoje reúne utilidades, organização e decoração para todos os cômodos da casa."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {ambientes.map((a) => (
              <Link key={a.title} href={a.href} className="group relative block overflow-hidden rounded-3xl bg-navy-900">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={a.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/25 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                  <h3 className="font-display text-[28px] leading-tight font-semibold">{a.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-mist-200">{a.text}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-gold-300">
                    Explorar
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Empresas */}
      <section className="relative overflow-hidden bg-navy-800 py-20 text-white sm:py-28">
        <div aria-hidden="true" className="absolute -right-32 -bottom-32 size-[520px] rounded-full bg-navy-700/60 blur-3xl" />
        <div className="container-site relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              light
              eyebrow="Empresas, restaurantes e condomínios"
              title={<>Abasteça o seu <strong className="font-semibold">negócio</strong> com condições de atacado</>}
              description="Marmitarias, restaurantes, lanchonetes, escolas, eventos e condomínios encontram embalagens, descartáveis, limpeza e lixeiras em um só fornecedor."
            />
            <ul className="mt-8 grid gap-4">
              {[
                "Atendimento dedicado para compras recorrentes",
                "Lista completa enviada de uma vez pelo WhatsApp",
                "Coleta seletiva e lixeiras para áreas comuns",
                "Frete grátis a partir de R$ 150 em BH e região (consulte as condições)",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-[16px]">
                  <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-gold-300" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/empresas" className="btn-light">
                <Building2 aria-hidden="true" className="size-4" />
                Atendimento para empresas
              </Link>
              <Link href="/orcamento" className="btn-ghost-light">
                Montar lista de compras
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image src="/images/unidade-belo-horizonte.jpg" alt="Fachada da unidade Belo Horizonte da Disk Marmitinha" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 left-6 max-w-[260px] rounded-2xl bg-white p-5 text-ink-900 shadow-lift sm:left-8">
              <p className="font-display text-[34px] leading-none font-semibold text-navy-800">+20 mil</p>
              <p className="mt-1 text-[14px] text-ink-500">itens para reposição, organização e estrutura do seu negócio</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 sm:py-28">
        <div className="container-site">
          <SectionHeading
            eyebrow="Como funciona"
            title={<>Seu orçamento em <strong className="font-semibold">três passos</strong></>}
            description="Sem cadastro e sem pagamento pelo site. Você recebe os valores e combina tudo com a nossa equipe."
          />
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="card relative p-8">
                <span className="font-display text-[48px] leading-none font-semibold text-mist-300">{s.n}</span>
                <h3 className="heading-md mt-6 text-navy-800">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-500">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/catalogo" className="btn-primary">
              Começar minha lista
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <a target="_blank" rel="noopener noreferrer" href={whatsappLink("Olá! Quero enviar minha lista de compras.")} className="btn-outline">
              Prefiro mandar a lista pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* História */}
      <section className="bg-mist-50 py-20 sm:py-28">
        <div className="container-site grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="relative aspect-[682/332] overflow-hidden rounded-3xl">
              <Image
                src="/images/historia-1990.jpg"
                alt="Foto antiga da família e da equipe na primeira loja da Disk Marmitinha"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-2xl bg-navy-800 px-6 py-5 text-white">
              <p className="font-display text-[30px] leading-none font-semibold sm:text-[32px]">Desde {site.since}</p>
              <p className="text-[14px] text-mist-200">Mais de 30 anos de confiança e tradição</p>
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Nossa história"
              title={<>De fábrica de marmitex a <strong className="font-semibold">casa & estilo</strong></>}
            />
            <p className="mt-6 text-[16px] leading-relaxed text-ink-700">
              Tudo começou em 1990, quando o Sr. José Ferreira deixou o interior de Minas em busca de novas oportunidades na capital. Ao lado da esposa, Maria de Fátima, construiu uma trajetória de muito trabalho.
            </p>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-700">
              A marca nasceu fabricando marmitex e o nome ficou conhecido em toda a região. Hoje somos um atacarejo completo, com duas lojas e um mix que vai das embalagens à decoração.
            </p>
            <Link href="/quem-somos" className="btn-outline mt-8">
              Conheça nossa história
            </Link>
          </div>
        </div>
      </section>

      {/* Unidades */}
      <section className="py-20 sm:py-28">
        <div className="container-site">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Nossas lojas"
              title={<>Duas unidades para <strong className="font-semibold">atender você</strong></>}
              description={`Estacionamento para clientes nas duas lojas. ${site.hoursShort}.`}
            />
            <Link href="/unidades" className="btn-outline shrink-0">
              Ver unidades e mapas
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {units.map((u) => (
              <article key={u.id} className="card overflow-hidden">
                <div className="relative aspect-[16/10]">
                  <Image src={u.image} alt={u.imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-[30px] leading-tight font-semibold text-navy-800">{u.name}</h3>
                      <p className="mt-1 text-[14px] text-ink-500">
                        {u.street}, {u.cityLine}
                      </p>
                    </div>
                    <p className="flex items-center gap-1.5 rounded-full bg-mist-100 px-3 py-1.5 text-[13px] font-semibold text-navy-800">
                      <Star aria-hidden="true" className="size-4 fill-gold-500 text-gold-500" />
                      {u.rating.value} no Google
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href={u.mapsUrl} className="btn-primary" target="_blank" rel="noopener noreferrer">
                      <MapPin aria-hidden="true" className="size-4" />
                      Como chegar
                    </a>
                    <a href={whatsappLink(`Olá! Tenho uma dúvida sobre a loja de ${u.name}.`, u.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn-outline">
                      WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Avaliações + Instagram */}
      <section className="pb-20 sm:pb-28">
        <div className="container-site grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-mist-200 bg-mist-50 p-8 sm:p-10">
            <p className="eyebrow text-gold-500">Quem compra recomenda</p>
            <h2 className="heading-md mt-3 text-navy-800">Avaliações no Google</h2>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {units.map((u) => (
                <div key={u.id} className="rounded-2xl bg-white p-6">
                  <p className="font-display text-[48px] leading-none font-semibold text-navy-800">{u.rating.value}</p>
                  <p className="mt-2 flex gap-0.5" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="size-4 fill-gold-500 text-gold-500" />
                    ))}
                  </p>
                  <p className="mt-3 text-[14px] font-semibold text-ink-900">{u.name}</p>
                  <p className="text-[13px] text-ink-500">{u.rating.count} avaliações</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[14px] text-ink-500">Variedade, preço justo e atendimento atencioso são os pontos mais citados pelos clientes.</p>
          </div>
          <div className="flex flex-col justify-between rounded-3xl bg-navy-900 p-8 text-white sm:p-10">
            <div>
              <p className="eyebrow text-gold-300">Acompanhe</p>
              <h2 className="heading-md mt-3">Novidades e ideias no Instagram</h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-mist-200">
                Lançamentos, dicas de organização e sugestões para a casa e para o seu negócio. Mais de 6,5 mil pessoas já acompanham.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={site.instagram.url} className="btn-light" target="_blank" rel="noopener noreferrer">
                Seguir {site.instagram.handle}
              </a>
              <a target="_blank" rel="noopener noreferrer" href={whatsappLink()} className="btn-ghost-light">
                Chamar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
