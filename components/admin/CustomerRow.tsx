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
    <div style={{ borderBottom: "1px solid var(--border)", padding: "12px 20px" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
      >
        <span className="td-name">
          {customer.full_name || "—"} <span className="td-light">{customer.full_name ? `· ${customer.email}` : customer.email}</span>
        </span>
        <span className="flex items-center gap-3 td-light" style={{ fontSize: 12 }}>
          {customer.role === "admin" ? "Admin" : "Kunde"} · {new Date(customer.created_at).toLocaleDateString("de-CH")}
          {assignedListings.length > 0 && (
            <span className="badge badge-blue">
              {assignedListings.length} Objekt{assignedListings.length === 1 ? "" : "e"}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.75} />
        </span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <form action={handleSave} className="grid gap-2.5 sm:grid-cols-3">
            <input name="full_name" defaultValue={customer.full_name ?? ""} placeholder="Name" className="field-input" />
            <input name="phone" defaultValue={customer.phone ?? ""} placeholder="Telefonnummer" className="field-input" />
            <input name="birthdate" type="date" defaultValue={customer.birthdate ?? ""} className="field-input" />
            <button type="submit" disabled={busy} className="btn btn-primary btn-sm sm:col-span-3" style={{ width: "fit-content" }}>
              {busy ? "Speichert…" : "Speichern"}
            </button>
          </form>
          {error && (
            <p style={{ fontSize: 12, color: "var(--red)" }}>{error}</p>
          )}

          {assignedListings.length === 0 ? (
            <p className="td-light" style={{ fontSize: 12 }}>Kein Objekt zugewiesen.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {assignedListings.map((l) => (
                <div key={l.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 14, background: "var(--bg)" }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="td-name">
                      {l.address}, {l.city}
                    </span>
                    <span className="badge badge-muted">{l.status}</span>
                  </div>
                  {(l.status === "active" || l.status === "reserved") && (
                    <div className="mt-2">
                      <SaleDeadlineBar activatedAt={l.activated_at} deadlineMonths={l.sale_deadline_months} />
                    </div>
                  )}
                  {l.documents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {l.documents.map((doc) => (
                        <span key={doc.id} className="badge badge-muted">
                          <FileText className="h-3 w-3" strokeWidth={1.75} />
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
    </div>
  );
}
