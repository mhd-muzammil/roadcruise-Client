import React from "react";

/**
 * Shared layout for content/legal pages (Terms, Privacy, Refund, etc.).
 * Renders a branded page header + a readable prose container. Pages pass a
 * `badge`, `title`, `intro`, optional `updated` date, and their body as children
 * (compose with the exported <Section> helper for consistent headings).
 */
export function LegalPage({ badge, title, intro, updated, children }) {
  return (
    <div className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Header */}
      <div className="py-14 border-b border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase">{badge}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
            {title}
          </h1>
          {intro && (
            <p className="text-sm max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
              {intro}
            </p>
          )}
          {updated && (
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Last updated: {updated}</p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        {children}
      </div>
    </div>
  );
}

/** A titled content section with consistent spacing and typography. */
export function Section({ title, children }) {
  return (
    <section className="space-y-3">
      {title && (
        <h2 className="text-lg md:text-xl font-serif font-bold text-zinc-900 dark:text-white">{title}</h2>
      )}
      <div className="space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-light">
        {children}
      </div>
    </section>
  );
}

/** A styled unordered list for policy points. */
export function Bullets({ items }) {
  return (
    <ul className="space-y-2 list-disc list-inside marker:text-gold">
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}

export default LegalPage;
