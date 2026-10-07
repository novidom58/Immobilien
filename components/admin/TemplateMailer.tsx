"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Check, Mail, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logTemplateMail, sendTemplateMail } from "@/app/admin/actions";
import { renderTemplate, addDays, type EmailTemplate, type TemplateContext } from "@/lib/emailTemplates";

/**
 * Mail aus einer eigenen Vorlage: Vorlage wählen, Platzhalter werden mit den
 * Kundendaten gefüllt, Text bleibt editierbar. Versand direkt (Resend) oder
 * über das eigene E-Mail-Programm; beides landet in der Kontakthistorie und
 * setzt auf Wunsch die nächste Wiedervorlage.
 */
export function TemplateMailer({
  target,
  email,
  context,
}: {
  target: { kind: "customer" | "lead"; id: string };
  email: string;
  context: TemplateContext;
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [busy, setBusy] = useState<"send" | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("email_templates")
      .select("id, name, category, subject, body, follow_up_days")
      .order("category")
      .order("name")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setLoadError(error.message);
        else setTemplates((data ?? []) as EmailTemplate[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, EmailTemplate[]>();
    for (const t of templates ?? []) map.set(t.category, [...(map.get(t.category) ?? []), t]);
    return [...map.entries()];
  }, [templates]);

  const selected = templates?.find((t) => t.id === selectedId) ?? null;
  const label = selected ? `Mail: ${selected.name}` : "Mail verschickt";

  function choose(id: string) {
    setSelectedId(id);
    setNotice(null);
    const template = templates?.find((t) => t.id === id);
    if (!template) return;
    setSubject(renderTemplate(template.subject, context));
    setBody(renderTemplate(template.body, context));
    setFollowUp(template.follow_up_days ? addDays(template.follow_up_days) : "");
  }

  async function record() {
    const res = await logTemplateMail(target, label, followUp || null);
    if (res.error) setNotice({ tone: "error", text: res.error });
    else {
      setNotice({ tone: "ok", text: followUp ? `In der Historie vermerkt, Wiedervorlage am ${new Date(followUp).toLocaleDateString("de-CH")}.` : "In der Historie vermerkt." });
      router.refresh();
    }
  }

  async function handleSend() {
    setBusy("send");
    setNotice(null);
    const res = await sendTemplateMail(target, { to: email, subject, body, label }, followUp || null);
    setBusy(null);
    if (res.error) setNotice({ tone: "error", text: res.error });
    else {
      setNotice({ tone: "ok", text: "Mail verschickt und in der Historie vermerkt." });
      router.refresh();
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(`${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    await record();
  }

  const mailtoHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const hasOpenPlaceholder = /\{\w+\}/.test(subject + body);

  if (loadError) {
    return (
      <p style={{ fontSize: 13, color: "var(--red)" }}>
        Vorlagen konnten nicht geladen werden ({loadError}). Ist die Tabelle email_templates in Supabase angelegt?
      </p>
    );
  }

  if (templates && templates.length === 0) {
    return (
      <p className="td-light" style={{ fontSize: 13 }}>
        Noch keine Vorlagen erfasst.{" "}
        <Link href="/admin/mailvorlagen" style={{ color: "var(--blue)", textDecoration: "underline" }}>
          Jetzt Vorlagen anlegen
        </Link>
      </p>
    );
  }

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 16, background: "var(--bg)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <select value={selectedId} onChange={(e) => choose(e.target.value)} disabled={!templates} className="field-select" style={{ flex: 1, minWidth: 220 }}>
          <option value="">{templates ? "Vorlage wählen …" : "Lädt …"}</option>
          {grouped.map(([category, list]) => (
            <optgroup key={category} label={category}>
              {list.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <Link href="/admin/mailvorlagen" className="td-light" style={{ fontSize: 12, textDecoration: "underline" }}>
          Vorlagen verwalten
        </Link>
      </div>

      {selected && (
        <>
          <div className="field-label mt-3">An</div>
          <div className="mt-1" style={{ fontSize: 13 }}>
            {email}
          </div>
          <div className="field-label mt-3">Betreff</div>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="field-input mt-1" style={{ background: "var(--surface)" }} />
          <div className="field-label mt-3">Text (editierbar)</div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="field-textarea mt-1" style={{ background: "var(--surface)" }} />
          {hasOpenPlaceholder && (
            <p style={{ fontSize: 12, color: "var(--gold)", marginTop: 6 }}>
              Achtung: Es sind noch Platzhalter in geschweiften Klammern offen.
            </p>
          )}

          <label className="mt-3 flex flex-wrap items-center gap-2" style={{ fontSize: 13 }}>
            <span className="field-label" style={{ margin: 0 }}>
              Nächste Wiedervorlage
            </span>
            <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="field-input" style={{ width: "auto" }} />
            {followUp && (
              <button type="button" onClick={() => setFollowUp("")} className="td-light" style={{ background: "none", border: "none", fontSize: 12, textDecoration: "underline", cursor: "pointer" }}>
                keine
              </button>
            )}
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={handleSend} disabled={busy === "send"} className="btn btn-primary btn-sm">
              <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
              {busy === "send" ? "Sendet …" : "Direkt senden"}
            </button>
            <a href={mailtoHref} onClick={() => void record()} className="btn btn-ghost btn-sm">
              <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
              Im E-Mail-Programm öffnen
            </a>
            <button type="button" onClick={handleCopy} className="btn btn-ghost btn-sm">
              {copied ? <Check className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />}
              {copied ? "Kopiert" : "Kopieren"}
            </button>
          </div>
        </>
      )}

      {notice && (
        <p className="mt-3" style={{ fontSize: 13, color: notice.tone === "ok" ? "var(--green)" : "var(--red)" }}>
          {notice.text}
        </p>
      )}
    </div>
  );
}
