import { MessageCircle } from "lucide-react";
import { INSTAGRAM_DM_URL, whatsappLink } from "@/lib/social";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Besichtigung ohne Telefonat anfragen: WhatsApp mit vorbereitetem Text oder Instagram-Nachricht. */
export function ContactChannels({ title, url }: { title: string; url: string }) {
  const hasWhatsapp = Boolean(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  return (
    <div className="mt-5">
      <p className="text-xs text-ivory-dim">Lieber schreiben statt anrufen?</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {hasWhatsapp && (
          <a
            href={whatsappLink(`Hallo NoviDom, ich möchte «${title}» besichtigen. Wann passt es? ${url}`)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 py-3 text-sm font-semibold text-white hover:brightness-95"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} />
            Per WhatsApp anfragen
          </a>
        )}
        <a
          href={INSTAGRAM_DM_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ivory hover:border-ivory"
        >
          <InstagramIcon className="h-4 w-4" />
          Instagram-Nachricht
        </a>
      </div>
    </div>
  );
}
