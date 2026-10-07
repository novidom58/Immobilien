"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Sparkles } from "lucide-react";
import { createEmailTemplate, updateEmailTemplate, deleteEmailTemplate, seedStarterTemplates } from "@/app/admin/actions";
import { PLACEHOLDERS, TEMPLATE_CATEGORIES, STARTER_TEMPLATES, type EmailTemplate } from "@/lib/emailTemplates";

function TemplateForm({
  template,
  busy,
  onSubmit,
  onCancel,
}: {
  template?: EmailTemplate;
  busy: boolean;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Fügt einen Platzhalter an der Cursorposition ein.
  function insertPlaceholder(key: string) {
    const el = bodyRef.current;
    if (!el) return;
    const token = `{${key}}`;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    el.value = el.value.slice(0, start) + token + el.value.slice(end);
    el.focus();
    el.setSelectionRange(start + token.length, start + token.length);
  }

  return (
    <form action={onSubmit} className="grid gap-2.5 sm:grid-cols-2" style={{ padding: 16, borderTop: "1px solid var(--border)" }}>
      <input name="name" required defaultValue={template?.name ?? ""} placeholder="Name der Vorlage *" className="field-input" />
      <select name="category" defaultValue={template?.category ?? "Allgemein"} className="field-select">
        {TEMPLATE_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input name="subject" required defaultValue={template?.subject ?? ""} placeholder="Betreff *" className="field-input sm:col-span-2" />
      <textarea
        ref={bodyRef}
        name="body"
        required
        rows={12}
        defaultValue={template?.body ?? ""}
        placeholder={"Hallo {vorname}\n\n…\n\nFreundliche Grüsse\n{berater}\nNoviDom Immo"}
        className="field-textarea sm:col-span-2"
      />
      <div className="flex flex-wrap items-center gap-1.5 sm:col-span-2" style={{ fontSize: 12 }}>
        <span className="td-light">Platzhalter einfügen:</span>
        {PLACEHOLDERS.map((p) => (
          <button key={p.key} type="button" onClick={() => insertPlaceholder(p.key)} className="bchip" style={{ cursor: "pointer" }} title={p.label}>
            {`{${p.key}}`}
          </button>
        ))}
      </div>
      <label className="flex flex-wrap items-center gap-2 sm:col-span-2" style={{ fontSize: 13 }}>
        <span className="field-label" style={{ margin: 0 }}>
          Wiedervorlage nach
        </span>
        <input
          name="follow_up_days"
          type="number"
          min={1}
          max={365}
          defaultValue={template?.follow_up_days ?? ""}
          placeholder="—"
          className="field-input"
          style={{ width: 80 }}
        />
        <span className="td-light">Tagen (leer = keine)</span>
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
          {busy ? "Speichert …" : "Speichern"}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export function EmailTemplateManager({ templates }: { templates: EmailTemplate[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(key: string, fn: () => Promise<{ error: string | null | undefined }>) {
    setBusy(key);
    setError(null);
    const res = await fn();
    setBusy(null);
    if (res.error) {
      setError(res.error);
      return false;
    }
    router.refresh();
    return true;
  }

  const existingNames = new Set(templates.map((t) => t.name));
  const missingStarters = STARTER_TEMPLATES.filter((t) => !existingNames.has(t.name)).length;

  const categories = [...new Set([...TEMPLATE_CATEGORIES, ...templates.map((t) => t.category)])].filter((c) =>
    templates.some((t) => t.category === c)
  );

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 820 }}>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setEditingId("new")} className="btn btn-primary btn-sm">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Neue Vorlage
        </button>
        {missingStarters > 0 && (
          <button type="button" disabled={busy === "seed"} onClick={() => run("seed", seedStarterTemplates)} className="btn btn-gold btn-sm">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            {busy === "seed" ? "Lädt …" : `${missingStarters} Startvorlagen übernehmen`}
          </button>
        )}
      </div>

      {error && <p style={{ fontSize: 13, color: "var(--red)" }}>{error}</p>}

      {editingId === "new" && (
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <div className="card-title">Neue Vorlage</div>
          </div>
          <TemplateForm
            busy={busy === "new"}
            onCancel={() => setEditingId(null)}
            onSubmit={async (fd) => {
              if (await run("new", () => createEmailTemplate(fd))) setEditingId(null);
            }}
          />
        </div>
      )}

      {templates.length === 0 && editingId !== "new" && (
        <div className="card" style={{ margin: 0 }}>
          <div className="empty">
            <div className="empty-icon">✉️</div>
            <div className="empty-text">Noch keine Vorlagen</div>
            <div className="empty-sub">Übernehmen Sie die Startvorlagen oder erfassen Sie eine eigene.</div>
          </div>
        </div>
      )}

      {categories.map((category) => (
        <div key={category} className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <div className="card-title">{category}</div>
          </div>
          {templates
            .filter((t) => t.category === category)
            .map((t) => (
              <div key={t.id} style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between gap-3" style={{ padding: "12px 16px" }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="td-name">{t.name}</div>
                    <div className="td-light truncate" style={{ fontSize: 12 }}>
                      {t.subject}
                      {t.follow_up_days ? ` · Wiedervorlage nach ${t.follow_up_days} T` : ""}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(editingId === t.id ? null : t.id)}
                      className="btn btn-ghost btn-sm"
                      aria-label="Bearbeiten"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      disabled={busy === `del-${t.id}`}
                      onClick={() => {
                        if (window.confirm(`Vorlage "${t.name}" löschen?`)) void run(`del-${t.id}`, () => deleteEmailTemplate(t.id));
                      }}
                      className="btn btn-ghost btn-sm"
                      aria-label="Löschen"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
                {editingId === t.id && (
                  <TemplateForm
                    template={t}
                    busy={busy === t.id}
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (fd) => {
                      if (await run(t.id, () => updateEmailTemplate(t.id, fd))) setEditingId(null);
                    }}
                  />
                )}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
