import React, { useEffect, useState } from "react";
import { X, ArrowLeft, Plane, MoveRight, Repeat, Clock, MessageSquare } from "lucide-react";
import TripPlanner from "./TripPlanner";
import { TRIP_TYPES, tripTypeByKey } from "../../utils/fare";

/**
 * The header "Book Now" dialog.
 *
 * Two steps, because a customer's first decision is WHAT KIND of trip this is —
 * the fields that follow (drop location, return date, hourly package) only make
 * sense once that's known:
 *
 *   1. pick a trip type   — Airport / One-Way / Round-Trip / Hourly
 *   2. fill that type's form — rendered by the SAME TripPlanner the hero uses,
 *      so pickup/drop get the identical OpenStreetMap autocomplete and the
 *      submit lands on /book/results with real per-vehicle fares.
 *
 * Deliberately reuses TripPlanner rather than copying its layout: there is one
 * fare-quoting path in the app, and the header must not become a second one.
 */

const TYPE_META = {
  airport: {
    icon: Plane,
    blurb: "Pick-up or drop at the airport, billed from 30 km.",
  },
  oneway: {
    icon: MoveRight,
    blurb: "Drop to another city — pay for one direction only.",
  },
  roundtrip: {
    icon: Repeat,
    blurb: "The car stays with you and brings you back.",
  },
  hourly: {
    icon: Clock,
    blurb: "4h/8h/12h local packages with km included.",
  },
};

export default function TripPlannerModal({ isOpen, onClose, onEnquiry }) {
  const [type, setType] = useState(null); // null => still on the picker step

  // Always reopen on the picker — the previous session's trip type shouldn't
  // silently decide this one.
  useEffect(() => {
    if (isOpen) setType(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const chosen = tripTypeByKey(type);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-zinc-950/60 dark:bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Book a trip"
    >
      <div className="relative w-full max-w-lg my-auto rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-gold/30 shadow-2xl shadow-gold/5">

        {/* Header */}
        <div className="p-5 border-b border-zinc-150 dark:border-white/5 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            {chosen && (
              <button
                type="button"
                onClick={() => setType(null)}
                aria-label="Back to trip types"
                className="p-1.5 -ml-1.5 rounded-full text-zinc-400 hover:text-gold hover:bg-zinc-150 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
            )}
            <div className="min-w-0">
              <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-white tracking-wide truncate">
                {chosen ? chosen.label : "What kind of trip?"}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {chosen ? "Tell us where and when — we'll show live fares" : "Choose a service to see the right fields"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close booking dialog"
            className="p-1.5 text-zinc-400 hover:text-gold hover:bg-zinc-150 dark:hover:bg-white/5 rounded-full transition-all cursor-pointer shrink-0"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {/* STEP 1 — trip type */}
          {!chosen && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRIP_TYPES.map((t) => {
                  const { icon: Icon, blurb } = TYPE_META[t.key] || {};
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setType(t.key)}
                      className="group flex flex-col gap-2 p-4 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-gold hover:bg-gold/5 text-left transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <span className="w-9 h-9 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-colors">
                        {Icon && <Icon className="w-4.5 h-4.5 text-gold group-hover:text-zinc-950 transition-colors" />}
                      </span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{t.label}</span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">{blurb}</span>
                    </button>
                  );
                })}
              </div>

              {/* The header's old behaviour — a free-form enquiry — stays
                  reachable for anything the four trip types don't cover
                  (tour packages, weddings, corporate contracts). */}
              {onEnquiry && (
                <button
                  type="button"
                  onClick={() => { onClose(); onEnquiry(); }}
                  className="w-full flex items-center justify-center gap-2 pt-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-gold transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Tour package or custom trip? Send an enquiry instead
                </button>
              )}
            </div>
          )}

          {/* STEP 2 — that trip type's form */}
          {chosen && (
            <TripPlanner
              variant="panel"
              hideTypeSelect
              initial={{ type: chosen.key }}
              onSubmitted={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
