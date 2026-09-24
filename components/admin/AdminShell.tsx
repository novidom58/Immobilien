"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  Zap,
  AlarmClock,
  Users,
  Mail,
  Building2,
  UserPlus,
  Send,
} from "lucide-react";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { PasswordSettingsToggle } from "@/components/ui/PasswordSettingsToggle";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Sun;
  badge?: number;
};

type NavSection = {
  title?: string;
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
    kunden: number;
    newsletter: number;
    inserate: number;
  };
}) {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      items: [
        { href: "/admin", label: "Heute", icon: Sun },
        { href: "/admin/leads", label: "Leads", icon: Zap, badge: counts.leads },
        { href: "/admin/nachfassen", label: "Nachfassen", icon: AlarmClock, badge: counts.nachfassen },
      ],
    },
    {
      title: "Kunden",
      items: [
        { href: "/admin/kunden", label: "Alle Kunden", icon: Users, badge: counts.kunden },
        { href: "/admin/newsletter", label: "Newsletter", icon: Mail, badge: counts.newsletter },
      ],
    },
    {
      title: "Inserate",
      items: [{ href: "/admin/inserate", label: "Alle Inserate", icon: Building2, badge: counts.inserate }],
    },
    {
      title: "Erfassen",
      items: [{ href: "/admin/erfassen", label: "Lead erfassen", icon: UserPlus }],
    },
    {
      title: "Tools",
      items: [{ href: "/admin/akquise", label: "Akquise-E-Mail", icon: Send }],
    },
  ];

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  return (
    <div className="min-h-svh bg-ink">
      <div className="flex items-center justify-between border-b border-line bg-ink-2 px-6 py-4 lg:px-10">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ivory">
          Novi<span className="text-amber">Dom</span> <span className="text-ivory-dim">Admin</span>
        </Link>
        <div className="flex items-center gap-6">
          <PasswordSettingsToggle />
          <span className="hidden font-sans text-sm text-ivory-dim sm:inline">{userEmail}</span>
          <LogoutButton redirectTo="/admin/login" />
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-line bg-ink-2 px-4 py-2 lg:hidden">
        {sections
          .flatMap((s) => s.items)
          .map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                  active ? "bg-amber/15 text-amber-soft" : "text-ivory-dim hover:text-ivory"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {item.label}
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className="rounded-full bg-ink-3 px-1.5 text-[10px]">{item.badge}</span>
                )}
              </Link>
            );
          })}
      </nav>

      <div className="mx-auto flex max-w-7xl">
        <nav className="sticky top-6 hidden max-h-[85vh] w-60 shrink-0 overflow-y-auto border-r border-line px-4 py-6 lg:block">
          {sections.map((section, i) => (
            <div key={i} className={i > 0 ? "mt-6" : ""}>
              {section.title && (
                <div className="mb-2 px-2 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/40">
                  {section.title}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? "bg-amber/10 text-amber-soft"
                          : "text-ivory-dim hover:bg-ink-3 hover:text-ivory"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                        {item.label}
                      </span>
                      {typeof item.badge === "number" && (
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                            item.badge > 0
                              ? "bg-amber/15 text-amber-soft"
                              : "bg-ink-3 text-ivory-dim/50"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
