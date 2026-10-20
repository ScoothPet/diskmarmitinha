import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("Olá! Vim pelo site da Disk Marmitinha.")}
      aria-label="Falar no WhatsApp"
      className="fixed right-4 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-50 grid size-14 place-items-center rounded-full bg-whats-600 text-white shadow-lift transition-transform hover:scale-105 hover:bg-whats-700 sm:right-6 sm:size-[60px]"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
