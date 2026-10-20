import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-site grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <p className="eyebrow text-gold-500">Página não encontrada</p>
        <h1 className="heading-lg mt-3 text-navy-800">Não encontramos esta página</h1>
        <p className="mx-auto mt-4 max-w-md text-[16px] text-ink-500">O endereço pode ter mudado. Volte para o início ou explore o catálogo.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Ir para o início</Link>
          <Link href="/catalogo" className="btn-outline">Ver catálogo</Link>
        </div>
      </div>
    </section>
  );
}
