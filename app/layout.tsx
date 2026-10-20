import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { QuoteProvider } from "@/components/quote-provider";
import { site, units } from "@/lib/site";

const montserrat = localFont({
  src: "./fonts/montserrat-latin-wght-normal.woff2",
  variable: "--font-montserrat",
  weight: "100 900",
  display: "swap",
});
const barlow = localFont({
  src: [
    { path: "./fonts/barlow-semi-condensed-latin-300-normal.woff2", weight: "300" },
    { path: "./fonts/barlow-semi-condensed-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/barlow-semi-condensed-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/barlow-semi-condensed-latin-600-normal.woff2", weight: "600" },
    { path: "./fonts/barlow-semi-condensed-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-barlow",
  display: "swap",
});

const indexable = process.env.NEXT_PUBLIC_INDEXABLE === "true";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Disk Marmitinha Casa & Estilo | Embalagens, descartáveis e utilidades em BH e Lagoa Santa",
    template: "%s | Disk Marmitinha Casa & Estilo",
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.name,
    title: "Disk Marmitinha Casa & Estilo",
    description: site.description,
    images: [{ url: "/images/unidade-lagoa-santa.jpg", width: 1500, height: 1280, alt: "Fachada da Disk Marmitinha em Lagoa Santa" }],
  },
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#16336A",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": units.map((u) => ({
    "@type": "Store",
    name: `${site.shortName} ${u.name}`,
    image: `${site.url}${u.image}`,
    telephone: "+55 31 99840-2889",
    email: site.email,
    url: site.url,
    address: {
      "@type": "PostalAddress",
      streetAddress: u.street,
      addressLocality: u.id === "bh" ? "Belo Horizonte" : "Lagoa Santa",
      addressRegion: "MG",
      postalCode: u.cep,
      addressCountry: "BR",
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "14:00" },
    ],
    aggregateRating: { "@type": "AggregateRating", ratingValue: u.rating.value.replace(",", "."), reviewCount: u.rating.count },
  })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${barlow.variable}`}>
      <body>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-navy-800">
          Pular para o conteúdo
        </a>
        <QuoteProvider>
          <Header />
          <main id="conteudo">{children}</main>
          <Footer />
          <WhatsAppFab />
        </QuoteProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
