import { Check } from "lucide-react";

const STEPS = ["Erfasst", "Fotos & Präsentation", "Online geschaltet", "Besichtigungen", "Verkauft"] as const;

export function SaleStepper({
  hasPhotos,
  isOnline,
  hasViewingRequests,
  isSold,
}: {
  hasPhotos: boolean;
  isOnline: boolean;
  hasViewingRequests: boolean;
  isSold: boolean;
}) {
  const done = [true, hasPhotos, isOnline, hasViewingRequests, isSold];
  const currentIndex = isSold ? 4 : done.lastIndexOf(true);

  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const isDone = done[i];
        const isCurrent = i === currentIndex && !isSold;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                  isDone
                    ? "border-amber bg-amber text-ink"
                    : isCurrent
                      ? "border-amber text-amber-soft"
                      : "border-line text-ivory-dim/40"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : i + 1}
              </div>
              <span className={`text-center text-[10px] leading-tight ${isDone || isCurrent ? "text-ivory-dim" : "text-ivory-dim/40"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-1.5 mb-4 h-px flex-1 ${done[i + 1] || isDone ? "bg-amber/50" : "bg-line"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
