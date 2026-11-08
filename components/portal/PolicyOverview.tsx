"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, FileText, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isKmuSparte, kuendigenBis, SPARTEN, SPARTEN_KMU, SPARTEN_PRIVAT, sparteLabel, type Policy } from "@/lib/policies";
import { notifyUpload } from "@/app/dashboard/actions";

const chf = (n: number) => `CHF ${Math.round(n).toLocaleString("de-CH")}`;
const dateCh = (d: Date | string) => new Date(typeof d === "string" ? `${d}T12:00:00` : d).toLocaleDateString("de-CH");

const EMPTY = { sparte: "haftpflicht", versicherer: "", policennummer: "", praemie_jahr: "", ablauf: "", kuendigungsfrist_monate: "3", deckung: "" };

/**
 * «Meine Versicherungen»: alle Policen an einem Ort, bewusst einfacher als
 * die Portale der Versicherer. Schutz auf einen Blick, Prämien, Ablauf und
 * Kündigungsfrist, Policen-PDF. Das Team sieht dieselben Angaben im CRM.
 */
export function PolicyOverview({ user, isOwner }: { user: { name: string; email: string }; isOwner: boolean }) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [policies, setPolicies] = useState<Policy[] | null>(null);
  const [form, setForm] = useState<typeof EMPTY | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claim, setClaim] = useState<"idle" | "open" | "sending" | "sent">("idle");
  // Privat oder Geschäft (KMU): oben umschalten, alles darunter folgt
  const [mode, setMode] = useState<"privat" | "kmu">("privat");

  async function load() {
    if (!supabase) return;
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (!u) return;
    setUserId(u.id);
    const { data, error: loadError } = await supabase.from("customer_policies").select("*").order("sparte");
    if (loadError) {
      setError(loadError.message.includes("customer_policies") ? "Dieser Bereich wird gerade eingerichtet." : loadError.message);
      setPolicies([]);
      return;
    }
    setPolicies((data ?? []) as Policy[]);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- einmaliges Laden der eigenen Policen
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!supabase) return null;

  const all = policies ?? [];
  const list = all.filter((p) => (mode === "kmu") === isKmuSparte(p.sparte));
  const kmuCount = all.filter((p) => isKmuSparte(p.sparte)).length;
  const total = list.reduce((s, p) => s + (Number(p.praemie_jahr) || 0), 0);
  const today = new Date();
  const soon = list
    .map((p) => ({ p, bis: kuendigenBis(p) }))
    .filter(({ bis }) => bis && bis.getTime() > today.getTime() && bis.getTime() - today.getTime() < 120 * 864e5)
    .sort((a, b) => a.bis!.getTime() - b.bis!.getTime());
  const core = mode === "kmu" ? SPARTEN_KMU : SPARTEN.filter((s) => s.core && (s.key !== "gebaeude" || isOwner));
  const modeSparten = mode === "kmu" ? SPARTEN_KMU : SPARTEN_PRIVAT;

  function startEdit(p?: Policy) {
    setError(null);
    setEditId(p?.id ?? null);
    setForm(
      p
        ? {
            sparte: p.sparte,
            versicherer: p.versicherer ?? "",
            policennummer: p.policennummer ?? "",
            praemie_jahr: p.praemie_jahr ? String(p.praemie_jahr) : "",
            ablauf: p.ablauf ?? "",
            kuendigungsfrist_monate: String(p.kuendigungsfrist_monate ?? 3),
            deckung: p.deckung ?? "",
          }
        : { ...EMPTY, sparte: modeSparten[0].key }
    );
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !userId || !form) return;
    setBusy(true);
    setError(null);
    let storagePath: string | undefined;
    const file = fileRef.current?.files?.[0];
    if (file) {
      storagePath = `${userId}/police-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upError } = await supabase.storage.from("kunden-dokumente").upload(storagePath, file);
      if (upError) {
        setBusy(false);
        setError(`Upload fehlgeschlagen: ${upError.message}`);
        return;
      }
    }
    const row = {
      user_id: userId,
      sparte: form.sparte,
      versicherer: form.versicherer.trim() || null,
      policennummer: form.policennummer.trim() || null,
      praemie_jahr: Number(form.praemie_jahr.replace(/[^\d.]/g, "")) || null,
      ablauf: form.ablauf || null,
      kuendigungsfrist_monate: Number(form.kuendigungsfrist_monate) || 3,
      deckung: form.deckung.trim() || null,
      updated_at: new Date().toISOString(),
      ...(storagePath ? { storage_path: storagePath } : {}),
    };
    const { error: saveError } = editId
      ? await supabase.from("customer_policies").update(row).eq("id", editId)
      : await supabase.from("customer_policies").insert(row);
    setBusy(false);
    if (saveError) {
      setError(`Speichern fehlgeschlagen: ${saveError.message}`);
      return;
    }
    notifyUpload([`${sparteLabel(form.sparte)}${form.versicherer ? ` · ${form.versicherer}` : ""}${file ? ` · ${file.name}` : ""}`], "Meine Versicherungen").catch(() => null);
    setForm(null);
    setEditId(null);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  async function remove(p: Policy) {
    if (!supabase || !window.confirm(`Police «${sparteLabel(p.sparte)}» entfernen?`)) return;
    if (p.storage_path) await supabase.storage.from("kunden-dokumente").remove([p.storage_path]);
    await supabase.from("customer_policies").delete().eq("id", p.id);
    load();
  }

  async function openPdf(path: string) {
    if (!supabase) return;
    const { data } = await supabase.storage.from("kunden-dokumente").createSignedUrl(path, 60);
    if (data) window.open(data.signedUrl, "_blank");
  }

  async function sendClaim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setClaim("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "contact",
        source: "portal-schaden",
        name: user.name,
        email: user.email,
        message: `Schadenmeldung aus dem Kundenportal\nVersicherung: ${fd.get("sparte")}\nWann: ${fd.get("wann") || "–"}\n\n${fd.get("was")}`,
      }),
    });
    setClaim(res.ok ? "sent" : "open");
  }

  const input = "rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ivory focus:border-amber focus:outline-none";

  return (
    <div className="grid gap-5">
      {/* Schutz auf einen Blick */}
      {/* Umschalter Privat / Geschäft */}
      <div className="inline-flex w-fit rounded-full border border-line bg-white p-1" role="tablist" aria-label="Privat oder Geschäft">
        {(
          [
            { k: "privat", label: "Privat" },
            { k: "kmu", label: `Geschäft (KMU)${kmuCount ? ` · ${kmuCount}` : ""}` },
          ] as const
        ).map((m) => (
          <button
            key={m.k}
            type="button"
            role="tab"
            aria-selected={mode === m.k}
            onClick={() => {
              setMode(m.k);
              setForm(null);
              setEditId(null);
            }}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${mode === m.k ? "bg-night text-ink" : "text-ivory-dim hover:text-ivory"}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 lg:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-display text-lg text-ivory">{mode === "kmu" ? "Ihr Betrieb auf einen Blick" : "Ihr Schutz auf einen Blick"}</div>
            <p className="mt-1 text-sm text-ivory-dim">
              {mode === "kmu"
                ? "Geschäftspolicen Ihrer Firma: wir prüfen sie zusammen mit den privaten, damit nichts doppelt oder gar nicht versichert ist."
                : "Erfassen Sie Ihre Policen einmal, wir prüfen Deckungen, Prämien und Lücken."}
            </p>
          </div>
          {total > 0 && (
            <div className="text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ivory-dim">Prämien pro Jahr</div>
              <div className="font-display text-2xl text-amber">{chf(total)}</div>
            </div>
          )}
        </div>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {core.map((s) => {
            const p = list.find((x) => x.sparte === s.key);
            return (
              <div key={s.key} className={`flex gap-3 rounded-xl border p-3.5 ${p ? "border-emerald-200 bg-emerald-50/50" : "border-line"}`}>
                {p ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" strokeWidth={1.75} />
                ) : (
                  <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-ivory-dim" strokeWidth={1.75} />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ivory">{s.label}</div>
                  <div className="truncate text-xs text-ivory-dim">
                    {p ? [p.versicherer, p.praemie_jahr ? chf(Number(p.praemie_jahr)) : null].filter(Boolean).join(" · ") || "erfasst" : s.hint}
                  </div>
                  {p && (p.ablauf || kuendigenBis(p)) && (
                    <div className="truncate text-xs text-ivory">
                      {[p.ablauf ? `Ablauf ${dateCh(p.ablauf)}` : null, kuendigenBis(p) ? `kündbar bis ${dateCh(kuendigenBis(p)!)}` : null].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {soon.length > 0 && (
          <div className="mt-4 flex gap-2.5 rounded-xl bg-amber/10 p-3.5 text-sm text-ivory">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" strokeWidth={1.75} />
            <div>
              {soon.map(({ p, bis }) => (
                <div key={p.id}>
                  {sparteLabel(p.sparte)}: kündbar bis <b>{dateCh(bis!)}</b>. Wir vergleichen gerne vorher, ob es günstiger oder besser geht.
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Policen */}
      <div className="rounded-2xl border border-line bg-white p-5 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-display text-lg text-ivory">{mode === "kmu" ? "Meine Geschäftspolicen" : "Meine Policen"}</div>
          {!form && (
            <button type="button" onClick={() => startEdit()} className="inline-flex items-center gap-1.5 rounded-full bg-night px-4 py-2 text-sm font-semibold text-ink hover:bg-amber">
              <Plus className="h-4 w-4" /> Police erfassen
            </button>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

        {form && (
          <form onSubmit={save} className="mt-4 grid gap-3 rounded-xl bg-ink-2 p-4 sm:grid-cols-2">
            <select value={form.sparte} onChange={(e) => setForm({ ...form, sparte: e.target.value })} className={input} aria-label="Versicherung">
              {modeSparten.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <input value={form.versicherer} onChange={(e) => setForm({ ...form, versicherer: e.target.value })} placeholder="Versicherer, z.B. Baloise" className={input} />
            <input value={form.policennummer} onChange={(e) => setForm({ ...form, policennummer: e.target.value })} placeholder="Policennummer" className={input} />
            <input value={form.praemie_jahr} onChange={(e) => setForm({ ...form, praemie_jahr: e.target.value })} inputMode="decimal" placeholder="Prämie pro Jahr (CHF)" className={input} />
            <label className="grid gap-1 text-xs text-ivory-dim">
              Ablauf des Vertrags
              <input type="date" value={form.ablauf} onChange={(e) => setForm({ ...form, ablauf: e.target.value })} className={input} />
            </label>
            <label className="grid gap-1 text-xs text-ivory-dim">
              Kündigungsfrist
              <select value={form.kuendigungsfrist_monate} onChange={(e) => setForm({ ...form, kuendigungsfrist_monate: e.target.value })} className={input}>
                {[1, 2, 3, 6].map((m) => (
                  <option key={m} value={m}>
                    {m} {m === 1 ? "Monat" : "Monate"}
                  </option>
                ))}
              </select>
            </label>
            <input value={form.deckung} onChange={(e) => setForm({ ...form, deckung: e.target.value })} placeholder="Was ist versichert? z.B. Hausrat CHF 80'000, Selbstbehalt 200" className={`${input} sm:col-span-2`} />
            <label className="grid gap-1 text-xs text-ivory-dim sm:col-span-2">
              Police als PDF oder Foto (optional)
              <input ref={fileRef} type="file" accept=".pdf,image/*" className="text-sm" />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" disabled={busy} className="rounded-full bg-night px-5 py-2 text-sm font-semibold text-ink hover:bg-amber disabled:opacity-60">
                {busy ? "Speichert…" : "Speichern"}
              </button>
              <button type="button" onClick={() => setForm(null)} className="rounded-full border border-line px-5 py-2 text-sm text-ivory-dim">
                Abbrechen
              </button>
            </div>
          </form>
        )}

        {policies === null ? (
          <p className="mt-4 text-sm text-ivory-dim">Lädt…</p>
        ) : list.length === 0 && !form ? (
          <p className="mt-4 text-sm text-ivory-dim">{mode === "kmu" ? "Noch keine Geschäftspolicen erfasst." : "Noch keine Policen erfasst."} Tipp: Foto der ersten Seite genügt, den Rest prüfen wir.</p>
        ) : (
          <div className="mt-4 divide-y divide-line">
            {list.map((p) => {
              const bis = kuendigenBis(p);
              return (
                <div key={p.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ivory">
                      {sparteLabel(p.sparte)}
                      {p.versicherer ? <span className="font-normal text-ivory-dim"> · {p.versicherer}</span> : null}
                      {p.policennummer ? <span className="font-normal text-ivory-dim"> · Nr. {p.policennummer}</span> : null}
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-4">
                      {[
                        { k: "Prämie", v: p.praemie_jahr ? `${chf(Number(p.praemie_jahr))} / Jahr` : null },
                        { k: "Ablauf", v: p.ablauf ? dateCh(p.ablauf) : null },
                        { k: "Kündigen bis", v: bis ? dateCh(bis) : null, warn: soon.some((x) => x.p.id === p.id) },
                        { k: "Kündigungsfrist", v: p.kuendigungsfrist_monate ? `${p.kuendigungsfrist_monate} Monate` : null },
                      ].map((f) => (
                        <div key={f.k}>
                          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ivory-dim">{f.k}</dt>
                          <dd className={f.warn ? "font-semibold text-amber" : f.v ? "text-ivory" : "text-ivory-dim"}>{f.v ?? "offen"}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-2 text-xs">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ivory-dim">Deckung </span>
                      <span className={p.deckung ? "text-ivory" : "text-ivory-dim"}>{p.deckung || "noch nicht erfasst"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.storage_path && (
                      <button type="button" onClick={() => openPdf(p.storage_path!)} className="rounded-full p-2 text-amber hover:bg-ink-2" aria-label="Police öffnen">
                        <FileText className="h-4 w-4" />
                      </button>
                    )}
                    <button type="button" onClick={() => startEdit(p)} className="rounded-full p-2 text-ivory-dim hover:bg-ink-2" aria-label="Bearbeiten">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => remove(p)} className="rounded-full p-2 text-ivory-dim hover:bg-ink-2" aria-label="Entfernen">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mandat und Schaden */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 lg:p-6">
          <div className="flex items-center gap-2 font-display text-lg text-ivory">
            <ShieldCheck className="h-5 w-5 text-amber" strokeWidth={1.75} /> Ihr Broker: NoviDom
          </div>
          <p className="mt-2 text-sm text-ivory-dim">
            Mit einem Brokermandat vertreten wir Sie gegenüber allen Versicherern: Wir vergleichen bei jedem Ablauf, melden Schäden für Sie
            und Sie haben eine Ansprechperson für alles. Für Sie kostenlos.
          </p>
          <a href="mailto:verkaufen@novidom-immo.ch?subject=Brokermandat" className="mt-4 inline-flex rounded-full border border-line px-4 py-2 text-sm text-ivory hover:border-amber">
            Mandat besprechen
          </a>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 lg:p-6">
          <div className="font-display text-lg text-ivory">Schaden melden</div>
          {claim === "sent" ? (
            <p className="mt-2 text-sm text-emerald-700">Danke, Ihre Meldung ist bei uns. Wir melden uns heute noch und übernehmen den Kontakt zur Versicherung.</p>
          ) : claim === "idle" ? (
            <>
              <p className="mt-2 text-sm text-ivory-dim">Wasserschaden, Einbruch, Glasbruch? Melden Sie es uns, wir kümmern uns um den Rest.</p>
              <button type="button" onClick={() => setClaim("open")} className="mt-4 rounded-full bg-night px-4 py-2 text-sm font-semibold text-ink hover:bg-amber">
                Schaden melden
              </button>
            </>
          ) : (
            <form onSubmit={sendClaim} className="mt-3 grid gap-2.5">
              <select name="sparte" className={input} aria-label="Welche Versicherung">
                {SPARTEN.map((s) => (
                  <option key={s.key}>{s.label}</option>
                ))}
              </select>
              <input name="wann" type="date" className={input} aria-label="Wann ist es passiert" />
              <textarea name="was" required rows={3} placeholder="Was ist passiert?" className={input} />
              <button type="submit" disabled={claim === "sending"} className="w-fit rounded-full bg-night px-4 py-2 text-sm font-semibold text-ink hover:bg-amber disabled:opacity-60">
                {claim === "sending" ? "Sendet…" : "Meldung senden"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
