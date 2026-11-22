<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Zusammenarbeit NoviDom ↔ HypoCasa (bei allen Änderungen einhalten)

- HypoCasa ist eine eigene Firma mit eigenem CRM (hypocasa.ch/crm, PHP/SQLite bei Metanet). NoviDom (Next.js/Supabase/Vercel) speichert keine HypoCasa-Daten: keine HypoCasa-Leads, -Kunden oder -Importe in Supabase, keine Schnittstelle, die HypoCasa-Daten bei NoviDom ablegt.
- Finanzierungs-, Verlängerungs- und Versicherungsanfragen gehen NUR mit Einwilligung des Kunden (Häkchen `hypocasaConsent`) an HypoCasa, über `sendToHypoCasa()` in `lib/hypocasa.ts`. Rückfall: Mail an `HYPOCASA_LEADS_EMAIL_TO`.
- Schnittstelle: `POST HYPOCASA_API_URL` mit Header `X-HC-Key = HYPOCASA_API_KEY`. HypoCasa erkennt bekannte E-Mails und legt dann keinen zweiten Lead an.
- Keine Sammellisten oder Exporte von NoviDom-Kunden an HypoCasa ohne Einwilligung.
- Neue Formulare mit Finanzierungs- oder Versicherungsbezug brauchen dasselbe Häkchen und müssen `sendToHypoCasa()` verwenden.
- Gemeinsamer Überblick: monatlich Kennzahlen (Anzahl Leads, Abschlüsse) per CSV aus beiden CRMs in eine gemeinsame Excel-Liste (NoviDom: `/api/admin/kennzahlen`). Keine Personendaten zusammenführen.
