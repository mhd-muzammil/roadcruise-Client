import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, MapPin, Users, Clock, Car, Package as PackageIcon, CreditCard,
  CheckCircle, Loader2, AlertCircle, Lock, RefreshCw, Ticket, XCircle,
  Pencil, Download, X, BellRing, Route, Timer, ChevronDown, Plus, Phone, User, Wallet, Hash,
} from "lucide-react";
import { fetchBookings, cancelBooking, modifyBooking, downloadBookingInvoice, setMarketingConsent } from "../utils/api";
import { payForBooking } from "../utils/payment";
import useDocumentMeta from "../hooks/useDocumentMeta";
import FareBreakdown, { RouteTimeline, PostTripCharges } from "../components/booking/FareBreakdown";
import TimePicker12 from "../components/common/TimePicker12";
import { bookingPricing, distanceText, formatINR, fmtDate, fmtTime, STOP_TRIP_TYPES, MAX_STOPS } from "../utils/fare";

// Map a booking status to display metadata.
const statusMeta = (status) => {
  switch (status) {
    case "Approved":
      return { label: "Confirmed", tone: "emerald", canPay: false, paid: true };
    case "Completed":
      return { label: "Completed", tone: "blue", canPay: false };
    case "Cancelled":
      return { label: "Cancelled", tone: "red", canPay: false };
    case "PendingPayment":
      return { label: "Awaiting Payment", tone: "amber", canPay: true };
    default: // "Pending" (pay-on-arrival / awaiting confirmation)
      return { label: "Pending", tone: "amber", canPay: true };
  }
};

const toneCls = {
  emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  amber: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  red: "bg-red-500/10 text-red-500 border-red-500/30",
  blue: "bg-blue-500/10 text-blue-500 border-blue-500/30",
};

const stopsOf = (b) => (Array.isArray(b.stops) ? b.stops.map((st) => st?.label || st).filter(Boolean) : []);

// Same rule as the server: outstation trip-planner bookings and classic-form
// vehicle bookings can have stops; airport, hourly and package ones can't.
const canHaveStops = (b) =>
  STOP_TRIP_TYPES.includes(b.tripKind) || (!b.tripKind && b.category !== "package" && !b.packageName);

const bookedTotal = (b) => Number(b.pricing?.total ?? b.fare) || 0;
const finalTotal = (b) => Math.round((bookedTotal(b) + (Number(b.tripClosure?.total) || 0)) * 100) / 100;

/**
 * Cab + driver details, filled in by the admin when the trip is assigned.
 * Until then the customer sees a placeholder so they know it's coming.
 */
function CabDriverCard({ b }) {
  const a = b.assignment;
  if (b.status === "Cancelled") return null;
  if (!a) {
    return (
      <div className="mx-5 mb-4 px-4 py-3 rounded-xl border border-dashed border-zinc-200 dark:border-white/10 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
        <Car className="w-4 h-4 text-gold flex-shrink-0" />
        Cab and driver details will appear here once our team assigns your ride.
      </div>
    );
  }
  const items = [
    [Hash, "Cab number", a.cabNumber],
    [Car, "Vehicle type", a.vehicleType || b.vehicle || b.item],
    [User, "Driver name", a.driverName],
    [Phone, "Driver phone", a.driverPhone],
    [Wallet, "Mode of payment", a.paymentMode],
  ].filter(([, , v]) => v);
  return (
    <div className="mx-5 mb-4 p-4 rounded-xl border border-gold/30 bg-gold/5">
      <p className="text-[10px] uppercase tracking-wider font-bold text-gold mb-3">Your cab &amp; driver</p>
      <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-3 text-xs">
        {items.map(([Icon, k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              <Icon className="w-3 h-3" /> {k}
            </dt>
            <dd className="text-zinc-900 dark:text-white font-semibold mt-0.5 break-words">
              {k === "Driver phone"
                ? <a href={`tel:${v.replace(/[^\d+]/g, "")}`} className="hover:text-gold underline-offset-2 hover:underline">{v}</a>
                : v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Expandable full summary: route with stops, trip facts, the itemised fare
 * (subtotal, GST, total) and the inclusions/exclusions captured at booking.
 */
function BookingSummary({ b }) {
  const included = b.inclusions || [];
  const excluded = b.exclusions || [];
  return (
    <details className="group border-t border-zinc-100 dark:border-white/5">
      <summary className="flex items-center justify-between gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-gold cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset">
        Booking summary &amp; fare details
        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5 grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <RouteTimeline pickup={b.pickup} stops={stopsOf(b)} drop={b.drop} />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            {[
              ["Booking ID", b.id],
              ["Trip type", b.tripType],
              ["Travel date", b.toDate && b.toDate !== b.fromDate ? `${fmtDate(b.fromDate)} – ${fmtDate(b.toDate)}` : fmtDate(b.fromDate)],
              ["Pickup time", b.pickupTime ? fmtTime(b.pickupTime) : ""],
              ["Vehicle", b.vehicle || b.item],
              ["Rental duration", b.rental?.hours ? `${b.rental.hours} hours · ${b.rental.kms} km` : ""],
              ["Distance", distanceText(b)],
              ["Days", Number(b.days) > 1 ? String(b.days) : ""],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{k}</dt>
                  <dd className="text-zinc-800 dark:text-zinc-200 font-medium mt-0.5 break-words">{v}</dd>
                </div>
              ))}
          </dl>
        </div>
        <div className="space-y-4">
          <FareBreakdown pricing={bookingPricing(b)} compact />
          <PostTripCharges closure={b.tripClosure} bookedTotal={bookedTotal(b)} />
          {(included.length > 0 || excluded.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {included.length > 0 && (
                <ul className="space-y-1">
                  <li className="font-bold uppercase tracking-wider text-[10px] text-emerald-600 dark:text-emerald-400">Included</li>
                  {included.map((l) => <li key={l} className="text-zinc-600 dark:text-zinc-300">✓ {l}</li>)}
                </ul>
              )}
              {excluded.length > 0 && (
                <ul className="space-y-1">
                  <li className="font-bold uppercase tracking-wider text-[10px] text-red-600 dark:text-red-400">Excluded</li>
                  {excluded.map((l) => <li key={l} className="text-zinc-600 dark:text-zinc-300">✕ {l}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </details>
  );
}

function Row({ icon: Icon, label, value }) {
  if (!value || value === "—" || value === "") return null;
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
      <Icon className="w-3.5 h-3.5 text-gold flex-shrink-0" />
      <span className="text-zinc-400 dark:text-zinc-500">{label}:</span>
      <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate">{value}</span>
    </div>
  );
}

/**
 * Modal to edit a booking's trip details. Only trip fields are editable — the
 * fare, vehicle and payment stay as booked (the server enforces the same).
 */
function EditTripModal({ booking, onClose, onSaved, onSessionExpired }) {
  const isPackage = booking.category === "package" || booking.packageName;
  const [form, setForm] = useState({
    fromDate: booking.fromDate || "",
    toDate: booking.toDate || "",
    pickup: booking.pickup || "",
    drop: booking.drop || "",
    passengers: booking.passengers || "",
    pickupTime: booking.pickupTime || "",
    notes: booking.notes || "",
  });
  const allowStops = canHaveStops(booking);
  // Stop labels in travel order; blank rows are dropped on save.
  const [stops, setStops] = useState(() => stopsOf(booking));
  const setStop = (i) => (e) => setStops((list) => list.map((v, j) => (j === i ? e.target.value : v)));
  const addStop = () => setStops((list) => (list.length >= MAX_STOPS ? list : [...list, ""]));
  const removeStop = (i) => setStops((list) => list.filter((_, j) => j !== i));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

  const handleSave = async () => {
    setError("");
    if (!form.fromDate || !form.toDate) {
      setError("Please choose both trip dates.");
      return;
    }
    if (form.toDate < form.fromDate) {
      setError("The trip end date cannot be before the start date.");
      return;
    }
    setSaving(true);
    try {
      const changes = allowStops ? { ...form, stops: stops.map((v) => v.trim()).filter(Boolean) } : form;
      const updated = await modifyBooking(booking.id, changes);
      onSaved(updated);
    } catch (err) {
      if (err?.status === 401) {
        onSessionExpired?.();
        setError("Your session has expired. Please sign in again.");
      } else {
        setError(err?.message || "Could not update your booking. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const fieldCls =
    "w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold transition-all";
  const labelCls = "text-[11px] font-semibold text-zinc-500 dark:text-zinc-400";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6" role="dialog" aria-modal="true" aria-label={`Edit booking ${booking.id}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={saving ? undefined : onClose} />
      <div className="relative w-full max-w-lg max-h-full overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-white/5">
          <div>
            <h2 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">Edit Trip</h2>
            <p className="text-[11px] font-mono text-zinc-400">Ref: {booking.id}</p>
          </div>
          <button onClick={onClose} disabled={saving} aria-label="Close"
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /><p className="text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="edit-fromDate" className={labelCls}>From date *</label>
              <input id="edit-fromDate" type="date" value={form.fromDate} onChange={set("fromDate")} className={fieldCls} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-toDate" className={labelCls}>To date *</label>
              <input id="edit-toDate" type="date" value={form.toDate} min={form.fromDate || undefined} onChange={set("toDate")} className={fieldCls} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-pickup" className={labelCls}>Pickup location</label>
            <input id="edit-pickup" type="text" value={form.pickup} onChange={set("pickup")} placeholder="Pickup address / area" className={fieldCls} />
          </div>

          {allowStops && (
            <div className="space-y-1.5">
              <span className={labelCls}>Stops on the way</span>
              {stops.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-14 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Stop {i + 1}</span>
                  <input type="text" value={v} onChange={setStop(i)} aria-label={`Stop ${i + 1}`} placeholder="Stop address / area" className={fieldCls} />
                  <button type="button" onClick={() => removeStop(i)} aria-label={`Remove stop ${i + 1}`}
                    className="p-2 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {stops.length < MAX_STOPS && (
                <button type="button" onClick={addStop}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold hover:underline">
                  <Plus className="w-3.5 h-3.5" /> Add stop
                </button>
              )}
            </div>
          )}

          {!isPackage && (
            <div className="space-y-1.5">
              <label htmlFor="edit-drop" className={labelCls}>Drop location</label>
              <input id="edit-drop" type="text" value={form.drop} onChange={set("drop")} placeholder="Drop address / area" className={fieldCls} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="edit-passengers" className={labelCls}>Passengers</label>
              <input id="edit-passengers" type="number" min="1" value={form.passengers} onChange={set("passengers")} placeholder="e.g. 4" className={fieldCls} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-pickupTime" className={labelCls}>Pickup time</label>
              <div className={`${fieldCls} flex items-center`}>
                <TimePicker12 id="edit-pickupTime" value={form.pickupTime}
                  onChange={(v) => setForm((prev) => ({ ...prev, pickupTime: v }))} ariaLabel="Pickup time" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-notes" className={labelCls}>Special requests</label>
            <textarea id="edit-notes" rows="3" value={form.notes} onChange={set("notes")}
              placeholder="Anything the driver / our team should know…" className={`${fieldCls} resize-none`} />
          </div>

          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            The fare, vehicle and payment stay as booked. If the new route runs beyond the included km, the extra km is billed on your final invoice after the trip. Our team is notified of your changes.
          </p>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button onClick={onClose} disabled={saving}
              className="px-5 py-2.5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:border-gold hover:text-gold font-bold rounded-full text-xs uppercase tracking-wider transition-all">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-hover disabled:opacity-60 text-zinc-950 font-bold rounded-full text-xs uppercase tracking-wider transition-all shadow-md">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Marketing preference. Lives here rather than buried in a settings page because
 * this is the only account screen customers actually visit, and consent that
 * nobody can find is consent nobody gives.
 *
 * Reflects what the SERVER stored, not what was clicked: the response is echoed
 * back into state and into the persisted user, so a failed request leaves the
 * switch showing the truth.
 */
function OfferPreference({ currentUser }) {
  const [optIn, setOptIn] = useState(currentUser?.marketingOptIn === true);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Customers who signed up by email or Google have no mobile on file. Consent
  // without one is unusable — DLT records consent AGAINST a number — so the card
  // asks for it in the same moment rather than storing a subscription that can
  // never be honoured.
  const hasPhone = /^[6-9]\d{9}$/.test(String(currentUser?.phone || "").replace(/\D/g, "").slice(-10));
  const [needsPhone, setNeedsPhone] = useState(false);

  const persist = (payload) => {
    try {
      const stored = JSON.parse(localStorage.getItem("rc_user") || "null");
      if (stored) {
        Object.assign(stored, payload);
        localStorage.setItem("rc_user", JSON.stringify(stored));
      }
    } catch { /* storage unavailable — the server remains the source of truth */ }
  };

  const submit = async (next, withPhone) => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const r = await setMarketingConsent(next, withPhone);
      setOptIn(r.marketingOptIn === true);
      setNeedsPhone(false);
      setPhone("");
      persist({ marketingOptIn: r.marketingOptIn === true, ...(r.phone ? { phone: r.phone } : {}) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      // The server refuses an opt-in it cannot attach to a number; that is a
      // prompt for input, not a failure to report.
      if (e.code === "PHONE_REQUIRED") setNeedsPhone(true);
      else setError(e.message);
      setOptIn(currentUser?.marketingOptIn === true);
    } finally {
      setSaving(false);
    }
  };

  const toggle = () => {
    const next = !optIn;
    if (next && !hasPhone) { setNeedsPhone(true); return; }
    submit(next);
  };

  const savePhone = (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) { setError("Enter a valid 10-digit mobile number"); return; }
    submit(true, phone);
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-4 h-4 text-gold" /> Trip offers
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
            Get our seasonal packages and special fares by SMS and email. We only send a
            few a year, and you can switch this off whenever you like.
          </p>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          {saved && !error && (
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {optIn ? "You're subscribed" : "Preference saved"}
            </p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={optIn}
          aria-label="Receive trip offers"
          disabled={saving}
          onClick={toggle}
          className={`relative w-12 h-6 flex-shrink-0 rounded-full transition-colors disabled:opacity-60 ${
            optIn ? "bg-gold" : "bg-zinc-300 dark:bg-white/10"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              optIn ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {needsPhone && !optIn && (
        <form onSubmit={savePhone} className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/5">
          <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
            Mobile number for offers
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-zinc-400">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoFocus
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                placeholder="98765 43210"
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-gold/60 focus:outline-none rounded-lg py-2 pl-12 pr-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 bg-gold hover:opacity-90 text-zinc-950 font-bold rounded-lg text-xs disabled:opacity-60"
            >
              {saving ? "Saving…" : "Subscribe"}
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1.5">
            We use this only for the offers you just agreed to, and for your booking updates.
          </p>
        </form>
      )}
    </div>
  );
}


export default function MyBookings({ currentUser, onAuthClick, onSessionExpired }) {
  useDocumentMeta({ title: "My Bookings | Road Cruise", noindex: true });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.status === 401) {
        onSessionExpired?.();
        setError("Your session has expired. Please sign in again.");
      } else {
        setError(err?.message || "Could not load your bookings.");
      }
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    if (currentUser) load();
    else setLoading(false);
  }, [currentUser, load]);

  const handlePay = async (booking) => {
    setNotice("");
    setError("");
    setPayingId(booking.id);
    try {
      const res = await payForBooking(booking, currentUser);
      setNotice(
        res.status === "already_paid"
          ? `Booking ${booking.id} is already paid.`
          : `Payment successful — booking ${booking.id} is confirmed!`
      );
      await load(); // refresh statuses
    } catch (err) {
      setError(err?.message || "Payment could not be completed.");
    } finally {
      setPayingId(null);
    }
  };

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel booking ${booking.id}? This can't be undone.`)) return;
    setNotice("");
    setError("");
    setCancellingId(booking.id);
    try {
      await cancelBooking(booking.id);
      setNotice(`Booking ${booking.id} has been cancelled. A confirmation email is on its way.`);
      await load(); // refresh statuses
    } catch (err) {
      if (err?.status === 401) {
        onSessionExpired?.();
        setError("Your session has expired. Please sign in again.");
      } else {
        setError(err?.message || "Could not cancel your booking. Please try again.");
      }
    } finally {
      setCancellingId(null);
    }
  };

  const handleEditSaved = async (updated) => {
    setEditingBooking(null);
    setNotice(`Booking ${updated.id} has been updated. A confirmation email is on its way.`);
    setError("");
    await load(); // refresh details
  };

  const handleInvoice = async (booking, type = "pre") => {
    const label = type === "post" ? "Final-Invoice" : "Pre-Invoice";
    setNotice("");
    setError("");
    setDownloadingId(`${booking.id}:${type}`);
    try {
      const blob = await downloadBookingInvoice(booking.id, type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RoadCruise-${label}-${booking.id}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setNotice(`${label.replace("-", " ")} for ${booking.id} downloaded — open it and use "Print / Save as PDF".`);
    } catch (err) {
      if (err?.status === 401) {
        onSessionExpired?.();
        setError("Your session has expired. Please sign in again.");
      } else {
        setError(err?.message || "Could not download the invoice. Please try again.");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  // ---- Not signed in ----
  if (!currentUser) {
    return (
      <div className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-6">
        <div className="text-center space-y-5 max-w-sm">
          <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30 mx-auto">
            <Lock className="w-7 h-7 text-gold" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white">Sign in to view your bookings</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Track your reservations, see their status, and complete any pending payments.</p>
          <button
            onClick={onAuthClick}
            className="px-6 py-2.5 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-full text-xs uppercase tracking-wider transition-all shadow-md"
          >
            Sign In / Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Header */}
      <div className="py-12 border-b border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xs font-semibold tracking-[0.3em] text-gold uppercase mb-2">My Account</h1>
            <p className="text-2xl md:text-4xl font-serif font-bold text-zinc-900 dark:text-white">Your Bookings</p>
          </div>
          <button
            onClick={load}
            className="p-2.5 rounded-full border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-gold hover:border-gold/50 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-4">
        <OfferPreference currentUser={currentUser} />
        {notice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" /><p className="text-sm font-medium">{notice}</p>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /><p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
            <p className="text-sm mt-3">Loading your bookings…</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-14 h-14 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Ticket className="w-7 h-7 text-zinc-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">No bookings yet</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Ready for your next journey?</p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <Link to="/vehicles" className="px-5 py-2.5 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-full text-xs uppercase tracking-wider transition-all">Browse Vehicles</Link>
              <Link to="/tours-travels" className="px-5 py-2.5 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-gold hover:text-gold font-bold rounded-full text-xs uppercase tracking-wider transition-all">View Packages</Link>
            </div>
          </div>
        ) : (
          bookings.map((b) => {
            const meta = statusMeta(b.status);
            const isPackage = b.category === "package" || b.packageName;
            const paying = payingId === b.id;
            const cancelling = cancellingId === b.id;
            const downloadingPre = downloadingId === `${b.id}:pre`;
            const downloadingPost = downloadingId === `${b.id}:post`;
            const canCancel = b.status !== "Cancelled" && b.status !== "Completed";
            const canEdit = canCancel; // same rule: an active, not-yet-finished trip
            return (
              <div key={b.id} className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/5 overflow-hidden">
                <div className="p-5 flex flex-col md:flex-row md:items-start gap-5">
                  {/* Left: icon + title */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                      {isPackage ? <PackageIcon className="w-5 h-5 text-gold" /> : <Car className="w-5 h-5 text-gold" />}
                    </div>
                    <div className="min-w-0 space-y-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{b.item}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${toneCls[meta.tone]}`}>{meta.label}</span>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-400">Ref: {b.id}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
                        <Row icon={Calendar} label="Dates" value={`${b.fromDate} → ${b.toDate}`} />
                        <Row icon={Clock} label="Type" value={b.tripType} />
                        {isPackage && <Row icon={PackageIcon} label="Package" value={b.packageName} />}
                        {isPackage
                          ? <Row icon={Car} label="Vehicle" value={b.vehicle} />
                          : <Row icon={Car} label="Vehicle" value={b.vehicle || b.item} />}
                        <Row icon={MapPin} label="Pickup" value={b.pickup} />
                        {stopsOf(b).length > 0 && <Row icon={MapPin} label="Stops" value={stopsOf(b).join(" → ")} />}
                        {b.category !== "package" && <Row icon={MapPin} label="Drop" value={b.drop} />}
                        <Row icon={Users} label="Passengers" value={b.passengers} />
                        <Row icon={Clock} label="Pickup time" value={b.pickupTime ? fmtTime(b.pickupTime) : ""} />
                        {b.rental?.hours && <Row icon={Timer} label="Duration" value={`${b.rental.hours} hours · ${b.rental.kms} km`} />}
                        {b.distanceKm && <Row icon={Route} label="Distance" value={distanceText(b)} />}
                      </div>
                    </div>
                  </div>

                  {/* Right: fare + action */}
                  <div className="flex flex-row md:flex-col items-end justify-between md:justify-start gap-3 md:text-right md:min-w-[140px] border-t md:border-t-0 md:border-l border-zinc-100 dark:border-white/5 pt-4 md:pt-0 md:pl-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400">{b.tripClosure ? "Final Fare" : meta.canPay ? "Amount Due" : "Fare"}</p>
                      <p className="text-lg font-serif font-bold text-gold">₹{formatINR(b.tripClosure ? finalTotal(b) : b.fare)}</p>
                      {b.tripClosure?.total > 0 && (
                        <p className="text-[10px] text-zinc-400">incl. ₹{formatINR(b.tripClosure.total)} post-trip charges</p>
                      )}
                      {b.pricing && <p className="text-[10px] text-zinc-400">incl. {b.pricing.gstRate}% GST</p>}
                      {/* Advance-plan bookings: deposit collected online, rest to the driver. */}
                      {Number(b.advanceAmount) > 0 && (
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          ₹{formatINR(b.advanceAmount)} advance
                          {" · "}₹{formatINR(Math.round((Number(b.fare || 0) - Number(b.advanceAmount)) * 100) / 100)} to driver
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-400 mt-0.5">{b.paymentMethod}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {meta.canPay ? (
                        <button
                          onClick={() => handlePay(b)}
                          disabled={paying || cancelling}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold-hover disabled:opacity-60 text-zinc-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-md whitespace-nowrap"
                        >
                          {paying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                          {paying ? "Processing…" : "Pay Now"}
                        </button>
                      ) : meta.paid ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-500 text-xs font-bold"><CheckCircle className="w-4 h-4" /> Paid</span>
                      ) : null}
                      {canEdit && (
                        <button
                          onClick={() => setEditingBooking(b)}
                          disabled={paying || cancelling}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-gold disabled:opacity-60 transition-colors whitespace-nowrap"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit trip
                        </button>
                      )}
                      {b.status !== "Cancelled" && (
                        <button
                          onClick={() => handleInvoice(b, "pre")}
                          disabled={downloadingPre}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-gold disabled:opacity-60 transition-colors whitespace-nowrap"
                        >
                          {downloadingPre ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                          {downloadingPre ? "Preparing…" : "Pre-invoice"}
                        </button>
                      )}
                      {b.tripClosure && (
                        <button
                          onClick={() => handleInvoice(b, "post")}
                          disabled={downloadingPost}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold hover:text-gold-hover disabled:opacity-60 transition-colors whitespace-nowrap"
                        >
                          {downloadingPost ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                          {downloadingPost ? "Preparing…" : "Final invoice"}
                        </button>
                      )}
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(b)}
                          disabled={paying || cancelling}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-500 hover:text-red-600 disabled:opacity-60 transition-colors whitespace-nowrap"
                        >
                          {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          {cancelling ? "Cancelling…" : "Cancel booking"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <CabDriverCard b={b} />
                <BookingSummary b={b} />
              </div>
            );
          })
        )}
      </div>

      {editingBooking && (
        <EditTripModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSaved={handleEditSaved}
          onSessionExpired={onSessionExpired}
        />
      )}
    </div>
  );
}
