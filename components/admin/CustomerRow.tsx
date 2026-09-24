"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, FileText } from "lucide-react";
import { updateCustomerDetails } from "@/app/admin/actions";
import { SaleDeadlineBar } from "./SaleDeadlineBar";

type Customer = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  birthdate: string | null;
  role: string;
  created_at: string;
};

type AssignedListing = {
  id: string;
  address: string;
  city: string;
  status: string;
  activated_at: string | null;
  sale_deadline_months: number;
  documents: { id: string; name: string; url: string }[];
};

const fieldClasses =
  "rounded-lg border border-line bg-ink px-3 py-2 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none";

export function CustomerRow({
  customer,
  assignedListings,
}: {
  customer: Customer;
  assignedListings: AssignedListing[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(formData: FormData) {
    setBusy(true);
    setError(null);
    const res = await updateCustomerDetails(customer.id, formData);
    setBusy(false);
    if (res.error) setError(res.error);
    else router.refresh();
  }

  return (
    <li className="px-4 py-3 text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-ivory">
          {customer.full_name || "—"}{" "}
          <span className="text-ivory-dim">{customer.full_name ? `· ${customer.email}` : customer.email}</span>
        </span>
        <span className="flex items-center gap-3 font-mono text-xs text-ivory-dim/60">
          {customer.role === "admin" ? "Admin" : "Kunde"} · {new Date(customer.created_at).toLocaleDateString("de-CH")}
          {assignedListings.length > 0 && (
            <span className="rounded-full border border-amber/40 px-2 py-0.5 text-amber-soft">
              {assignedListings.length} Objekt{assignedListings.length === 1 ? "" : "e"}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.5} />
        </span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4 border-t border-line pt-4">
          <form action={handleSave} className="grid gap-2.5 sm:grid-cols-3">
            <input name="full_name" defaultValue={customer.full_name ?? ""} placeholder="Name" className={fieldClasses} />
            <input name="phone" defaultValue={customer.phone ?? ""} placeholder="Telefonnummer" className={fieldClasses} />
            <input name="birthdate" type="date" defaultValue={customer.birthdate ?? ""} className={fieldClasses} />
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-amber px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink disabled:opacity-60 sm:col-span-3 sm:w-fit"
            >
              {busy ? "Speichert…" : "Speichern"}
            </button>
          </form>
          {error && <p className="text-xs text-red-400">{error}</p>}

          {assignedListings.length === 0 ? (
            <p className="text-xs text-ivory-dim/60">Kein Objekt zugewiesen.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {assignedListings.map((l) => (
                <div key={l.id} className="rounded-xl border border-line bg-ink p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ivory">
                      {l.address}, {l.city}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wide text-ivory-dim/60">{l.status}</span>
                  </div>
                  {(l.status === "active" || l.status === "reserved") && (
                    <div className="mt-2">
                      <SaleDeadlineBar activatedAt={l.activated_at} deadlineMonths={l.sale_deadline_months} />
                    </div>
                  )}
                  {l.documents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {l.documents.map((doc) => (
                        <span
                          key={doc.id}
                          className="flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-ivory-dim"
                        >
                          <FileText className="h-3 w-3" strokeWidth={1.5} />
                          {doc.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
