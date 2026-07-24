import { Percent, ShieldCheck, Users, Sparkles } from "lucide-react";
import { Reveal } from "@/lib/reveal";

const items = [
  { icon: Percent, label: "Fixe 0.95% Kommission" },
  { icon: ShieldCheck, label: "Volle Transparenz" },
  { icon: Users, label: "Persönliche Betreuung" },
  { icon: Sparkles, label: "Digitale Vermarktung" },
];

export function TrustBar() {
  return (
    <div className="relative border-y border-line bg-ink-2/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-6 lg:grid-cols-4 lg:px-10">
        {items.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.08}>
            <div className="flex items-center gap-3 py-8">
              <item.icon className="h-5 w-5 shrink-0 text-amber" strokeWidth={1.5} />
              <span className="font-sans text-sm text-ivory-dim">{item.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
