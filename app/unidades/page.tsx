import type { Metadata } from "next";
import Image from "next/image";
import { Car, Clock, MapPin, Phone, Star } from "lucide-react";
import { PageHero } from "@/components/ui";
import { WhatsAppIcon } from "@/components/icons";
import { site, telLink, units, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Unidades",
  description: "Lojas da Disk Marmitinha em Belo Horizonte (Candelária) e Lagoa Santa, com estacionamento para clientes.",
};

export default function UnitsPage() {
  return (
    <>
      <PageHero
        eyebrow="Nossas lojas"
        title="Duas unidades com estacionamento para clientes"
        description="Visite a loja mais perto de você ou faça seu pedido online para entrega ou retirada."
      />
      <section className="py-14 sm:py-20">
        <div className="container-site grid gap-16">
          {units.map((u, i) => (
            <article key={u.id} className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
              <div className={`relative min-h-[320px] overflow-hidden rounded-3xl ${i % 2 ? "lg:order-2" : ""}`}>
                <Image src={u.image} alt={u.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-col">
                <p className="eyebrow text-gold-500">Unidade</p>
                <h2 className="heading-lg mt-2 text-navy-800">{u.name}</h2>
                <ul className="mt-6 grid gap-4 text-[15px] text-ink-700">
                  <li className="flex gap-3">
                    <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-navy-800" />
                    <span>
                      {u.street}
                      <br />
                      {u.cityLine}
                      {u.cep ? ` · CEP ${u.cep}` : ""}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-navy-800" />
                    <span>
                      {site.hours.map((h) => (
                        <span key={h.label} className="block">
                          {h.label}: {h.value}
                        </span>
                      ))}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-navy-800" />
                    <a href={telLink} className="hover:text-navy-800 hover:underline">
                      Telefone {site.phone.display}
                    </a>
                  </li>
                  <li className="flex gap-3">
                    <Car aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-navy-800" />
                    Estacionamento para clientes
                  </li>
                  <li className="flex gap-3">
                    <Star aria-hidden="true" className="mt-0.5 size-5 shrink-0 fill-gold-500 text-gold-500" />
                    {u.rating.value} no Google · {u.rating.count} avaliações
                  </li>
                </ul>
                <div className="mt-8 overflow-hidden rounded-2xl border border-mist-200">
                  <iframe
                    title={`Mapa da unidade ${u.name}`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(u.embedQuery)}&output=embed`}
                    className="h-64 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={u.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    <MapPin aria-hidden="true" className="size-4" />
                    Como chegar
                  </a>
                  <a href={whatsappLink(`Olá! Tenho uma dúvida sobre a loja de ${u.name}.`, u.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn-outline">
                    <WhatsAppIcon className="size-5" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
