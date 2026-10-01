"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { CustomerDetailModal } from "./CustomerDetailModal";
import { saleDeadlineProgress } from "@/lib/dates";
import { formatSwissPhone } from "@/lib/phone";
import type { CrmCustomer, AdminListing } from "@/lib/admin-data";

const TYPE_BADGE: Record<string, string> = {
  bestand: "badge-blue",
  neukunde: "badge-gold",
  ex: "badge-muted",
};
const TYPE_LABEL: Record<string, string> = {
  bestand: "Bestand",
  neukunde: "Neukunde",
  ex: "Ex-Kunde",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Aktiv",
  reserved: "Reserviert",
  sold: "Verkauft",
  draft: "Entwurf",
};

function AblaufPill({ listing }: { listing: CrmCustomer["listing"] }) {
  if (!listing || !listing.activated_at || (listing.status !== "active" && listing.status !== "reserved")) {
    return <span className="td-light">—</span>;
  }
  const { remainingDays } = saleDeadlineProgress(listing.activated_at, listing.sale_deadline_months);
  const tone = remainingDays <= 0 ? "badge-red" : remainingDays <= 30 ? "badge-gold" : "badge-green";
  return <span className={`badge ${tone}`}>{remainingDays}T</span>;
}

export function CustomerList({
  customers,
  listings,
  beraterOptions,
}: {
  customers: CrmCustomer[];
  listings: AdminListing[];
  beraterOptions: string[];
}) {
  const [query, setQuery] = useState("");
  const [typFilter, setTypFilter] = useState("aktiv");
  const [beraterFilter, setBeraterFilter] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const exCount = customers.filter((c) => c.typ === "ex").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (typFilter === "aktiv" && c.typ === "ex") return false;
      if (typFilter === "bestand" && c.typ !== "bestand") return false;
      if (typFilter === "neukunde" && c.typ !== "neukunde") return false;
      if (typFilter === "ex" && c.typ !== "ex") return false;
      if (beraterFilter && c.berater !== beraterFilter) return false;
      if (q) {
        const haystack = `${c.full_name} ${c.email ?? ""} ${c.phone ?? ""} ${c.address ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [customers, query, typFilter, beraterFilter]);

  const openCustomer = customers.find((c) => c.id === openId) ?? null;

  function handleExport() {
    const header = ["Name", "Typ", "E-Mail", "Telefon", "Adresse", "Zuständig", "Ziel"];
    const rows = filtered.map((c) => [c.full_name, TYPE_LABEL[c.typ] ?? c.typ, c.email ?? "", c.phone ?? "", c.address ?? "", c.berater ?? "", c.ziel ?? ""]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kunden.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Kunden</div>
          <div className="page-sub">Bestandskunden und Neukunden</div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleExport} className="btn btn-ghost btn-sm">
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Liste ziehen
          </button>
          <Link href="/admin/kunde-erfassen" className="btn btn-primary">
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Kunde erfassen
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Name, Ort, Telefon…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="filter-select" value={typFilter} onChange={(e) => setTypFilter(e.target.value)}>
            <option value="aktiv">Alle aktiven</option>
            <option value="bestand">Bestand</option>
            <option value="neukunde">Neukunde</option>
            <option value="ex">📦 Archiv: Ex-Kunden</option>
          </select>
          <select className="filter-select" value={beraterFilter} onChange={(e) => setBeraterFilter(e.target.value)}>
            <option value="">Alle</option>
            {beraterOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <span className="td-light" style={{ fontSize: 12 }}>
            {filtered.length} Kunden · {exCount} im Archiv
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👤</div>
            <div className="empty-text">Keine Einträge</div>
          </div>
        ) : (
          <div className="crm-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Typ</th>
                  <th>Status</th>
                  <th>Objekt-Preis</th>
                  <th>Ablauf</th>
                  <th>Zuständig</th>
                  <th>Ort</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setOpenId(c.id)}>
                    <td>
                      <div className="td-name">{c.full_name}</div>
                      <div className="td-light" style={{ fontSize: 11 }}>
                        {c.email}
                        {c.phone ? ` · ${formatSwissPhone(c.phone)}` : ""}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${TYPE_BADGE[c.typ] ?? "badge-muted"}`}>{TYPE_LABEL[c.typ] ?? c.typ}</span>
                    </td>
                    <td>
                      {c.listing ? (
                        <span className="badge badge-muted">{STATUS_LABEL[c.listing.status] ?? c.listing.status}</span>
                      ) : (
                        <span className="td-light">Offen</span>
                      )}
                    </td>
                    <td className="td-light">
                      {c.listing?.price_chf ? `CHF ${c.listing.price_chf.toLocaleString("en-US").replace(/,/g, "'")}` : "—"}
                    </td>
                    <td>
                      <AblaufPill listing={c.listing} />
                    </td>
                    <td>{c.berater ? <span className="bchip">{c.berater}</span> : <span className="td-light">—</span>}</td>
                    <td className="td-light">{c.listing?.city ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {openCustomer && (
        <CustomerDetailModal customer={openCustomer} listings={listings} beraterOptions={beraterOptions} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
