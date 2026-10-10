import Image from "next/image";

/** Offizielles NoviDom-Logo (Schlüssel + Wortmarke «Immobilien & Beratung»). */
export function Logo({ className = "h-9 w-auto", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/novidom-logo.png"
      alt="NoviDom Immobilien & Beratung"
      width={760}
      height={220}
      preload={priority}
      className={className}
    />
  );
}
