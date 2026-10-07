"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, Users, StickyNote, Trash2, Send, FileText } from "lucide-react";
import {
  updateCustomer,
  setCustomerTyp,
  updateCustomerFollowUp,
  deleteCustomer,
  assignCustomerListing,
  invitePortalAccess,
  sendExposeEmail,
  addCustomerActivity,
  deleteCustomerActivity,
} from "@/app/admin/actions";
import { AcquisitionTool } from "./AcquisitionTool";
import { TemplateMailer } from "./TemplateMailer";
import { SaleDeadlineBar } from "./SaleDeadlineBar";
import { formatSwissPhone } from "@/lib/phone";
import { matchListings } from "@/lib/matching";
import type { CrmCustomer, AdminListing } from "@/lib/admin-data";

const TYPE_OPTIONS = [
  { value: "neukunde", label: "Neukunde" },
  { value: "bestand", label: "Bestand" },
  { value: "ex", label: "Ex-Kunde" },
];

const LANGUAGE_OPTIONS = ["Deutsch", "Französisch", "Italienisch", "Englisch"];
const OBJEKT_TYPES = ["Haus", "Wohnung", "Stockwerkeigentum", "Rendite", "Andere"];

const TYPE_ICON: Record<string, typeof Phone> = {
  email: Mail,
  anruf: Phone,
  besuch: Users,
  notiz: StickyNote,
};
const TYPE_TONE: Record<string, string> = {
  email: "tl-blue",
  anruf: "tl-green",
  besuch: "tl-gold",
  notiz: "",
};

export function CustomerDetailModal({
  customer,
  listings,
  beraterOptions,
  onClose,
}: {
  customer: CrmCustomer;
  listings: AdminListing[];
  beraterOptions: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<"akquise" | "mail" | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [ziel, setZiel] = useState(customer.ziel ?? "");

  async function run(key: string, fn: () => Promise<{ error: string | null }>) {
    setBusy(key);
    setError(null);
    const res = await fn();
    setBusy(null);
    if (res.error) setError(res.error);
    else router.refresh();
  }

  async function handleSave(formData: FormData) {
    await run("save", () => updateCustomer(customer.id, formData));
  }

  async function handleAddActivity(formData: FormData) {
    await run("activity", () => addCustomerActivity(customer.id, formData));
  }

  async function handleDelete() {
    if (!window.confirm(`Kundenakte "${customer.full_name}" wirklich löschen?`)) return;
    setBusy("delete");
    const res = await deleteCustomer(customer.id);
    setBusy(null);
    if (res.error) setError(res.error);
    else {
      router.refresh();
      onClose();
    }
  }

  const deadlineBar =
    customer.listing && customer.listing.activated_at && (customer.listing.status === "active" || customer.listing.status === "reserved") ? (
      <SaleDeadlineBar activatedAt={customer.listing.activated_at} deadlineMonths={customer.listing.sale_deadline_months} />
    ) : null;

  const matches = matchListings(customer, listings).filter((l) => l.id !== customer.listing_id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{customer.full_name}</div>
            <div className="flex flex-wrap items-center gap-2" style={{ marginTop: 8 }}>
              {customer.phone && (
                <a href={`tel:${customer.phone}`} className="btn btn-primary btn-sm">
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Anrufen ({formatSwissPhone(customer.phone)})
                </a>
              )}
              <select
                value={customer.typ}
                disabled={busy === "typ"}
                onChange={(e) => run("typ", () => setCustomerTyp(customer.id, e.target.value))}
                className="filter-select"
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                defaultValue={customer.follow_up_at ?? ""}
                disabled={busy === "followup"}
                onChange={(e) => run("followup", () => updateCustomerFollowUp(customer.id, e.target.value))}
                className="field-input"
                style={{ width: "auto" }}
                title="Wiedervorlage"
              />
              <button
                type="button"
                onClick={() => setOpenPanel((v) => (v === "akquise" ? null : "akquise"))}
                className={`btn btn-sm ${openPanel === "akquise" ? "btn-primary" : "btn-ghost"}`}
              >
                <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
                Akquise-Mail
              </button>
              <button
                type="button"
                disabled={!customer.email}
                onClick={() => setOpenPanel((v) => (v === "mail" ? null : "mail"))}
                className={`btn btn-sm ${openPanel === "mail" ? "btn-primary" : "btn-gold"}`}
                title={!customer.email ? "E-Mail-Adresse erforderlich" : undefined}
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
                Mail aus Vorlage
              </button>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Schliessen">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 16 }}>{error}</p>}

          {openPanel === "akquise" && (
            <div className="modal-section">
              <div className="detail-label" style={{ marginBottom: 8 }}>
                Akquise-E-Mail
              </div>
              <AcquisitionTool
                beraterOptions={beraterOptions}
                customerId={customer.id}
                initial={{
                  name: customer.full_name,
                  address: customer.listing?.address ?? customer.address ?? "",
                  city: customer.listing?.city ?? "",
                  recipientEmail: customer.email ?? "",
                  berater: customer.berater ?? "",
                }}
              />
            </div>
          )}

          {openPanel === "mail" && customer.email && (
            <div className="modal-section">
              <div className="detail-label" style={{ marginBottom: 8 }}>
                Mail aus Vorlage
              </div>
              <TemplateMailer
                target={{ kind: "customer", id: customer.id }}
                email={customer.email}
                context={{
                  name: customer.full_name,
                  berater: customer.berater,
                  objekt: customer.listing?.address ?? customer.address,
                  ort: customer.listing?.city ?? null,
                }}
              />
            </div>
          )}

          <div className="modal-section">
            <div className="detail-label" style={{ marginBottom: 8 }}>
              Objekt &amp; Ziel
            </div>
            <div className="card" style={{ margin: 0 }}>
              <div style={{ padding: 16 }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="field-label">Ziel</span>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>
                      {customer.ziel === "verkaufen" ? "Verkaufen" : customer.ziel === "kaufen" ? "Kaufen" : "—"}
                    </div>
                  </div>
                  {customer.listing ? (
                    <div style={{ textAlign: "right" }}>
                      <div className="td-name">
                        {customer.listing.address}, {customer.listing.city}
                      </div>
                      <div className="td-light" style={{ fontSize: 12 }}>
                        {customer.listing.price_chf ? `CHF ${customer.listing.price_chf.toLocaleString("en-US").replace(/,/g, "'")}` : "Preis offen"}{" "}
                        · {customer.listing.status}
                      </div>
                    </div>
                  ) : (
                    <span className="td-light">Kein Objekt verknüpft</span>
                  )}
                </div>
                {deadlineBar && <div style={{ marginTop: 12 }}>{deadlineBar}</div>}

                <div style={{ marginTop: 14 }}>
                  {assigning ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <select id={`assign-${customer.id}`} className="filter-select" defaultValue={customer.listing_id ?? ""}>
                        <option value="">Kein Objekt</option>
                        {listings.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.address}, {l.city} ({l.status})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={busy === "assign"}
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          const select = document.getElementById(`assign-${customer.id}`) as HTMLSelectElement;
                          run("assign", () => assignCustomerListing(customer.id, select.value || null));
                          setAssigning(false);
                        }}
                      >
                        Übernehmen
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAssigning(false)}>
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAssigning(true)}>
                      {customer.listing ? "Objekt ändern" : "Objekt verknüpfen"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {ziel === "kaufen" && (
            <div className="modal-section">
              <div className="detail-label" style={{ marginBottom: 8 }}>
                Suchprofil
              </div>
              <div className="card" style={{ margin: 0, padding: 16 }}>
                <div className="grid gap-2.5 sm:grid-cols-2" style={{ fontSize: 13 }}>
                  <div>
                    <span className="td-light">Budget: </span>
                    {customer.budget_min || customer.budget_max
                      ? `CHF ${(customer.budget_min ?? 0).toLocaleString("en-US").replace(/,/g, "'")} – ${
                          customer.budget_max ? customer.budget_max.toLocaleString("en-US").replace(/,/g, "'") : "offen"
                        }`
                      : "—"}
                  </div>
                  <div>
                    <span className="td-light">Wunschort: </span>
                    {customer.wunsch_ort || "—"}
                  </div>
                  <div>
                    <span className="td-light">Objekttyp: </span>
                    {customer.objekt_typ || "—"}
                  </div>
                  <div>
                    <span className="td-light">Min. Zimmer / Fläche: </span>
                    {customer.zimmer_min || "—"} Zi. / {customer.wohnflaeche_min || "—"} m²
                  </div>
                </div>

                {matches.length > 0 ? (
                  <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                    <div className="field-label" style={{ marginBottom: 8 }}>
                      🎯 Passende Inserate ({matches.length})
                    </div>
                    {matches.map((m) => (
                      <div key={m.id} className="flex items-center justify-between" style={{ padding: "6px 0", fontSize: 13 }}>
                        <span className="td-name">
                          {m.address}, {m.city}
                        </span>
                        <span className="td-light">{m.price_chf ? `CHF ${m.price_chf.toLocaleString("en-US").replace(/,/g, "'")}` : "—"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="td-light" style={{ fontSize: 12, marginTop: 14 }}>
                    Noch kein passendes aktives Inserat.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="modal-section">
            <div className="detail-label" style={{ marginBottom: 8 }}>
              Kunde identifizieren
            </div>
            <form action={handleSave} className="card" style={{ margin: 0, padding: 16 }}>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <input name="full_name" required defaultValue={customer.full_name} placeholder="Name *" className="field-input" />
                <select name="language" defaultValue={customer.language} className="field-select">
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <input name="address" defaultValue={customer.address ?? ""} placeholder="Adresse" className="field-input sm:col-span-2" />
                <input
                  name="phone"
                  defaultValue={customer.phone ? formatSwissPhone(customer.phone) : ""}
                  placeholder="Mobile"
                  className="field-input"
                  onBlur={(e) => {
                    e.target.value = formatSwissPhone(e.target.value);
                  }}
                />
                <input name="email" type="email" defaultValue={customer.email ?? ""} placeholder="E-Mail" className="field-input" />
                <select name="ziel" value={ziel} onChange={(e) => setZiel(e.target.value)} className="field-select">
                  <option value="">Ziel (optional)</option>
                  <option value="verkaufen">Verkaufen</option>
                  <option value="kaufen">Kaufen</option>
                </select>
                <select name="berater" defaultValue={customer.berater ?? ""} className="field-select">
                  <option value="">Zuständig</option>
                  {beraterOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                {ziel === "kaufen" && (
                  <>
                    <input
                      name="budget_min"
                      inputMode="numeric"
                      defaultValue={customer.budget_min ?? ""}
                      placeholder="Budget von (CHF)"
                      className="field-input"
                    />
                    <input
                      name="budget_max"
                      inputMode="numeric"
                      defaultValue={customer.budget_max ?? ""}
                      placeholder="Budget bis (CHF)"
                      className="field-input"
                    />
                    <input
                      name="wunsch_ort"
                      defaultValue={customer.wunsch_ort ?? ""}
                      placeholder="Wunschort(e), kommagetrennt"
                      className="field-input sm:col-span-2"
                    />
                    <select name="objekt_typ" defaultValue={customer.objekt_typ ?? ""} className="field-select">
                      <option value="">Objekttyp (egal)</option>
                      {OBJEKT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        name="zimmer_min"
                        inputMode="decimal"
                        defaultValue={customer.zimmer_min ?? ""}
                        placeholder="Min. Zimmer"
                        className="field-input"
                      />
                      <input
                        name="wohnflaeche_min"
                        inputMode="numeric"
                        defaultValue={customer.wohnflaeche_min ?? ""}
                        placeholder="Min. Fläche m²"
                        className="field-input"
                      />
                    </div>
                  </>
                )}

                <textarea name="notes" rows={3} defaultValue={customer.notes ?? ""} placeholder="Notizen" className="field-textarea sm:col-span-2" />
              </div>
              <button type="submit" disabled={busy === "save"} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                {busy === "save" ? "Speichert…" : "Speichern"}
              </button>
            </form>
          </div>

          <div className="modal-section">
            <div className="detail-label" style={{ marginBottom: 8 }}>
              Portal &amp; Dokumente
            </div>
            <div className="flex flex-wrap gap-2">
              {customer.portal_user_id ? (
                <span className="badge badge-green">Portal-Zugang aktiv</span>
              ) : (
                <button
                  type="button"
                  disabled={busy === "invite" || !customer.email}
                  onClick={() => run("invite", () => invitePortalAccess(customer.id))}
                  className="btn btn-ghost btn-sm"
                  title={!customer.email ? "E-Mail-Adresse erforderlich" : undefined}
                >
                  Für Portal einladen
                </button>
              )}
              {customer.listing && (
                <button
                  type="button"
                  disabled={busy === "expose" || !customer.email}
                  onClick={() => run("expose", () => sendExposeEmail(customer.id))}
                  className="btn btn-ghost btn-sm"
                >
                  <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Exposé senden
                </button>
              )}
            </div>
          </div>

          <div className="modal-section">
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <div className="detail-label">Kontakthistorie</div>
            </div>
            <form action={handleAddActivity} className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 sm:flex-row">
                <select name="type" defaultValue="notiz" className="field-select" style={{ width: "auto" }}>
                  <option value="notiz">Notiz</option>
                  <option value="anruf">Anruf</option>
                  <option value="email">E-Mail</option>
                  <option value="besuch">Besuch</option>
                </select>
                <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="field-input" style={{ width: "auto" }} title="Datum (auch in der Zukunft möglich)" />
                <input name="text" required placeholder="z.B. Unterlagen angefordert" className="field-input" style={{ flex: 1 }} />
                <button type="submit" disabled={busy === "activity"} className="btn btn-primary btn-sm">
                  Eintragen
                </button>
              </div>
            </form>

            {customer.activity.length === 0 ? (
              <p className="td-light" style={{ marginTop: 12, fontSize: 12 }}>
                Noch keine Einträge.
              </p>
            ) : (
              <div className="mt-2">
                {customer.activity.map((a) => {
                  const Icon = TYPE_ICON[a.type] ?? StickyNote;
                  return (
                    <div key={a.id} className="tl-entry">
                      <div className={`tl-icon ${TYPE_TONE[a.type] ?? ""}`}>
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="tl-title">{a.text}</div>
                        <div className="tl-meta">{new Date(a.created_at).toLocaleString("de-CH")}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => run(`del-${a.id}`, () => deleteCustomerActivity(a.id))}
                        disabled={busy === `del-${a.id}`}
                        aria-label="Eintrag löschen"
                        style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer" }}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <button type="button" disabled={busy === "delete"} onClick={handleDelete} className="btn btn-danger btn-sm">
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
