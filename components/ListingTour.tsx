"use client";

import { useState } from "react";
import { Scan } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ListingTour({ listingId, tourUrl }: { listingId: string; tourUrl: string }) {
  const [open, setOpen] = useState(false);

  function handleOpen() {
    setOpen(true);
    const supabase = createClient();
    supabase?.rpc("log_listing_tour_view", { p_listing_id: listingId });
  }

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-xl font-semibold text-ivory">360°-Rundgang</h2>
        <span className="rounded-full border border-amber/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber-soft">
          Giraffe360
        </span>
      </div>
      <p className="mt-1 text-sm text-ivory-dim">
        Bewegen Sie sich frei durch die Räume — wie bei einer echten Besichtigung.
      </p>
      <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-line bg-ink-2">
        {open ? (
          <iframe
            src={tourUrl}
            title="3D-Rundgang"
            className="h-full w-full"
            allow="xr-spatial-tracking; gyroscope; accelerometer"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={handleOpen}
            className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-ink-3 via-ink-2 to-ink transition-colors hover:bg-ink-3"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-amber/40 bg-ink">
              <Scan className="h-6 w-6 text-amber" strokeWidth={1.5} />
            </span>
            <span className="font-mono text-xs uppercase tracking-wide text-amber-soft">
              360°-Rundgang starten →
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
