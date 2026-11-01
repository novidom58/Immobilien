// Ansprechpersonen für Exposé und Flyer. Name muss mit «Berater» im CRM übereinstimmen.
export const TEAM = [
  { name: "Gregor Jud", role: "Managing Partner", phone: "+41 79 958 95 01", email: "gregor.jud@novidom-immo.ch" },
  { name: "Rudolf Schnuderl", role: "Senior Partner", phone: "+41 79 541 21 12", email: "rudolf.schnuderl@novidom-immo.ch" },
  { name: "Kim Brunner", role: "Senior Partner", phone: "+41 79 961 46 29", email: "kim.brunner@novidom-immo.ch" },
  { name: "Jana Schnuderl", role: "Immobilienmaklerin", phone: "+41 79 605 31 43", email: "jana.schnuderl@novidom-immo.ch" },
] as const;

export const COMPANY = {
  name: "NoviDom Immobilien AG",
  street: "Gotthardstrasse 30",
  city: "6300 Zug",
  email: "verkaufen@novidom-immo.ch",
  web: "www.novidom-immo.ch",
};

export function contactFor(berater: string | null | undefined) {
  const wanted = (berater ?? "").trim().toLowerCase();
  return TEAM.find((t) => wanted && (t.name.toLowerCase() === wanted || wanted.includes(t.name.split(" ")[1].toLowerCase()))) ?? null;
}
