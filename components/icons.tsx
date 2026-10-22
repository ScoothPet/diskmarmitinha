import {
  Bath,
  ChefHat,
  CookingPot,
  Flower2,
  LayoutGrid,
  Package,
  PawPrint,
  SprayCan,
  Sprout,
  TreePine,
  Utensils,
  Wine,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "@/lib/catalog";

const map: Record<IconKey, LucideIcon> = {
  "embalagens-e-descartaveis": Package,
  "utensilios-de-cozinha": Utensils,
  panelas: CookingPot,
  organizacao: LayoutGrid,
  "limpeza-e-higiene": SprayCan,
  "mesa-posta": Wine,
  decoracao: Flower2,
  "linha-industrial": ChefHat,
  jardinagem: Sprout,
  "casa-e-ferramentas": Wrench,
  "cama-mesa-e-banho": Bath,
  "lazer-infantil-e-pet": PawPrint,
  natal: TreePine,
};

export function CategoryIcon({ icon, className }: { icon: IconKey; className?: string }) {
  const Icon = map[icon];
  return <Icon aria-hidden="true" className={className} strokeWidth={1.5} />;
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 20.5l1.3-4A8.5 8.5 0 1 1 8 19.6l-4.5.9z" />
      <path d="M9.2 8.6c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.5.9 1.3 1.7 2.3 2.2.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.4.5 0 .5-.2 1.1-.6 1.4-.5.4-1.2.6-1.9.4-2.6-.7-4.6-2.7-5.4-5.2-.2-.8 0-1.6.5-2.3z" fill="currentColor" stroke="none" />
    </svg>
  );
}
