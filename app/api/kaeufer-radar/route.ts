import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const VALID_TYPES = new Set(["Haus", "Wohnung", "Rendite", "Andere"]);

type BuyerProfile = {
  budget_min: number | null;
  budget_max: number | null;
  wunsch_ort: string | null;
  objekt_typ: string | null;
  zimmer_min: number | null;
  wohnflaeche_min: number | null;
};

// Eigentumswohnung wird im CRM teils als "Wohnung", teils als
// "Stockwerkeigentum" erfasst; für Käufer ist das dasselbe.
function sameType(a: string, b: string) {
  const norm = (t: string) => (t === "Stockwerkeigentum" ? "Wohnung" : t);
  return norm(a) === norm(b);
}

function normalizeOrt(value: string) {
  return value.toLowerCase().replace(/\d+/g, "").trim();
}

function matches(buyer: BuyerProfile, input: { ort: string; typ: string | null; zimmer: number | null; preis: number | null }) {
  const hasCriteria =
    buyer.budget_min || buyer.budget_max || buyer.wunsch_ort || buyer.objekt_typ || buyer.zimmer_min || buyer.wohnflaeche_min;
  if (!hasCriteria) return false;

  if (buyer.wunsch_ort) {
    const orte = buyer.wunsch_ort
      .split(",")
      .map(normalizeOrt)
      .filter(Boolean);
    if (orte.length > 0 && !orte.some((o) => o.includes(input.ort) || input.ort.includes(o))) return false;
  }
  if (buyer.objekt_typ && input.typ && !sameType(buyer.objekt_typ, input.typ)) return false;
  if (buyer.zimmer_min && input.zimmer !== null && input.zimmer < buyer.zimmer_min) return false;
  // Käufer strecken ihr Budget erfahrungsgemäss etwas; 10% Toleranz nach oben.
  if (buyer.budget_max && input.preis !== null && input.preis > buyer.budget_max * 1.1) return false;
  if (buyer.budget_min && input.preis !== null && input.preis < buyer.budget_min * 0.8) return false;
  return true;
}

/**
 * Öffentlicher Käufer-Radar: zählt vorgemerkte Kaufinteressenten aus dem CRM,
 * deren Suchprofil zu den Eckdaten passt. Gibt bewusst nur eine Zahl zurück,
 * keine personenbezogenen Daten.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const ort = typeof body.ort === "string" ? normalizeOrt(body.ort.slice(0, 80)) : "";
  const typ = typeof body.typ === "string" && VALID_TYPES.has(body.typ) ? body.typ : null;
  const zimmerRaw = Number(body.zimmer);
  const zimmer = Number.isFinite(zimmerRaw) && zimmerRaw > 0 && zimmerRaw < 50 ? zimmerRaw : null;
  const preisRaw = Number(body.preis);
  const preis = Number.isFinite(preisRaw) && preisRaw >= 50_000 && preisRaw < 100_000_000 ? preisRaw : null;

  if (ort.length < 2) {
    return NextResponse.json({ error: "Bitte geben Sie den Ort Ihrer Immobilie an." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Der Käufer-Radar ist gerade nicht verfügbar." }, { status: 503 });
  }

  const supabase = createSupabaseClient(url, serviceKey);
  const { data, error } = await supabase
    .from("customers")
    .select("budget_min, budget_max, wunsch_ort, objekt_typ, zimmer_min, wohnflaeche_min")
    .eq("ziel", "kaufen")
    .neq("typ", "ex");

  if (error) {
    return NextResponse.json({ error: "Der Käufer-Radar ist gerade nicht verfügbar." }, { status: 503 });
  }

  const count = ((data ?? []) as BuyerProfile[]).filter((b) => matches(b, { ort, typ, zimmer, preis })).length;
  return NextResponse.json({ count });
}
