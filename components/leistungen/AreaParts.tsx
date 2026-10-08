"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, Phone, Plus } from "lucide-react";
import { AREAS, areaHref, type AreaId } from "@/components/novidom360/areas";
import { AreaPanel } from "@/components/novidom360/AreaPanels";
import type { AreaContact } from "@/components/novidom360/areaContent";

/** Der interaktive Teil (Stepper, Rechner, Vorher/Nachher) als Karte auf der Bereichsseite. */
export function AreaInteractive({ id, title }: { id: AreaId; title: string }) {
  return (
    <div className="rounded-[28px] border border-line bg-white p-6 shadow-[0_15px_70px_rgba(61,53,34,0.06)] lg:p-11">
      <h2 className="font-display text-2xl text-ivory lg:text-3xl">{title}</h2>
      <AreaPanel id={id} onNavigate={() => {}} />
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AreaContactCard({ contact }: { contact: AreaContact }) {
  const name = contact.name || "Ihr NoviDom-Team";
  return (
    <div className="grid items-center gap-8 rounded-[28px] border border-line bg-white p-6 shadow-[0_15px_70px_rgba(61,53,34,0.06)] sm:grid-cols-[180px_1fr] lg:p-10">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[180px] overflow-hidden rounded-2xl bg-ink-3">
        {contact.photo ? (
          <Image src={contact.photo} alt={name} fill sizes="180px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-display text-5xl text-ivory/25">
            {contact.name ? initials(contact.name) : "ND"}
          </span>
        )}
      </div>
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">Ihr Ansprechpartner · {contact.role}</div>
        <div className="mt-3 font-display text-3xl text-ivory">{name}</div>
        <p className="mt-3 max-w-xl text-ivory-dim">
          Persönlich vom ersten Gespräch bis zum Abschluss. Und wenn Ihr nächster Schritt in einen anderen Bereich führt,
          bleiben wir Ihr Kontakt und holen die richtigen Kolleginnen und Kollegen dazu.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#kontakt" className="rounded-full bg-night px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-amber">
            Gespräch vereinbaren
          </a>
          {contact.phone && (
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm text-ivory transition-colors hover:border-ivory"
            >
              <Phone className="h-4 w-4" strokeWidth={1.5} />
              {contact.phone}
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm text-ivory transition-colors hover:border-ivory"
            >
              <Mail className="h-4 w-4" strokeWidth={1.5} />
              {contact.email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function AreaFaq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-ivory">
            {item.q}
            <Plus className="h-4 w-4 shrink-0 text-amber transition-transform group-open:rotate-45" strokeWidth={1.5} />
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-ivory-dim">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Die anderen drei Bereiche als Weiterführung, damit der 360°-Gedanke erhalten bleibt. */
export function OtherAreas({ current }: { current: AreaId }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {AREAS.filter((a) => a.id !== current).map((a) => (
        <Link
          key={a.id}
          href={areaHref(a.id)}
          className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition-colors hover:border-amber"
        >
          <span className="font-mono text-[11px] tracking-[0.2em] text-amber">{a.num}</span>
          <a.icon className="mt-4 h-6 w-6 text-amber" strokeWidth={1.5} />
          <span className="mt-4 font-display text-xl text-ivory">{a.title}</span>
          <span className="mt-1 text-sm text-ivory-dim">{a.short}</span>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ivory">
            Mehr erfahren <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
          </span>
        </Link>
      ))}
    </div>
  );
}
