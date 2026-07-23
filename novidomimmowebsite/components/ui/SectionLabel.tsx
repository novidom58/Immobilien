export function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-blueprint">
      <span className="h-px w-8 bg-blueprint/60" aria-hidden />
      {children}
    </div>
  );
}
