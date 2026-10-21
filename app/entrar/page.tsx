import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Área do cliente",
  description: "A área do cliente da Disk Marmitinha está em desenvolvimento e será lançada em breve.",
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <section className="container-site grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <p className="eyebrow text-gold-500">Em desenvolvimento</p>
        <h1 className="heading-lg mt-3 text-navy-800">Área do cliente em breve</h1>
        <p className="mx-auto mt-4 max-w-md text-[16px] text-ink-500">
          Estamos preparando um espaço exclusivo para você acompanhar seus pedidos e orçamentos. Enquanto isso, você pode
          explorar o catálogo ou solicitar um orçamento normalmente.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/catalogo" className="btn-primary">Ver catálogo</Link>
          <Link href="/orcamento" className="btn-outline">Solicitar orçamento</Link>
        </div>
      </div>
    </section>
  );
}
