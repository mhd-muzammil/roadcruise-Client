import React from "react";
import { formatINR } from "../../utils/fare";

/**
 * Itemised fare: charge lines (with their "₹X × Y days" working), subtotal,
 * GST and the total. Renders the server's figures verbatim — it never
 * recomputes an amount.
 */
export default function FareBreakdown({ pricing, compact = false, className = "" }) {
  if (!pricing) return null;
  const hasGst = pricing.gstAmount != null;
  const pad = compact ? "py-1.5" : "py-2";

  return (
    <div className={`text-sm ${className}`}>
      <ul className="divide-y divide-zinc-100 dark:divide-white/5">
        {pricing.lines.map((l) => (
          <li key={`${l.key}-${l.label}`} className={`flex items-start justify-between gap-4 ${pad}`}>
            <span className="min-w-0">
              <span className="block font-medium text-zinc-800 dark:text-zinc-100">{l.label}</span>
              {l.detail && <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{l.detail}</span>}
            </span>
            <span className="shrink-0 font-semibold text-zinc-900 dark:text-white tabular-nums">₹ {formatINR(l.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 pt-2 border-t border-dashed border-zinc-200 dark:border-white/10 space-y-1">
        {hasGst && (
          <>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <span>Subtotal</span>
              <span className="tabular-nums">₹ {formatINR(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <span>GST ({pricing.gstRate}%)</span>
              <span className="tabular-nums">₹ {formatINR(pricing.gstAmount)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between items-baseline pt-1.5 mt-1 border-t border-zinc-200 dark:border-white/10">
          <span className="font-bold text-zinc-900 dark:text-white">Total{hasGst ? " (incl. GST)" : ""}</span>
          <span className={`font-bold text-gold tabular-nums ${compact ? "text-base" : "text-lg"}`}>₹ {formatINR(pricing.total)}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Pickup → stops → drop as a vertical timeline. `stops` accepts either
 * { label } objects (bookings, searches) or plain strings.
 */
export function RouteTimeline({ pickup, stops = [], drop, className = "" }) {
  const points = [
    { kind: "Pickup", label: pickup },
    ...stops.map((s, i) => ({ kind: `Stop ${i + 1}`, label: typeof s === "string" ? s : s?.label })),
    { kind: "Drop", label: drop },
  ].filter((p) => p.label);
  if (!points.length) return null;

  return (
    <ol className={`relative ${className}`}>
      {points.map((p, i) => (
        <li key={`${p.kind}-${i}`} className="relative pl-6 pb-3 last:pb-0">
          {i < points.length - 1 && (
            <span className="absolute left-[5px] top-3.5 bottom-0 w-px bg-gold/40" aria-hidden="true" />
          )}
          <span
            className={`absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full border-2 ${
              p.kind.startsWith("Stop") ? "border-gold bg-white dark:bg-zinc-900" : "border-gold bg-gold"
            }`}
            aria-hidden="true"
          />
          <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{p.kind}</span>
          <span className="block text-sm font-medium text-zinc-900 dark:text-white leading-snug break-words">{p.label}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Post-trip (final invoice) charges recorded when a trip is closed: km summary,
 * extra-km / extra-charge lines, GST on them, tolls, and the final total
 * (booked fare + these). Server figures, rendered verbatim.
 */
export function PostTripCharges({ closure, bookedTotal, className = "" }) {
  if (!closure) return null;
  const km = (n) => `${Number(n || 0).toLocaleString("en-IN")} km`;
  const row = "flex justify-between gap-4 text-zinc-600 dark:text-zinc-300";
  return (
    <div className={`text-sm rounded-xl border border-gold/30 bg-gold/5 p-3 ${className}`}>
      <p className="text-[10px] uppercase tracking-wider font-bold text-gold mb-2">Post-trip charges</p>
      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
        {[["Included", km(closure.includedKm)], ["Actual", km(closure.actualKm)], ["Extra", km(closure.extraKm)]].map(([k, v]) => (
          <div key={k}>
            <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{k}</span>
            <span className="font-semibold text-zinc-900 dark:text-white">{v}</span>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {closure.lines.length === 0 && <p className="text-xs text-zinc-500">No extra km or charges — within the booked limits.</p>}
        {closure.lines.map((l) => (
          <div key={l.key} className={row}>
            <span className="min-w-0">{l.label}{l.detail && <span className="block text-[11px] text-zinc-400">{l.detail}</span>}</span>
            <span className="tabular-nums shrink-0">₹ {formatINR(l.amount)}</span>
          </div>
        ))}
        {closure.gstAmount > 0 && (
          <div className={row}><span>GST ({closure.gstRate}%) on extras</span><span className="tabular-nums">₹ {formatINR(closure.gstAmount)}</span></div>
        )}
        <div className={`${row} pt-1 border-t border-dashed border-zinc-200 dark:border-white/10`}>
          <span>Post-trip total</span><span className="tabular-nums font-semibold">₹ {formatINR(closure.total)}</span>
        </div>
        {bookedTotal != null && (
          <div className="flex justify-between items-baseline pt-1.5 border-t border-zinc-200 dark:border-white/10">
            <span className="font-bold text-zinc-900 dark:text-white">Final total</span>
            <span className="font-bold text-gold tabular-nums">₹ {formatINR(Math.round((Number(bookedTotal) + Number(closure.total || 0)) * 100) / 100)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
