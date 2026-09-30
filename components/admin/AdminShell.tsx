"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminPasswordChange } from "@/components/admin/AdminPasswordChange";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  badgeTone?: "red" | "gold";
  external?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export function AdminShell({
  children,
  userEmail,
  counts,
}: {
  children: ReactNode;
  userEmail: string;
  counts: {
    leads: number;
    fristen: number;
  };
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setNavOpen(false);
  }

  const sections: NavSection[] = [
    {
      title: "Übersicht",
      items: [
        { href: "/admin", label: "Heute", icon: "☀️" },
        { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
        { href: "/admin/leads", label: "Leads", icon: "⚡", badge: counts.leads, badgeTone: "red" },
      ],
    },
    {
      title: "Kunden",
      items: [
        { href: "/admin/kunden", label: "Alle Kunden", icon: "👤" },
        { href: "/admin/fristen", label: "Ablaufende Fristen", icon: "⏰", badge: counts.fristen, badgeTone: "gold" },
        { href: "/admin/inserate", label: "Alle Inserate", icon: "🏠" },
      ],
    },
    {
      title: "Erfassen",
      items: [
        { href: "/admin/erfassen", label: "Lead erfassen", icon: "➕" },
        { href: "/admin/kunde-erfassen", label: "Kunde erfassen", icon: "➕" },
        { href: "/admin/import", label: "Excel-Import", icon: "📥" },
      ],
    },
    {
      title: "Einstellungen",
      items: [
        { href: "/admin/kalender", label: "Kalender", icon: "🗓️" },
        { href: "/admin/berater", label: "Berater", icon: "🧑‍💼" },
      ],
    },
    {
      title: "Tools",
      items: [{ href: "/admin/akquise", label: "Akquise-E-Mail", icon: "✉️" }],
    },
    {
      title: "Links",
      items: [{ href: "/dashboard", label: "Kundenportal", icon: "🔗", external: true }],
    },
  ];

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  return (
    <div className="crm-theme" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <div className="crm-topbar">
        <button className="crm-burger" type="button" onClick={() => setNavOpen((v) => !v)} aria-label="Menü">
          {navOpen ? "✕" : "☰"}
        </button>
        <div className="crm-topbar-logo">
          Novi<span>Dom</span>
        </div>
        <div className="crm-topbar-sep" />
        <div className="crm-topbar-title">Admin-CRM</div>
        <div className="crm-topbar-user">{userEmail}</div>
        <AdminLogoutButton />
      </div>

      <div className="crm-layout">
        <nav className={`crm-sidebar ${navOpen ? "open" : ""}`}>
          {sections.map((section) => (
            <div key={section.title}>
              <div className="crm-sidebar-section">{section.title}</div>
              {section.items.map((item) => {
                const active = !item.external && isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className={`crm-nav-item ${active ? "active" : ""}`}
                  >
                    <span aria-hidden>{item.icon}</span>
                    {item.label}
                    {typeof item.badge === "number" && item.badge > 0 && (
                      <span className={`crm-nav-badge ${item.badgeTone === "gold" ? "gold" : ""}`}>{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
          <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
            <AdminPasswordChange />
          </div>
        </nav>

        <div className={`crm-schatten ${navOpen ? "open" : ""}`} onClick={() => setNavOpen(false)} />

        <main className="crm-main">{children}</main>
      </div>
    </div>
  );
}
