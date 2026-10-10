"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { markHypoContacted } from "@/app/admin/actions";
import { whatsappTo } from "@/lib/social";

type Hypo = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  ablauf: string;
  betrag: number | null;
  zins: number | null;
  bank: string | null;
  erinnert: string | null;
};
type Owner = { id: string; name: string; email: string | null; phone: string | null; objekt: string; wert: number | null; lastSent: string | null };

const PARTNER_EMAIL = process.env.NEXT_PUBLIC_PARTNER_REFERRAL_EMAIL;

function chf(v: number) {
  return `CHF ${v.toLocaleString("en-US").replace(/,/g, "'")}`;
}

function monthsUntil(date: string) {
  const d = new Date(date);
  const now = new Date();
  return (d.getFullYear() - now.getFullYear()) * 12 + d.getMonth() - now.getMonth();
}

function tone(months: number) {
  if (months < 0) return { cls: "badge-muted", text: "abgelaufen" };
  if (months <= 6) return { cls: "badge-red", text: `${months} Mt.` };
  if (months <= 12) return { cls: "badge-gold", text: `${months} Mt.` };
  if (months <= 18) return { cls: "badge-blue", text: `${months} Mt.` };
  return { cls: "badge-muted", text: `${months} Mt.` };
}

/** Hypothekenwächter und Wertmonitor: wer muss wann angerufen werden. */
export function HypoWatchList({ hypos, owners }: { hypos: Hypo[]; owners: Owner[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const soon = hypos.filter((h) => monthsUntil(h.ablauf) <= 12 && monthsUntil(h.ablauf) >= 0);
  const volume = soon.reduce((sum, h) => sum + (h.betrag ?? 0), 0);

  async function contacted(id: string) {
    setBusy(id);
    await markHypoContacted(id);
    setBusy(null);
    router.refresh();
  }

  function referral(h: Hypo) {
    if (!PARTNER_EMAIL) return undefined;
    const body = `Hallo\n\nHypothek zur Verlängerung:\n\nName: ${h.name}\nE-Mail: ${h.email ?? "—"}\nTelefon: ${h.phone ?? "—"}\nAblauf: ${new Date(h.ablauf).toLocaleDateString("de-CH")}\nBetrag: ${h.betrag ? chf(h.betrag) : "—"}\nBank: ${h.bank ?? "—"}\n\nFreundliche Grüsse\nNoviDom Immo`;
    return `mailto:${PARTNER_EMAIL}?subject=${encodeURIComponent(`Verlängerung: ${h.name}`)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Hypothekenwächter</div>
          <div className="page-sub">
            {soon.length} Hypotheken laufen in den nächsten 12 Monaten ab{volume ? ` · Volumen ${chf(volume)}` : ""}. Kunden erhalten 12 Monate vorher
            automatisch eine Erinnerung.
          </div>
        </div>
      </div>

      <div className="card">
        {hypos.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🏦</div>
            <div className="empty-text">Noch keine Hypotheken erfasst. Im Kundenfenster unter «Finanzierung &amp; Hypothek» oder über den Wertmonitor.</div>
          </div>
        ) : (
          <div className="crm-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Kunde</th>
                  <th>Ablauf</th>
                  <th>Betrag</th>
                  <th>Bank / Zins</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {hypos.map((h) => {
                  const m = monthsUntil(h.ablauf);
                  const t = tone(m);
                  return (
                    <tr key={h.id}>
                      <td>
                        <div className="td-name">{h.name}</div>
                        <div className="td-light" style={{ fontSize: 11 }}>
                          {h.email}
                          {h.phone ? ` · ${h.phone}` : ""}
                        </div>
                      </td>
                      <td>
                        {new Date(h.ablauf).toLocaleDateString("de-CH")} <span className={`badge ${t.cls}`}>{t.text}</span>
                      </td>
                      <td className="td-light">{h.betrag ? chf(h.betrag) : "—"}</td>
                      <td className="td-light">
                        {h.bank ?? "—"}
                        {h.zins ? ` · ${h.zins}%` : ""}
                      </td>
                      <td className="td-light">{h.erinnert ? `kontaktiert ${new Date(h.erinnert).toLocaleDateString("de-CH")}` : "offen"}</td>
                      <td>
                        <div className="flex flex-wrap gap-1.5">
                          {h.phone && (
                            <>
                              <a href={`tel:${h.phone}`} className="btn btn-ghost btn-sm" aria-label="Anrufen">
                                <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                              </a>
                              <a
                                href={whatsappTo(h.phone, `Hallo ${h.name.split(" ")[0]}, Ihre Hypothek läuft am ${new Date(h.ablauf).toLocaleDateString("de-CH")} ab. Sollen wir Ihnen unverbindlich bessere Konditionen suchen?`)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-ghost btn-sm"
                                aria-label="WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                              </a>
                            </>
                          )}
                          {referral(h) && (
                            <a href={referral(h)} className="btn btn-ghost btn-sm">
                              An HypoCasa
                            </a>
                          )}
                          {!h.erinnert && (
                            <button type="button" disabled={busy === h.id} onClick={() => contacted(h.id)} className="btn btn-primary btn-sm">
                              Kontaktiert
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="page-header" style={{ marginTop: 32 }}>
        <div>
          <div className="page-title">Wertmonitor</div>
          <div className="page-sub">{owners.length} Eigentümer erhalten jedes Quartal ihren Richtwert. Das sind die Verkäufer von morgen.</div>
        </div>
      </div>
      <div className="card">
        {owners.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📈</div>
            <div className="empty-text">Noch keine Anmeldungen.</div>
          </div>
        ) : (
          <div className="crm-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Eigentümer</th>
                  <th>Objekt</th>
                  <th>Richtwert</th>
                  <th>Letzter Versand</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div className="td-name">{o.name}</div>
                      <div className="td-light" style={{ fontSize: 11 }}>
                        {o.email}
                        {o.phone ? ` · ${o.phone}` : ""}
                      </div>
                    </td>
                    <td className="td-light">{o.objekt}</td>
                    <td>{o.wert ? chf(o.wert) : "—"}</td>
                    <td className="td-light">{o.lastSent ? new Date(o.lastSent).toLocaleDateString("de-CH") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
