"use client";

import { useState } from "react";
import { Scan } from "lucide-react";

// Offizielle Matterport-Demo-Tour (discover.matterport.com) - kein echtes
// NoviDom-Objekt, dient nur als Beispiel, damit Interessent:innen wissen,
// was ein 3D-Rundgang überhaupt ist, bevor sie ihr eigenes Objekt scannen
// lassen. Sobald ein echter Rundgang zu einem Inserat existiert, wird dort
// (siehe app/immobilien/[id]/page.tsx) automatisch der echte eingebettet.
const DEMO_TOUR_URL = "https://discover.matterport.com/space/ReKKmbfowSX";

export function MatterportDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-2xl border border-line bg-ink p-6 lg:p-8">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <span className="flex items-center gap-3">
            <Scan className="h-5 w-5 text-amber" strokeWidth={1.5} />
            <span>
              <span className="block font-display text-base font-semibold text-ivory">
                Noch nie einen 3D-Rundgang gesehen?
              </span>
              <span className="text-sm text-ivory-dim">
                Beispiel ansehen — so navigieren Interessent:innen später durch Ihr Objekt.
              </span>
            </span>
          </span>
          <span className="shrink-0 font-mono text-xs uppercase tracking-wide text-amber-soft">
            Beispiel öffnen →
          </span>
        </button>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-ivory-dim/60">
              <Scan className="h-3.5 w-3.5 text-amber" strokeWidth={1.5} />
              Beispiel-Rundgang (nicht eines unserer Objekte)
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="font-mono text-xs uppercase tracking-wide text-ivory-dim/60 hover:text-ivory"
            >
              Schliessen ✕
            </button>
          </div>
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-line">
            <iframe
              src={DEMO_TOUR_URL}
              title="Beispiel eines 3D-Rundgangs"
              className="h-full w-full"
              allow="xr-spatial-tracking; gyroscope; accelerometer"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}
