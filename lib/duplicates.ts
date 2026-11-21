// Mögliche doppelte Kunden im CRM finden: gleiche E-Mail, gleiche
// Telefonnummer (letzte 9 Ziffern) oder gleicher Name. Zum Beispiel wenn
// jemand erst über die Website anfragt und später per Excel importiert wird.

type Person = { id: string; full_name: string; email: string | null; phone: string | null; created_at: string };

export type DuplicateGroup<T extends Person> = { grund: string; kunden: T[] };

const normEmail = (e: string | null) => (e ?? "").trim().toLowerCase();
const normPhone = (p: string | null) => (p ?? "").replace(/\D/g, "").slice(-9);
const normName = (n: string) =>
  n
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");

/** Gruppen von Kunden, die vermutlich dieselbe Person sind (älteste zuerst). */
export function findDuplicates<T extends Person>(list: T[]): DuplicateGroup<T>[] {
  const groups: DuplicateGroup<T>[] = [];
  const seen = new Set<string>();

  const add = (grund: string, key: (c: T) => string) => {
    const map = new Map<string, T[]>();
    for (const c of list) {
      const k = key(c);
      if (!k) continue;
      map.set(k, [...(map.get(k) ?? []), c]);
    }
    for (const kunden of map.values()) {
      if (kunden.length < 2) continue;
      const id = kunden
        .map((c) => c.id)
        .sort()
        .join("|");
      if (seen.has(id)) continue;
      seen.add(id);
      groups.push({ grund, kunden: [...kunden].sort((a, b) => a.created_at.localeCompare(b.created_at)) });
    }
  };

  add("gleiche E-Mail", (c) => normEmail(c.email));
  add("gleiche Telefonnummer", (c) => (normPhone(c.phone).length === 9 ? normPhone(c.phone) : ""));
  add("gleicher Name", (c) => (normName(c.full_name).includes(" ") ? normName(c.full_name) : ""));
  return groups;
}
