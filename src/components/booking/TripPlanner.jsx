import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightLeft, ChevronDown, Search } from "lucide-react";
import PlaceAutocomplete from "./PlaceAutocomplete";
import { TRIP_TYPES, HOURLY_PACKAGES, encodeSearch } from "../../utils/fare";

// Local YYYY-MM-DD (not UTC — bookings are made in IST evenings too).
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// One cell of the planner bar: tiny uppercase label over the control.
function PlannerField({ label, error, children, className = "" }) {
  return (
    <div className={`min-w-0 px-4 py-3 text-left ${className}`}>
      <span
        className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
          error ? "text-red-500" : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

const nativeCls =
  "w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-sm font-medium text-zinc-900 dark:text-white cursor-pointer";

/**
 * The dynamic 4-mode trip search widget (Airport / One-Way / Round-Trip /
 * Hourly). Submitting navigates to /book/results with the search encoded in
 * the URL, so results are shareable and refresh-safe.
 *
 * variant "hero"  — tab pills over a single horizontal bar (landing page)
 * variant "panel" — compact vertical card (results-page "modify search", and
 *                   the header's "Book Now" dialog)
 *
 * hideTypeSelect — panel only: the caller already picked the trip type in its
 *                  own step (the Book Now dialog), so the in-form selector is
 *                  redundant.
 * onSubmitted    — fired after a valid search navigates, so a host dialog can
 *                  close itself.
 */
export default function TripPlanner({
  variant = "hero",
  initial = null,
  hideTypeSelect = false,
  onSubmitted,
}) {
  const navigate = useNavigate();
  const [type, setType] = useState(initial?.type || "airport");
  const [pickup, setPickup] = useState(initial?.pickup || null);
  const [drop, setDrop] = useState(initial?.drop || null);
  const [date, setDate] = useState(initial?.date || "");
  const [time, setTime] = useState(initial?.time || "");
  const [returnDate, setReturnDate] = useState(initial?.returnDate || "");
  const [returnTime, setReturnTime] = useState(initial?.returnTime || "22:30");
  const [pkg, setPkg] = useState(initial?.pkg || "8h80");
  const [errors, setErrors] = useState({});

  const clearError = (key) => errors[key] && setErrors((p) => ({ ...p, [key]: "" }));

  const switchType = (key) => {
    setType(key);
    setErrors({});
  };

  const swap = () => {
    setPickup(drop);
    setDrop(pickup);
    clearError("pickup");
    clearError("drop");
  };

  const validate = () => {
    const e = {};
    if (!pickup) e.pickup = "Select a pickup from the suggestions";
    if (type !== "hourly") {
      if (!drop) e.drop = "Select a drop from the suggestions";
      else if (pickup && drop.label === pickup.label) e.drop = "Pickup and drop can't be the same";
    }
    if (!date) e.date = "Choose a date";
    else if (date < todayStr()) e.date = "Date can't be in the past";
    if (!time) e.time = "Choose a time";
    if (type === "roundtrip") {
      if (!returnDate) e.returnDate = "Choose a return date";
      else if (date && returnDate < date) e.returnDate = "Return must be on/after departure";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const search = { type, pickup, drop, date, time, returnDate, returnTime, pkg };
    navigate(`/book/results?${encodeSearch(search)}`);
    onSubmitted?.(search);
  };

  const firstError = Object.values(errors).find(Boolean);

  // ------------------------------------------------------------------ panel —
  if (variant === "panel") {
    return (
      <form onSubmit={handleSubmit} className="space-y-3 text-left">
        {!hideTypeSelect && (
          <div className="relative">
            <select
              value={type}
              onChange={(e) => switchType(e.target.value)}
              aria-label="Trip type"
              className="w-full appearance-none bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-gold/60 focus:outline-none rounded-xl py-3 pl-4 pr-9 text-sm font-semibold text-zinc-900 dark:text-white cursor-pointer"
            >
              {TRIP_TYPES.map((t) => (
                <option key={t.key} value={t.key} className="bg-white dark:bg-zinc-950">
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
          </div>
        )}

        <div className="rounded-xl border border-zinc-200 dark:border-white/10 divide-y divide-zinc-200 dark:divide-white/10">
          <PlannerField label={type === "hourly" ? "Pickup Location" : "Pickup"} error={errors.pickup}>
            <PlaceAutocomplete value={pickup} onSelect={(p) => { setPickup(p); clearError("pickup"); }} error={!!errors.pickup} />
          </PlannerField>
          {type !== "hourly" && (
            <PlannerField label="Drop" error={errors.drop}>
              <PlaceAutocomplete value={drop} onSelect={(p) => { setDrop(p); clearError("drop"); }} error={!!errors.drop} />
            </PlannerField>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PlannerField label={type === "hourly" ? "Pickup Date" : "Departure"} error={errors.date}
            className="rounded-xl border border-zinc-200 dark:border-white/10">
            <input type="date" min={todayStr()} value={date}
              onChange={(e) => { setDate(e.target.value); clearError("date"); }} className={nativeCls} />
          </PlannerField>
          <PlannerField label="Pickup-Time" error={errors.time}
            className="rounded-xl border border-zinc-200 dark:border-white/10">
            <input type="time" value={time}
              onChange={(e) => { setTime(e.target.value); clearError("time"); }} className={nativeCls} />
          </PlannerField>
        </div>

        {type === "roundtrip" && (
          <div className="grid grid-cols-2 gap-3">
            <PlannerField label="Return" error={errors.returnDate}
              className="rounded-xl border border-zinc-200 dark:border-white/10">
              <input type="date" min={date || todayStr()} value={returnDate}
                onChange={(e) => { setReturnDate(e.target.value); clearError("returnDate"); }} className={nativeCls} />
            </PlannerField>
            <PlannerField label="Drop Time" className="rounded-xl border border-zinc-200 dark:border-white/10">
              <input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className={nativeCls} />
            </PlannerField>
          </div>
        )}

        {type === "hourly" && (
          <div className="relative rounded-xl border border-zinc-200 dark:border-white/10">
            <PlannerField label="Select Package">
              <select value={pkg} onChange={(e) => setPkg(e.target.value)} className={`${nativeCls} appearance-none`}>
                {HOURLY_PACKAGES.map((p) => (
                  <option key={p.key} value={p.key} className="bg-white dark:bg-zinc-950">{p.label}</option>
                ))}
              </select>
            </PlannerField>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
          </div>
        )}

        {firstError && <p className="text-red-500 text-xs">{firstError}</p>}

        <button
          type="submit"
          className="w-full bg-gold hover:bg-gold-hover text-zinc-950 font-bold py-3 rounded-xl text-xs tracking-wider uppercase shadow-md shadow-gold/15 hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Search className="w-3.5 h-3.5" /> Search
        </button>
      </form>
    );
  }

  // ------------------------------------------------------------------- hero —
  const divider = "md:border-l md:border-zinc-200 dark:md:border-white/10 border-t border-zinc-100 dark:border-white/5 md:border-t-0";

  return (
    <div>
      {/* Trip-type tabs */}
      <div role="tablist" aria-label="Trip type" className="flex flex-wrap items-center justify-center gap-2 mb-4">
        {TRIP_TYPES.map((t) => {
          const active = t.key === type;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchType(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                active
                  ? "bg-gold text-zinc-950 shadow-md shadow-gold/25"
                  : "text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-white/15 hover:border-gold/50 hover:text-gold"
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  active ? "border-zinc-950 bg-zinc-950" : "border-current"
                }`}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 overflow-visible"
      >
        {type === "hourly" ? (
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            <PlannerField label="Pickup Location" error={errors.pickup} className="md:col-span-4">
              <PlaceAutocomplete value={pickup} onSelect={(p) => { setPickup(p); clearError("pickup"); }} error={!!errors.pickup} />
            </PlannerField>
            <PlannerField label="Pickup Date" error={errors.date} className={`md:col-span-2 ${divider}`}>
              <input type="date" min={todayStr()} value={date}
                onChange={(e) => { setDate(e.target.value); clearError("date"); }} className={nativeCls} />
            </PlannerField>
            <PlannerField label="Pickup-Time" error={errors.time} className={`md:col-span-2 ${divider}`}>
              <input type="time" value={time}
                onChange={(e) => { setTime(e.target.value); clearError("time"); }} className={nativeCls} />
            </PlannerField>
            <PlannerField label="Select Package" className={`md:col-span-2 ${divider} relative`}>
              <select value={pkg} onChange={(e) => setPkg(e.target.value)} className={`${nativeCls} appearance-none pr-5`}>
                {HOURLY_PACKAGES.map((p) => (
                  <option key={p.key} value={p.key} className="bg-white dark:bg-zinc-950">{p.label}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 bottom-4 text-gold pointer-events-none" />
            </PlannerField>
            <div className="md:col-span-2 p-2.5 flex">
              <SubmitButton />
            </div>
          </div>
        ) : type === "roundtrip" ? (
          // Six fields don't fit one comfortable row — locations on top,
          // dates/times + CTA below.
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 items-stretch md:border-b md:border-zinc-200 dark:md:border-white/10">
              <PlannerField label="Pickup" error={errors.pickup} className="relative">
                <PlaceAutocomplete value={pickup} onSelect={(p) => { setPickup(p); clearError("pickup"); }} error={!!errors.pickup} />
                <SwapButton onClick={swap} />
              </PlannerField>
              <PlannerField label="Drop" error={errors.drop} className={`${divider} md:pl-6`}>
                <PlaceAutocomplete value={drop} onSelect={(p) => { setDrop(p); clearError("drop"); }} error={!!errors.drop} />
              </PlannerField>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-12 items-stretch">
              <PlannerField label="Departure" error={errors.date} className="md:col-span-3 border-t border-zinc-100 dark:border-white/5 md:border-t-0">
                <input type="date" min={todayStr()} value={date}
                  onChange={(e) => { setDate(e.target.value); clearError("date"); }} className={nativeCls} />
              </PlannerField>
              <PlannerField label="Return" error={errors.returnDate} className={`md:col-span-3 ${divider} border-l`}>
                <input type="date" min={date || todayStr()} value={returnDate}
                  onChange={(e) => { setReturnDate(e.target.value); clearError("returnDate"); }} className={nativeCls} />
              </PlannerField>
              <PlannerField label="Pickup-Time" error={errors.time} className={`md:col-span-2 ${divider}`}>
                <input type="time" value={time}
                  onChange={(e) => { setTime(e.target.value); clearError("time"); }} className={nativeCls} />
              </PlannerField>
              <PlannerField label="Drop Time" className={`md:col-span-2 ${divider} border-l`}>
                <input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className={nativeCls} />
              </PlannerField>
              <div className="col-span-2 md:col-span-2 p-2.5 flex border-t border-zinc-100 dark:border-white/5 md:border-t-0">
                <SubmitButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            <PlannerField label="Pickup" error={errors.pickup} className="md:col-span-3 relative">
              <PlaceAutocomplete value={pickup} onSelect={(p) => { setPickup(p); clearError("pickup"); }} error={!!errors.pickup} />
              <SwapButton onClick={swap} />
            </PlannerField>
            <PlannerField label="Drop" error={errors.drop} className={`md:col-span-3 ${divider} md:pl-6`}>
              <PlaceAutocomplete value={drop} onSelect={(p) => { setDrop(p); clearError("drop"); }} error={!!errors.drop} />
            </PlannerField>
            <PlannerField label="Departure" error={errors.date} className={`md:col-span-2 ${divider}`}>
              <input type="date" min={todayStr()} value={date}
                onChange={(e) => { setDate(e.target.value); clearError("date"); }} className={nativeCls} />
            </PlannerField>
            <PlannerField label="Pickup-Time" error={errors.time} className={`md:col-span-2 ${divider}`}>
              <input type="time" value={time}
                onChange={(e) => { setTime(e.target.value); clearError("time"); }} className={nativeCls} />
            </PlannerField>
            <div className="md:col-span-2 p-2.5 flex">
              <SubmitButton />
            </div>
          </div>
        )}
      </form>

      {firstError && <p className="text-red-400 text-xs mt-2 text-center animate-fade-in">{firstError}</p>}
    </div>
  );
}

function SwapButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Swap pickup and drop"
      title="Swap pickup and drop"
      className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/15 text-zinc-500 dark:text-zinc-300 hover:text-gold hover:border-gold/50 hover:rotate-180 transition-all duration-300 cursor-pointer shadow-sm"
    >
      <ArrowRightLeft className="w-3.5 h-3.5" />
    </button>
  );
}

function SubmitButton() {
  return (
    <button
      type="submit"
      className="w-full min-h-13 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-xl text-xs tracking-wider uppercase shadow-md shadow-gold/15 hover:shadow-lg hover:shadow-gold/25 active:scale-[0.98] transition-all cursor-pointer"
    >
      Get Taxi
    </button>
  );
}
