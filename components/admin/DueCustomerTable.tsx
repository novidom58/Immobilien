"use client";

import { useState } from "react";
import { CustomerDetailModal } from "./CustomerDetailModal";
import { formatSwissPhone } from "@/lib/phone";
import type { CrmCustomer, AdminListing } from "@/lib/admin-data";

/** Kunden mit fälliger Wiedervorlage; Klick öffnet die Kundenakte inkl. Mailvorlagen. */
export function DueCustomerTable({
  customers,
  listings,
  beraterOptions,
}: {
  customers: CrmCustomer[];
  listings: AdminListing[];
  beraterOptions: string[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openCustomer = customers.find((c) => c.id === openId) ?? null;
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="crm-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Kontakt</th>
              <th>Wiedervorlage</th>
              <th>Zuständig</th>
              <th>Letzter Kontakt</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const last = c.activity[0];
              const overdue = c.follow_up_at !== null && c.follow_up_at < todayStr;
              return (
                <tr key={c.id} className={overdue ? "termin-offen" : ""} style={{ cursor: "pointer" }} onClick={() => setOpenId(c.id)}>
                  <td className="td-name">{c.full_name}</td>
                  <td className="td-light">
                    {c.phone ? formatSwissPhone(c.phone) : ""}
                    {c.phone && c.email ? " · " : ""}
                    {c.email ?? ""}
                  </td>
                  <td>
                    <span className={`badge ${overdue ? "badge-red" : "badge-gold"}`}>
                      {c.follow_up_at ? new Date(c.follow_up_at).toLocaleDateString("de-CH") : "—"}
                    </span>
                  </td>
                  <td>{c.berater ? <span className="bchip">{c.berater}</span> : <span className="td-light">—</span>}</td>
                  <td className="td-light" style={{ fontSize: 12 }}>
                    {last ? `${last.text} (${new Date(last.created_at).toLocaleDateString("de-CH")})` : "—"}
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm">
                      Öffnen
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {openCustomer && (
        <CustomerDetailModal customer={openCustomer} listings={listings} beraterOptions={beraterOptions} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
