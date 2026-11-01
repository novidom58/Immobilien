import { DETAIL_FIELDS, type ListingDetails } from "@/lib/listingDetails";

/** Eckdaten, Highlights und Merkmale im Inserat-Formular (Erfassen und Bearbeiten). */
export function ListingDetailsFields({ details = {} }: { details?: ListingDetails }) {
  return (
    <details className="sm:col-span-2" open={Object.keys(details).length > 0}>
      <summary className="field-label" style={{ cursor: "pointer", marginBottom: 8 }}>
        Eckdaten, Highlights und Merkmale (optional)
      </summary>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {DETAIL_FIELDS.map((f) => (
          <input
            key={f.key}
            name={`d_${f.key}`}
            defaultValue={details[f.key] ?? ""}
            placeholder={`${f.label}: ${f.placeholder}`}
            aria-label={f.label}
            className="field-input"
          />
        ))}
      </div>
      <textarea
        name="d_highlights"
        rows={4}
        defaultValue={(details.highlights ?? []).join("\n")}
        placeholder={"Highlights, eines pro Zeile (max. 5), z.B.\nVoll möbliert, sofort bezugsbereit\nTerrasse mit ca. 20 m²"}
        className="field-textarea"
        style={{ marginTop: 10, width: "100%" }}
      />
      <input
        name="d_merkmale"
        defaultValue={(details.merkmale ?? []).join(", ")}
        placeholder="Merkmale, mit Komma getrennt: Balkon, Lift, Geschirrspüler, Haustiere erlaubt"
        className="field-input"
        style={{ marginTop: 10, width: "100%" }}
      />
    </details>
  );
}
