"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  Zap,
  AlarmClock,
  Paperclip,
  Users,
  Clock,
  Building2,
  PieChart,
  UserPlus,
  Send,
  Mail,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminPasswordChange } from "@/components/admin/AdminPasswordChange";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Sun;
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
    nachfassen: number;
    unterlagen: number;
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
        { href: "/admin", label: "Heute", icon: Sun },
        { href: "/admin/leads", label: "Leads", icon: Zap, badge: counts.leads, badgeTone: "red" },
        { href: "/admin/nachfassen", label: "Nachfassen", icon: AlarmClock, badge: counts.nachfassen, badgeTone: "gold" },
        { href: "/admin/unterlagen", label: "Unterlagen", icon: Paperclip, badge: counts.unterlagen, badgeTone: "gold" },
      ],
    },
    {
      title: "Kunden",
      items: [
        { href: "/admin/kunden", label: "Alle Kunden", icon: Users },
        { href: "/admin/fristen", label: "Ablaufende Fristen", icon: Clock, badge: counts.fristen, badgeTone: "gold" },
        { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
      ],
    },
    {
      title: "Inserate",
      items: [{ href: "/admin/inserate", label: "Alle Inserate", icon: Building2 }],
    },
    {
      title: "Auswertung",
      items: [{ href: "/admin/kanaele", label: "Was bringt was", icon: PieChart }],
    },
    {
      title: "Erfassen",
      items: [{ href: "/admin/erfassen", label: "Lead erfassen", icon: UserPlus }],
    },
    {
      title: "Tools",
      items: [{ href: "/admin/akquise", label: "Akquise-E-Mail", icon: Send }],
    },
    {
      title: "Links",
      items: [{ href: "/dashboard", label: "Kundenportal", icon: ExternalLink, external: true }],
    },
  ];

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  return (
    <div className="crm-theme" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <div className="crm-topbar">
        <button className="crm-burger" type="button" onClick={() => setNavOpen((v) => !v)} aria-label="Menü">
          {navOpen ? <X className="h-4 w-4" strokeWidth={2} /> : <Menu className="h-4 w-4" strokeWidth={2} />}
        </button>
        <div className="crm-topbar-logo">NoviDom</div>
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
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className={`crm-nav-item ${active ? "active" : ""}`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
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
