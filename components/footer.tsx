import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/catalog";
import { site, units, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-mist-200">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:py-20">
        <div>
          <Image
            src="/images/logo-disk-marmitinha-branco.svg"
            alt="Disk Marmitinha casa & estilo"
            width={1520}
            height={292}
            className="h-10 w-auto"
          />
          <p className="mt-6 max-w-xs text-[14px] leading-relaxed text-mist-300">
            Atacarejo de embalagens e utilidades desde {site.since}. Tudo para sua casa, sua empresa e seu condomínio.
          </p>
          <a href={site.instagram.url} className="mt-6 inline-block text-[14px] font-semibold text-white hover:text-gold-300">
            Instagram {site.instagram.handle}
          </a>
        </div>

        <div>
          <h2 className="eyebrow text-gold-300">Catálogo</h2>
          <ul className="mt-5 grid gap-2.5 text-[14px]">
            {categories.slice(0, 7).map((c) => (
              <li key={c.slug}>
                <Link href={`/catalogo/${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/catalogo" className="font-semibold text-white hover:text-gold-300">
                Ver todas as categorias
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-gold-300">Institucional</h2>
          <ul className="mt-5 grid gap-2.5 text-[14px]">
            <li><Link href="/quem-somos" className="hover:text-white">Quem somos</Link></li>
            <li><Link href="/empresas" className="hover:text-white">Empresas e condomínios</Link></li>
            <li><Link href="/orcamento" className="hover:text-white">Solicitar orçamento</Link></li>
            <li><Link href="/unidades" className="hover:text-white">Unidades</Link></li>
            <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-gold-300">Atendimento</h2>
          <ul className="mt-5 grid gap-2.5 text-[14px]">
            <li><a href={whatsappLink()} className="hover:text-white">WhatsApp {site.whatsapp.display}</a></li>
            <li><a href={`mailto:${site.email}`} className="break-all hover:text-white">{site.email}</a></li>
            {site.hours.map((h) => (
              <li key={h.label} className="text-mist-300">
                {h.label}: {h.value}
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3 text-[13px] text-mist-300">
            {units.map((u) => (
              <p key={u.id}>
                <span className="font-semibold text-white">{u.name}</span>
                <br />
                {u.street}, {u.cityLine}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-6 text-[13px] text-mist-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Todos os direitos reservados.</p>
          <p>Preços e disponibilidade confirmados no orçamento.</p>
        </div>
      </div>
    </footer>
  );
}
