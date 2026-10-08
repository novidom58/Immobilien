import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { EmailTemplateManager } from "@/components/admin/EmailTemplateManager";
import type { EmailTemplate } from "@/lib/emailTemplates";

export const metadata: Metadata = {
  title: "Mailvorlagen — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMailvorlagenPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("email_templates")
    .select("id, name, category, subject, body, follow_up_days")
    .order("category")
    .order("name");

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Mailvorlagen</div>
          <div className="page-sub">
            Eigene Texte für Nachfassen, Unterlagen, Hypotheken-Analyse usw. Platzhalter wie {"{vorname}"} werden beim Schreiben automatisch gefüllt.
          </div>
        </div>
      </div>

      {error ? (
        <div className="card" style={{ maxWidth: 820, padding: 20 }}>
          <p style={{ fontSize: 13, color: "var(--red)" }}>Vorlagen konnten nicht geladen werden: {error.message}</p>
          <p className="td-light" style={{ fontSize: 13, marginTop: 8 }}>
            Wahrscheinlich fehlt die Tabelle noch. Bitte den Abschnitt «email_templates» aus supabase/schema.sql im Supabase SQL-Editor ausführen.
          </p>
        </div>
      ) : (
        <EmailTemplateManager templates={(data ?? []) as EmailTemplate[]} />
      )}
    </div>
  );
}
