import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { PageHero } from "@/components/ui";
import { WhatsAppIcon } from "@/components/icons";
import { site, units, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Disk Marmitinha pelo WhatsApp (31) 99840-2889 ou pelo e-mail loja01@diskmarmitinha.com.br.",
};

export default function ContactPage() {
  const items = [
    { icon: WhatsAppIcon, label: "WhatsApp", value: site.whatsapp.display, href: whatsappLink() },
    { icon: Mail, label: "E-mail", value: site.email, href: `mailto:${site.email}` },
    { icon: Clock, label: "Horário das lojas", value: site.hoursShort },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contato"
        title="Fale com a Disk Marmitinha"
        description="Tire dúvidas, consulte a disponibilidade de um produto ou envie sua lista. Respondemos em horário comercial."
      />
      <section className="py-14 sm:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <ul className="grid gap-6">
              {items.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-mist-100 text-navy-800">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-ink-500">{label}</span>
                    {href ? (
                      <a href={href} className="block break-all text-[18px] font-semibold text-navy-800 hover:underline">
                        {value}
                      </a>
                    ) : (
                      <span className="block text-[17px] font-semibold text-navy-800">{value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {units.map((u) => (
                <a key={u.id} href={u.mapsUrl} target="_blank" rel="noopener noreferrer" className="card block p-5 transition-colors hover:border-navy-800">
                  <MapPin aria-hidden="true" className="size-5 text-navy-800" />
                  <p className="mt-3 font-semibold text-navy-800">{u.name}</p>
                  <p className="mt-1 text-[13px] text-ink-500">
                    {u.street}, {u.cityLine}
                  </p>
                </a>
              ))}
            </div>
          </div>
          <LeadForm variant="contato" />
        </div>
      </section>
    </>
  );
}
