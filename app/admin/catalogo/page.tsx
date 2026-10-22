import type { Metadata } from "next";
import { CatalogUpload } from "./upload";

export const metadata: Metadata = {
  title: "Área restrita",
  robots: { index: false, follow: false },
};

export default function AdminCatalogPage() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container-site max-w-3xl">
        <h1 className="heading-lg text-navy-800">Área restrita</h1>
        <CatalogUpload />
      </div>
    </section>
  );
}
