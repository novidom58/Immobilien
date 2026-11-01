import { createClient } from "@/lib/supabase/server";

// Leads als CSV (Excel-tauglich, Semikolon, UTF-8 mit BOM) für den Import in
// ein anderes CRM. Nur für Admins.
export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) return new Response("Nicht eingerichtet.", { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Nicht angemeldet.", { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return new Response("Keine Admin-Rechte.", { status: 403 });

  const archiv = new URL(request.url).searchParams.get("archiv") === "1";
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5000);
  if (error) return new Response(`Export fehlgeschlagen: ${error.message}`, { status: 500 });

  const rows = (data ?? []).filter((l) => Boolean(l.archived_at) === archiv);
  const header = ["Eingang", "Name", "E-Mail", "Telefon", "Typ", "Quelle", "Status", "Nachricht"];
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  const lines = rows.map((l) =>
    [
      l.created_at ? new Date(l.created_at as string).toLocaleString("de-CH", { timeZone: "Europe/Zurich" }) : "",
      l.name,
      l.email,
      l.phone,
      l.type,
      l.source,
      l.status,
      l.message,
    ]
      .map(cell)
      .join(";")
  );
  const csv = "﻿" + [header.map(cell).join(";"), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="novidom-leads-${archiv ? "archiv-" : ""}${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
