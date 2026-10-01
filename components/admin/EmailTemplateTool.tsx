"use client";

import { useState } from "react";
import { Copy, Mail, Check } from "lucide-react";
import { logCustomerEmailActivity } from "@/app/admin/actions";

export function EmailTemplateTool({
  subject,
  body,
  recipientEmail,
  customerId,
  logLabel,
}: {
  subject: string;
  body: string;
  recipientEmail: string;
  customerId?: string;
  logLabel: string;
}) {
  const [text, setText] = useState(body);
  const [copied, setCopied] = useState(false);

  function logActivity() {
    if (customerId) void logCustomerEmailActivity(customerId, logLabel);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    logActivity();
    setTimeout(() => setCopied(false), 2000);
  }

  const mailtoHref = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 16, background: "var(--bg)" }}>
      <div className="field-label">Betreff</div>
      <div className="mt-1" style={{ fontSize: 13 }}>
        {subject}
      </div>
      <div className="field-label mt-3">Text (editierbar)</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="field-textarea mt-1"
        style={{ background: "var(--surface)" }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={handleCopy} className="btn btn-ghost btn-sm">
          {copied ? <Check className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />}
          {copied ? "Kopiert" : "Text kopieren"}
        </button>
        <a href={mailtoHref} onClick={logActivity} className="btn btn-primary btn-sm">
          <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
          In E-Mail-Programm öffnen
        </a>
      </div>
    </div>
  );
}
