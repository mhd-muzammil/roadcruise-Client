import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Car, ClipboardList, DollarSign, Plus, ShieldAlert, Trash2, Check, X,
  Users, Image as ImageIcon, Film, Upload, Unlock, Loader2, LayoutGrid,
  Megaphone, Download, Send, Eye, EyeOff, Clock, Package as PackageIcon, Pencil, Search, ChevronDown,
  UserCheck, Flag, Tag,
} from "lucide-react";
import FareBreakdown, { RouteTimeline, PostTripCharges } from "./booking/FareBreakdown";
import { bookingPricing, distanceText, formatINR, fmtTime } from "../utils/fare";
import {
  fetchBookings, updateBooking, deleteBooking, closeTrip, downloadBookingInvoice, editBookingInvoice,
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
  getAdminVehicles, createVehicle, updateVehicle, deleteVehicle, uploadVehicleMedia, releaseVehicleHold,
  getGallery, uploadGalleryMedia, deleteGalleryItem, mediaUrl,
  getAdminPromos, createPromo, updatePromo, deletePromo, announcePromo, downloadConsentFile, consentSummary,
  getAdminPackages, createPackage, updatePackage, deletePackage, downloadBookingsExport,
} from "../utils/api";

const TABS = [
  { id: "overview", label: "Analytics", icon: LayoutGrid },
  { id: "bookings", label: "Bookings", icon: ClipboardList },
  { id: "fleet", label: "Vehicles", icon: Car },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "packages", label: "Packages", icon: PackageIcon },
  { id: "promos", label: "Promotions", icon: Megaphone },
  { id: "coupons", label: "Coupons", icon: Tag },
];

const CATEGORIES = ["Sedans", "SUVs", "Tempo Travellers", "Mini Buses", "Luxury", "Other"];
// How the customer pays the driver / balance — shown on My Bookings.
const PAYMENT_MODES = ["Cash", "UPI", "Card", "Online (prepaid)", "Bank transfer"];

const inr = (n) => `₹${formatINR(n)}`;
const inputCls =
  "w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-100";

// --- Overview: last-6-months revenue derived from real bookings ---
function monthlyRevenue(bookings) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en-IN", { month: "short" }), total: 0 });
  }
  const idx = Object.fromEntries(months.map((m, i) => [m.key, i]));
  for (const b of bookings) {
    if (b.status === "Cancelled") continue;
    const d = new Date(`${b.fromDate}T00:00:00`);
    if (Number.isNaN(d.getTime())) continue;
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    if (k in idx) months[idx[k]].total += Number(b.fare) || 0;
  }
  const max = Math.max(1, ...months.map((m) => m.total));
  return months.map((m) => ({ ...m, pct: Math.round((m.total / max) * 100) }));
}

export default function AdminPanel({ currentUser }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [promos, setPromos] = useState([]);
  const [packages, setPackages] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [error, setError] = useState("");

  const isAdmin = currentUser && currentUser.role === "admin";

  const loadBookings = useCallback(async () => {
    try { setBookings(await fetchBookings()); } catch (e) { console.error(e); setError(e.message); }
  }, []);
  const loadVehicles = useCallback(async () => {
    try { setVehicles(await getAdminVehicles()); } catch (e) { console.error(e); }
  }, []);
  const loadGallery = useCallback(async () => {
    try { setGallery(await getGallery()); } catch (e) { console.error(e); }
  }, []);
  const loadPromos = useCallback(async () => {
    try { setPromos(await getAdminPromos()); } catch (e) { console.error(e); }
  }, []);
  const loadPackages = useCallback(async () => {
    try { setPackages(await getAdminPackages()); } catch (e) { console.error(e); }
  }, []);
  const loadCoupons = useCallback(async () => {
    try { setCoupons(await getCoupons()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadBookings();
    loadVehicles();
    loadGallery();
    loadPromos();
    loadPackages();
    loadCoupons();
  }, [isAdmin, loadBookings, loadVehicles, loadGallery, loadPromos, loadPackages, loadCoupons]);

  // --- Authorization gate: admin role only. No bypass, no test credentials. ---
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-zinc-50 dark:bg-bg-dark transition-colors duration-300">
        <div className="max-w-md w-full mx-4 p-8 glass-premium border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl text-center space-y-6 bg-white/60 dark:bg-zinc-900/20">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-serif text-zinc-900 dark:text-white">Admin Access Required</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This dashboard is restricted to authorized administrators. Please sign in with an admin account to continue.
            </p>
          </div>
          <Link
            to="/"
            className="inline-block w-full py-3 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // --- Metrics ---
  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter((b) => b.status === "Approved").length;
  const pendingBookings = bookings.filter((b) => b.status === "Pending" || b.status === "PendingPayment").length;
  const totalRevenue = bookings.filter((b) => b.status !== "Cancelled").reduce((s, b) => s + (Number(b.fare) || 0), 0);
  const totalUnits = vehicles.reduce((s, v) => s + (v.totalUnits || 0), 0);
  const bookedUnits = vehicles.reduce((s, v) => s + (v.heldCount || 0), 0);
  const chart = monthlyRevenue(bookings);

  return (
    <div className="min-h-screen pt-28 pb-16 bg-zinc-50 dark:bg-bg-dark text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-200 dark:border-white/5 pb-6 mb-8 gap-4">
          <div className="text-left space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-wide">Operations Control Desk</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Signed in as <span className="text-gold font-bold">{currentUser.name}</span> · Administrator
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    activeTab === t.id
                      ? "bg-gold text-zinc-950 border-gold shadow-md"
                      : "bg-white/40 dark:bg-zinc-900/10 border-zinc-200 dark:border-white/5 hover:border-gold/30"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">{error}</div>
        )}

        {activeTab === "overview" && (
          <OverviewTab
            totalRevenue={totalRevenue} totalBookings={totalBookings} approvedBookings={approvedBookings}
            pendingBookings={pendingBookings} fleetCount={vehicles.length} totalUnits={totalUnits}
            bookedUnits={bookedUnits} chart={chart}
          />
        )}
        {activeTab === "bookings" && (
          <BookingsTab bookings={bookings} reload={loadBookings} reloadVehicles={loadVehicles} />
        )}
        {activeTab === "fleet" && (
          <VehiclesTab vehicles={vehicles} reload={loadVehicles} />
        )}
        {activeTab === "gallery" && (
          <GalleryTab gallery={gallery} reload={loadGallery} />
        )}
        {activeTab === "packages" && (
          <PackagesTab packages={packages} reload={loadPackages} />
        )}
        {activeTab === "promos" && (
          <PromosTab promos={promos} reload={loadPromos} />
        )}
        {activeTab === "coupons" && (
          <CouponsTab coupons={coupons} reload={loadCoupons} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
//  Overview
// ============================================================================
function Kpi({ label, value, icon: Icon }) {
  return (
    <div className="glass-premium p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-zinc-900/10 text-left flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{label}</span>
        <h3 className="text-xl font-bold font-serif text-zinc-900 dark:text-white">{value}</h3>
      </div>
      <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold border border-gold/30">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function OverviewTab({ totalRevenue, totalBookings, approvedBookings, pendingBookings, fleetCount, totalUnits, bookedUnits, chart }) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Kpi label="Total Revenue" value={inr(totalRevenue)} icon={DollarSign} />
        <Kpi label="Total Bookings" value={`${totalBookings}`} icon={ClipboardList} />
        <Kpi label="Fleet / Units" value={`${fleetCount} · ${bookedUnits}/${totalUnits} out`} icon={Car} />
        <Kpi label="Approved / Pending" value={`${approvedBookings} / ${pendingBookings}`} icon={Users} />
      </div>

      <div className="glass-premium p-6 rounded-3xl border border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-zinc-900/10 text-left space-y-6">
        <div>
          <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Booking Revenue — Last 6 Months</h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Calculated from confirmed and pending bookings by travel month.</p>
        </div>
        <div className="h-64 flex items-end gap-3 sm:gap-6 justify-between pt-6 border-b border-zinc-200 dark:border-zinc-800 relative px-4">
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-zinc-200 dark:border-zinc-800/60"></div>
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-zinc-200 dark:border-zinc-800/60"></div>
          {chart.map((m) => (
            <div key={m.key} className="flex-1 flex flex-col items-center h-full justify-end relative z-10">
              <span className="text-[8.5px] font-mono font-bold text-gold mb-1.5">{m.total ? inr(m.total) : ""}</span>
              <div
                className="w-full bg-gradient-to-t from-gold-dark via-gold to-amber-400 rounded-t-lg shadow-lg shadow-gold/5 transition-all"
                style={{ height: `${Math.max(2, m.pct)}%` }}
              ></div>
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-2">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
//  Bookings
// ============================================================================
function statusCls(s) {
  return s === "Approved" ? "bg-emerald-500/10 text-emerald-500"
    : s === "Pending" || s === "PendingPayment" ? "bg-amber-500/10 text-amber-500"
    : s === "Completed" ? "bg-blue-500/10 text-blue-500"
    : "bg-red-500/10 text-red-500";
}

const stopsOf = (b) => (Array.isArray(b.stops) ? b.stops.map((s) => s?.label || s).filter(Boolean) : []);
const rentalOf = (b) => (b.rental?.hours ? `${b.rental.hours} hrs · ${b.rental.kms} km` : "");

const SORTS = {
  created: { label: "Newest booked", fn: (a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")) },
  travelAsc: { label: "Travel date — soonest", fn: (a, b) => String(a.fromDate || "").localeCompare(String(b.fromDate || "")) },
  travelDesc: { label: "Travel date — latest", fn: (a, b) => String(b.fromDate || "").localeCompare(String(a.fromDate || "")) },
  fareDesc: { label: "Fare — highest", fn: (a, b) => (Number(b.fare) || 0) - (Number(a.fare) || 0) },
};
const STATUS_FILTERS = ["All", "Pending", "PendingPayment", "Approved", "Completed", "Cancelled"];

function BookingsTab({ bookings, reload, reloadVehicles }) {
  const [busy, setBusy] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState("created");
  const [openId, setOpenId] = useState(null);
  const [assigning, setAssigning] = useState(null); // booking being assigned a cab/driver
  const [closing, setClosing] = useState(null);     // booking whose trip is being closed
  const [invoicing, setInvoicing] = useState(null); // booking whose invoice is being edited

  const exportXlsx = async () => {
    setExporting(true);
    try {
      const { blob } = await downloadBookingsExport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `roadcruise-bookings-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message);
    } finally {
      setExporting(false);
    }
  };

  const act = async (fn, id) => {
    setBusy(id);
    try { await fn(); await reload(); await reloadVehicles(); }
    catch (e) { console.error(e); }
    finally { setBusy(null); }
  };

  const q = query.trim().toLowerCase();
  const visible = bookings
    .filter((b) => statusFilter === "All" || b.status === statusFilter)
    .filter((b) =>
      !q ||
      [b.id, b.name, b.phone, b.customerEmail, b.vehicle, b.item, b.pickup, b.drop, b.tripType, ...stopsOf(b)]
        .some((v) => String(v || "").toLowerCase().includes(q))
    )
    .sort(SORTS[sort].fn);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-white tracking-wide">
          Booking Logs ({visible.length}{visible.length !== bookings.length ? ` of ${bookings.length}` : ""})
        </h3>
        <button
          type="button"
          onClick={exportXlsx}
          disabled={exporting || bookings.length === 0}
          className="px-3 py-1.5 text-[11px] font-bold bg-gold hover:bg-gold-hover text-zinc-950 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Export to Excel
        </button>
      </div>

      {/* Search / filter / sort */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
        <label className="relative">
          <span className="sr-only">Search bookings</span>
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ID, customer, phone, vehicle, place…"
            className={`${inputCls} pl-8`}
          />
        </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls} aria-label="Filter by status">
          {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputCls} aria-label="Sort bookings">
          {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-zinc-200 dark:border-white/5 shadow-xl glass-premium bg-white/40 dark:bg-zinc-900/10">
        <table className="w-full text-left border-collapse min-w-[1080px]">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-white/5 bg-zinc-100/40 dark:bg-zinc-950/20 text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
              <th className="p-4 w-8"><span className="sr-only">Details</span></th>
              <th className="p-4">Ref</th>
              <th className="p-4">Client</th>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Pickup</th>
              <th className="p-4">Drop</th>
              <th className="p-4">Dates</th>
              <th className="p-4">Fare</th>
              <th className="p-4">Status</th>
              <th className="p-4">Driver</th>
              <th className="p-4 text-center">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5 text-xs text-zinc-700 dark:text-zinc-300">
            {visible.length === 0 ? (
              <tr><td colSpan="11" className="p-8 text-center text-zinc-400 italic">{bookings.length ? "No bookings match these filters." : "No bookings yet."}</td></tr>
            ) : (
              visible.map((b) => {
                const stops = stopsOf(b);
                const open = openId === b.id;
                return (
                  <React.Fragment key={b.id}>
                    <tr className="hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] transition-colors align-top">
                      <td className="p-4">
                        <button
                          type="button" onClick={() => setOpenId(open ? null : b.id)}
                          aria-expanded={open} aria-label={`${open ? "Hide" : "Show"} details for ${b.id}`}
                          className="p-1 rounded text-zinc-400 hover:text-gold hover:bg-gold/10"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                      </td>
                      <td className="p-4 font-mono font-bold text-zinc-900 dark:text-white">{b.id}</td>
                      <td className="p-4">
                        <p className="font-bold text-zinc-800 dark:text-zinc-200">{b.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{b.phone}</p>
                      </td>
                      <td className="p-4 max-w-[180px]">
                        <p className="font-medium break-words">{b.vehicle || b.item}</p>
                        <span className="inline-block mt-1 text-[8px] bg-gold/10 text-gold px-1 rounded uppercase font-semibold">{b.tripType}</span>
                        {rentalOf(b) && <p className="text-[10px] text-zinc-500 mt-1">⏱ {rentalOf(b)}</p>}
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <p className="break-words">{b.pickup || "—"}</p>
                        {stops.length > 0 && (
                          <p className="text-[10px] text-zinc-500 mt-1 break-words" title={stops.join(" → ")}>
                            via {stops.join(" → ")}
                          </p>
                        )}
                      </td>
                      <td className="p-4 max-w-[200px] break-words">{b.drop || "—"}</td>
                      <td className="p-4 font-mono text-[10px] whitespace-nowrap">
                        {b.fromDate}{b.toDate && b.toDate !== b.fromDate ? ` → ${b.toDate}` : ""}
                        {b.pickupTime && <span className="block text-zinc-400">{fmtTime(b.pickupTime)}</span>}
                      </td>
                      <td className="p-4 font-mono whitespace-nowrap">
                        <span className="font-bold text-zinc-900 dark:text-white">{inr(b.fare)}</span>
                        {b.pricing?.gstAmount != null && (
                          <span className="block text-[10px] text-zinc-400">incl. GST {inr(b.pricing.gstAmount)}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${statusCls(b.status)}`}>{b.status}</span>
                        {b.vehicleId && b.vehicleReleased && <span className="block text-[8px] text-zinc-400 mt-1">unit freed</span>}
                      </td>
                      <td className="p-4 max-w-[160px]">
                        {b.assignment ? (
                          <>
                            <p className="font-bold text-zinc-800 dark:text-zinc-200 break-words">{b.assignment.driverName}</p>
                            <p className="text-[10px] text-zinc-400 font-mono">{b.assignment.cabNumber}</p>
                          </>
                        ) : b.driver && b.driver !== "None" ? (
                          <p className="font-medium break-words">{b.driver}</p>
                        ) : (
                          <p className="text-[10px] text-zinc-400 italic">Unassigned</p>
                        )}
                        {b.status !== "Cancelled" && (
                          <button type="button" onClick={() => setAssigning(b)}
                            className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-gold hover:underline">
                            <UserCheck className="w-3 h-3" /> {b.assignment ? "Edit" : "Assign"}
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 justify-center items-center">
                          {busy === b.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />}
                          {(b.status === "Pending" || b.status === "PendingPayment") && (
                            <button onClick={() => act(() => updateBooking(b.id, { status: "Approved" }), b.id)}
                              className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded" title="Approve">
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {(b.status === "Approved" || b.status === "Completed") && (
                            <button onClick={() => setClosing(b)}
                              className="p-1 text-blue-500 hover:bg-blue-500/10 rounded" title={b.tripClosure ? "Edit trip closure (actual km)" : "Close trip (actual km)"}>
                              <Flag className="w-4 h-4" />
                            </button>
                          )}
                          {b.status !== "Cancelled" && b.status !== "Completed" && (
                            <button onClick={() => { if (confirm(`Cancel booking ${b.id}? The customer will be emailed.`)) act(() => updateBooking(b.id, { status: "Cancelled" }), b.id); }}
                              className="p-1 text-amber-500 hover:bg-amber-500/10 rounded" title="Cancel">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => act(() => deleteBooking(b.id), b.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {open && (
                      <tr className="bg-zinc-50/70 dark:bg-zinc-950/30">
                        <td colSpan="11" className="p-0">
                          <BookingDetail b={b} onEditInvoice={() => setInvoicing(b)} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {assigning && (
        <AssignDialog
          booking={assigning}
          onClose={() => setAssigning(null)}
          onSaved={async () => { setAssigning(null); await reload(); }}
        />
      )}
      {closing && (
        <CloseTripDialog
          booking={closing}
          onClose={() => setClosing(null)}
          onSaved={async () => { setClosing(null); await reload(); await reloadVehicles(); }}
        />
      )}
      {invoicing && (
        <EditInvoiceDialog
          booking={invoicing}
          onClose={() => setInvoicing(null)}
          onSaved={async () => { setInvoicing(null); await reload(); }}
        />
      )}
    </div>
  );
}

/**
 * Small modal shell shared by the assign / close-trip dialogs. Portalled to
 * <body>: the tab wrapper's fade-in animation uses a transform, which would
 * otherwise trap `position: fixed` inside the bookings table area.
 */
function Dialog({ title, subtitle, onClose, busy, children }) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={busy ? undefined : onClose} />
      <div className="relative w-full max-w-md max-h-full overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/5">
          <div>
            <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-[11px] text-zinc-400">{subtitle}</p>}
          </div>
          <button onClick={onClose} disabled={busy} aria-label="Close" className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">{children}</div>
      </div>
    </div>,
    document.body
  );
}

function DialogActions({ busy, error, onClose, onSave, saveLabel, extra }) {
  return (
    <>
      {error && <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg p-2">{error}</p>}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div>{extra}</div>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2 text-xs font-bold rounded-lg border border-zinc-200 dark:border-white/10">Cancel</button>
          <button type="button" onClick={onSave} disabled={busy}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-gold hover:bg-gold-hover text-zinc-950 flex items-center gap-1.5 disabled:opacity-60">
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {saveLabel}
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Assign the cab + driver. Everything here is shown to the customer on My
 * Bookings (and the driver-assigned email), so it must be what turns up.
 */
function AssignDialog({ booking, onClose, onSaved }) {
  const a = booking.assignment || {};
  const [form, setForm] = useState({
    cabNumber: a.cabNumber || "",
    vehicleType: a.vehicleType || booking.vehicle || booking.item || "",
    driverName: a.driverName || (booking.driver && booking.driver !== "None" ? booking.driver : ""),
    driverPhone: a.driverPhone || "",
    paymentMode: a.paymentMode || (/online/i.test(booking.paymentMethod || "") && !Number(booking.advanceAmount) ? "Online (prepaid)" : "Cash"),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (assignment) => {
    setError("");
    if (assignment && (!assignment.driverName.trim() || !assignment.cabNumber.trim())) {
      setError("Cab number and driver name are required.");
      return;
    }
    setBusy(true);
    try { await updateBooking(booking.id, { assignment }); await onSaved(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <Dialog title="Assign cab & driver" subtitle={`${booking.id} · ${booking.name}`} onClose={onClose} busy={busy}>
      <div className="grid grid-cols-2 gap-3">
        <Labeled label="Cab number *"><input value={form.cabNumber} onChange={set("cabNumber")} placeholder="TN 01 AB 1234" className={`${inputCls} uppercase`} /></Labeled>
        <Labeled label="Type of vehicle"><input value={form.vehicleType} onChange={set("vehicleType")} placeholder="Innova Crysta" className={inputCls} /></Labeled>
        <Labeled label="Driver name *"><input value={form.driverName} onChange={set("driverName")} className={inputCls} /></Labeled>
        <Labeled label="Driver phone"><input type="tel" value={form.driverPhone} onChange={set("driverPhone")} placeholder="98765 43210" className={inputCls} /></Labeled>
      </div>
      <Labeled label="Mode of payment">
        <select value={form.paymentMode} onChange={set("paymentMode")} className={inputCls}>
          {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </Labeled>
      <p className="text-[10px] text-zinc-400">The customer sees these details on My Bookings and gets a driver-assigned email.</p>
      <DialogActions
        busy={busy} error={error} onClose={onClose} onSave={() => save(form)} saveLabel="Save"
        extra={booking.assignment && (
          <button type="button" onClick={() => save(null)} disabled={busy} className="text-[11px] font-bold text-red-500 hover:underline">Unassign</button>
        )}
      />
    </Dialog>
  );
}

/**
 * Close a finished trip with the odometer km. Km beyond what the fare
 * included is billed at the per-km rate on the final (post-trip) invoice.
 * Blank included-km / rate fields use the booking's own values server-side.
 */
function CloseTripDialog({ booking, onClose, onSaved }) {
  const c = booking.tripClosure;
  const p = booking.pricing || {};
  const defaultIncluded = Number(p.billKm) || Number(booking.rental?.kms) || Number(booking.distanceKm) || "";
  const [form, setForm] = useState({
    actualKm: c?.actualKm ?? "",
    includedKm: c?.includedKm ?? defaultIncluded,
    extraKmRate: c?.extraKmRate ?? (booking.rental?.kms ? "" : p.perKm ?? ""),
    otherAmount: c?.lines?.find((l) => l.key === "other")?.amount ?? "",
    otherLabel: c?.lines?.find((l) => l.key === "other")?.label ?? "",
    tolls: c?.tolls || "",
    paymentMode: c?.paymentMode || booking.assignment?.paymentMode || "Cash",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const extraKm = Math.max(0, (Number(form.actualKm) || 0) - (Number(form.includedKm) || 0));

  const save = async () => {
    setError("");
    if (!(Number(form.actualKm) > 0)) { setError("Enter the actual km driven."); return; }
    setBusy(true);
    try { await closeTrip(booking.id, form); await onSaved(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <Dialog title={c ? "Edit trip closure" : "Close trip"} subtitle={`${booking.id} · booked fare ${inr(booking.fare)}`} onClose={onClose} busy={busy}>
      <div className="grid grid-cols-2 gap-3">
        <Labeled label="Actual km driven *"><input type="number" min="0" value={form.actualKm} onChange={set("actualKm")} className={inputCls} autoFocus /></Labeled>
        <Labeled label="Km included in fare"><input type="number" min="0" value={form.includedKm} onChange={set("includedKm")} className={inputCls} /></Labeled>
        <Labeled label="Extra km rate ₹/km"><input type="number" min="0" value={form.extraKmRate} onChange={set("extraKmRate")} placeholder="vehicle tariff" className={inputCls} /></Labeled>
        <Labeled label="Tolls & parking ₹"><input type="number" min="0" value={form.tolls} onChange={set("tolls")} className={inputCls} /></Labeled>
        <Labeled label="Other charge ₹"><input type="number" min="0" value={form.otherAmount} onChange={set("otherAmount")} className={inputCls} /></Labeled>
        <Labeled label="Other charge label"><input value={form.otherLabel} onChange={set("otherLabel")} placeholder="Extra hours" className={inputCls} /></Labeled>
      </div>
      <Labeled label="Mode of payment (final bill)">
        <select value={form.paymentMode} onChange={set("paymentMode")} className={inputCls}>
          {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </Labeled>
      <p className="text-[11px] text-zinc-500">
        Extra km: <strong className="text-zinc-900 dark:text-white">{extraKm} km</strong>
        {extraKm > 0 && Number(form.extraKmRate) > 0 && <> × ₹{form.extraKmRate} = <strong className="text-zinc-900 dark:text-white">{inr(extraKm * Number(form.extraKmRate))}</strong> + GST</>}.
        {" "}Saving marks the booking Completed and makes the final invoice available to the customer.
      </p>
      <DialogActions busy={busy} error={error} onClose={onClose} onSave={save} saveLabel={c ? "Update" : "Close trip"} />
    </Dialog>
  );
}

/** Everything about one booking on a single panel (expanded log row). */
function BookingDetail({ b, onEditInvoice }) {
  const facts = [
    ["Customer", b.name],
    ["Phone", b.phone],
    ["Email", /@phone\.invalid$/.test(b.customerEmail || "") ? "" : b.customerEmail],
    ["Booked on", b.createdAt ? new Date(b.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""],
    ["Trip type", b.tripType],
    ["Vehicle", b.vehicle || b.item],
    ["Package", b.packageName],
    ["Travel date", b.toDate && b.toDate !== b.fromDate ? `${b.fromDate} → ${b.toDate}` : b.fromDate],
    ["Pickup time", fmtTime(b.pickupTime)],
    ["Return drop time", fmtTime(b.returnTime)],
    ["Rental duration", rentalOf(b)],
    ["Distance", distanceText(b)],
    ["Days", Number(b.days) > 1 ? String(b.days) : ""],
    ["Passengers", b.passengers],
    ["Payment", b.paymentMethod],
    ["Cab number", b.assignment?.cabNumber],
    ["Cab type", b.assignment?.vehicleType],
    ["Driver", b.assignment?.driverName || (b.driver !== "None" ? b.driver : "")],
    ["Driver phone", b.assignment?.driverPhone],
    ["Payment mode (driver)", b.assignment?.paymentMode],
    ["Final bill paid via", b.tripClosure?.paymentMode],
    ["Company", b.invoiceEdits?.companyName || b.billing?.companyName],
    ["GSTIN", b.invoiceEdits?.gstin || b.billing?.gstin],
    ["Coupon", b.pricing?.coupon?.code ? `${b.pricing.coupon.code} (−${inr(b.pricing.discount)})` : ""],
    ["Advance", Number(b.advanceAmount) > 0 ? `${inr(b.advanceAmount)} online · ${inr(Math.round((b.fare - b.advanceAmount) * 100) / 100)} to driver` : ""],
    ["Booking status", b.status],
    ["Notes", b.notes],
  ].filter(([, v]) => v);

  return (
    <div className="p-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)]">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Route</p>
        <RouteTimeline pickup={b.pickup} stops={stopsOf(b)} drop={b.drop} />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[11px]">
        {facts.map(([k, v]) => (
          <div key={k} className={k === "Notes" ? "col-span-2" : ""}>
            <dt className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">{k}</dt>
            <dd className="text-zinc-800 dark:text-zinc-200 font-medium break-words">{v}</dd>
          </div>
        ))}
      </dl>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Pricing</p>
        <FareBreakdown pricing={bookingPricing(b)} compact />
        <PostTripCharges closure={b.tripClosure} bookedTotal={Number(b.pricing?.total ?? b.fare) || 0} className="mt-3" />
        {b.status !== "Cancelled" && (<>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
            <InvoiceLink b={b} type="pre" label="Pre-invoice" />
            {b.tripClosure && <InvoiceLink b={b} type="post" label="Final invoice" />}
            <button type="button" onClick={onEditInvoice}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-gold hover:underline">
              <Pencil className="w-3 h-3" /> Edit invoice
            </button>
          </div>
          {b.invoiceEdits && <p className="text-[10px] text-zinc-400 mt-1">Invoice details edited by admin.</p>}
        </>)}
      </div>
    </div>
  );
}

function InvoiceLink({ b, type, label }) {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    try {
      const blob = await downloadBookingInvoice(b.id, type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RoadCruise-${type === "post" ? "Final" : "Pre"}-Invoice-${b.id}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" onClick={download} disabled={busy}
      className="inline-flex items-center gap-1 text-[11px] font-bold text-gold hover:underline disabled:opacity-60">
      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} {label}
    </button>
  );
}

/**
 * Hand-edit what the invoices print. Blank fields show the generated value
 * (placeholders). Amounts aren't editable: they always match the booking's
 * pricing, coupon and trip closure.
 */
function EditInvoiceDialog({ booking, onClose, onSaved }) {
  const e0 = booking.invoiceEdits || {};
  const billing = booking.billing || {};
  const FIELDS = [
    "invoiceNumber", "invoiceDate", "finalInvoiceNumber", "finalInvoiceDate",
    "name", "phone", "email", "companyName", "gstin", "address", "note",
  ];
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map((k) => [k, e0[k] || ""])));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === "gstin" ? e.target.value.toUpperCase() : e.target.value }));
  const placeholderEmail = booking.contactEmail || (/@phone\.invalid$/.test(booking.customerEmail || "") ? "" : booking.customerEmail);

  const save = async (data) => {
    setError("");
    setBusy(true);
    try { await editBookingInvoice(booking.id, data); await onSaved(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <Dialog title="Edit invoice" subtitle={`${booking.id} · leave a field blank to use the default`} onClose={onClose} busy={busy}>
      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Invoice</p>
      <div className="grid grid-cols-2 gap-3">
        <Labeled label="Pre-invoice no."><input value={form.invoiceNumber} onChange={set("invoiceNumber")} placeholder={`RC-INV-${booking.id}`} className={inputCls} /></Labeled>
        <Labeled label="Pre-invoice date"><input type="date" value={form.invoiceDate} onChange={set("invoiceDate")} className={inputCls} /></Labeled>
        <Labeled label="Final invoice no."><input value={form.finalInvoiceNumber} onChange={set("finalInvoiceNumber")} placeholder={`${form.invoiceNumber || `RC-INV-${booking.id}`}-F`} className={inputCls} /></Labeled>
        <Labeled label="Final invoice date"><input type="date" value={form.finalInvoiceDate} onChange={set("finalInvoiceDate")} className={inputCls} /></Labeled>
      </div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 pt-1">Billed to</p>
      <div className="grid grid-cols-2 gap-3">
        <Labeled label="Company name"><input value={form.companyName} onChange={set("companyName")} placeholder={billing.companyName || "—"} className={inputCls} /></Labeled>
        <Labeled label="GSTIN"><input value={form.gstin} onChange={set("gstin")} maxLength={15} placeholder={billing.gstin || "—"} className={`${inputCls} uppercase`} /></Labeled>
        <Labeled label="Name / contact"><input value={form.name} onChange={set("name")} placeholder={booking.name || ""} className={inputCls} /></Labeled>
        <Labeled label="Phone"><input value={form.phone} onChange={set("phone")} placeholder={booking.phone || ""} className={inputCls} /></Labeled>
      </div>
      <Labeled label="Email"><input type="email" value={form.email} onChange={set("email")} placeholder={placeholderEmail || "—"} className={inputCls} /></Labeled>
      <Labeled label="Billing address"><textarea rows={2} value={form.address} onChange={set("address")} placeholder={billing.address || "—"} className={`${inputCls} resize-none`} /></Labeled>
      <Labeled label="Note on invoice"><input value={form.note} onChange={set("note")} placeholder="e.g. PO number, cost centre" className={inputCls} /></Labeled>
      <p className="text-[10px] text-zinc-400">Amounts come from the booking, coupon and trip closure and can't be edited here.</p>
      <DialogActions
        busy={busy} error={error} onClose={onClose} onSave={() => save(form)} saveLabel="Save invoice"
        extra={booking.invoiceEdits && (
          <button type="button" onClick={() => save(Object.fromEntries(FIELDS.map((k) => [k, ""])))} disabled={busy}
            className="text-[11px] font-bold text-red-500 hover:underline">Reset all</button>
        )}
      />
    </Dialog>
  );
}

// ============================================================================
//  Coupons
// ============================================================================
const EMPTY_COUPON = {
  code: "", description: "", type: "percent", value: "", maxDiscount: "", minAmount: "",
  validFrom: "", validUntil: "", usageLimit: "", onePerCustomer: true, active: true,
};

function couponSummary(c) {
  const off = c.type === "percent" ? `${c.value}% off${c.maxDiscount ? ` (max ${inr(c.maxDiscount)})` : ""}` : `${inr(c.value)} off`;
  return [off, c.minAmount ? `min fare ${inr(c.minAmount)}` : ""].filter(Boolean).join(" · ");
}

function CouponsTab({ coupons, reload }) {
  const [form, setForm] = useState(EMPTY_COUPON);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: k === "code" ? String(v).toUpperCase().replace(/\s/g, "") : v }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (editingId) await updateCoupon(editingId, form);
      else await createCoupon(form);
      setForm(EMPTY_COUPON);
      setEditingId(null);
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const edit = (c) => {
    setEditingId(c.id);
    setError("");
    setForm({
      code: c.code, description: c.description, type: c.type, value: c.value,
      maxDiscount: c.maxDiscount ?? "", minAmount: c.minAmount ?? "", validFrom: c.validFrom, validUntil: c.validUntil,
      usageLimit: c.usageLimit ?? "", onePerCustomer: c.onePerCustomer, active: c.active,
    });
  };
  const toggle = async (c) => { try { await updateCoupon(c.id, { active: !c.active }); await reload(); } catch (e) { alert(e.message); } };
  const remove = async (c) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    try { await deleteCoupon(c.id); await reload(); } catch (e) { alert(e.message); }
  };

  const today = new Date().toISOString().slice(0, 10);
  const statusOf = (c) =>
    !c.active ? ["Off", "bg-zinc-500/10 text-zinc-500"]
      : c.validUntil && c.validUntil < today ? ["Expired", "bg-red-500/10 text-red-500"]
        : c.usageLimit && c.usedCount >= c.usageLimit ? ["Used up", "bg-amber-500/10 text-amber-600"]
          : c.validFrom && c.validFrom > today ? ["Scheduled", "bg-blue-500/10 text-blue-500"]
            : ["Live", "bg-emerald-500/10 text-emerald-600"];

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start animate-fade-in">
      <form onSubmit={submit} className="p-5 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/60 dark:bg-zinc-900/20 space-y-3">
        <h3 className="text-sm font-bold font-serif">{editingId ? `Edit ${form.code}` : "New coupon"}</h3>
        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Code *"><input required value={form.code} onChange={set("code")} placeholder="WELCOME10" maxLength={20} className={`${inputCls} uppercase tracking-wider`} /></Labeled>
          <Labeled label="Discount type">
            <select value={form.type} onChange={set("type")} className={inputCls}>
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
          </Labeled>
          <Labeled label={form.type === "percent" ? "Discount % *" : "Discount ₹ *"}>
            <input required type="number" min="1" max={form.type === "percent" ? 100 : undefined} value={form.value} onChange={set("value")} className={inputCls} />
          </Labeled>
          {form.type === "percent" ? (
            <Labeled label="Max discount ₹"><input type="number" min="0" value={form.maxDiscount} onChange={set("maxDiscount")} placeholder="No cap" className={inputCls} /></Labeled>
          ) : <div />}
          <Labeled label="Min fare ₹ (before GST)"><input type="number" min="0" value={form.minAmount} onChange={set("minAmount")} placeholder="None" className={inputCls} /></Labeled>
          <Labeled label="Total uses"><input type="number" min="0" value={form.usageLimit} onChange={set("usageLimit")} placeholder="Unlimited" className={inputCls} /></Labeled>
          <Labeled label="Valid from"><input type="date" value={form.validFrom} onChange={set("validFrom")} className={inputCls} /></Labeled>
          <Labeled label="Valid until"><input type="date" value={form.validUntil} onChange={set("validUntil")} className={inputCls} /></Labeled>
        </div>
        <Labeled label="Description (internal)"><input value={form.description} onChange={set("description")} placeholder="e.g. Diwali offer" className={inputCls} /></Labeled>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.onePerCustomer} onChange={set("onePerCustomer")} /> Once per customer</label>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.active} onChange={set("active")} /> Active</label>
        {error && <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg p-2">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-gold hover:bg-gold-hover text-zinc-950 flex items-center justify-center gap-1.5 disabled:opacity-60">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editingId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {editingId ? "Save changes" : "Create coupon"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_COUPON); setError(""); }}
              className="px-4 py-2.5 text-xs font-bold rounded-lg border border-zinc-200 dark:border-white/10">Cancel</button>
          )}
        </div>
        <p className="text-[10px] text-zinc-400 leading-relaxed">
          Customers enter the code at checkout. The discount comes off the fare before GST; cancelling a booking gives the use back.
        </p>
      </form>

      <div className="space-y-3">
        <h3 className="text-base font-bold font-serif">Coupons ({coupons.length})</h3>
        {coupons.length === 0 && (
          <p className="text-xs text-zinc-500 p-6 rounded-2xl border border-dashed border-zinc-300 dark:border-white/10 text-center">No coupons yet — create one on the left.</p>
        )}
        {coupons.map((c) => {
          const [label, cls] = statusOf(c);
          return (
            <div key={c.id} className="p-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/60 dark:bg-zinc-900/20 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm tracking-wider text-gold">{c.code}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
                  {c.onePerCustomer && <span className="text-[10px] text-zinc-400">once per customer</span>}
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-200 mt-1">{couponSummary(c)}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Used {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""} times
                  {(c.validFrom || c.validUntil) && ` · ${c.validFrom || "now"} → ${c.validUntil || "no end"}`}
                  {c.description && ` · ${c.description}`}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => toggle(c)} title={c.active ? "Turn off" : "Turn on"} className="p-1.5 rounded hover:bg-gold/10 text-zinc-500 hover:text-gold">
                  {c.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => edit(c)} title="Edit" className="p-1.5 rounded hover:bg-gold/10 text-zinc-500 hover:text-gold"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(c)} title="Delete" className="p-1.5 rounded hover:bg-red-500/10 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
//  Vehicles (inventory + availability + media)
// ============================================================================
const EMPTY_VEHICLE = {
  name: "", category: "SUVs", seats: "", outstationRate: "", driverBata: "", totalUnits: 1,
  localPricing: { fourHours: "", eightHours: "", twelveHours: "", extraKm: "", extraHr: "" },
  description: "",
};

function VehiclesTab({ vehicles, reload }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_VEHICLE);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        outstationRate: Number(form.outstationRate) || 0,
        driverBata: Number(form.driverBata) || 0,
        totalUnits: Math.max(1, parseInt(form.totalUnits, 10) || 1),
        localPricing: Object.fromEntries(Object.entries(form.localPricing).map(([k, v]) => [k, Number(v) || 0])),
      };
      const created = await createVehicle(payload);
      if (file && file.length) await uploadVehicleMedia(created.id, file);
      setForm(EMPTY_VEHICLE); setFile(null); setShowAdd(false);
      await reload();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const withBusy = async (id, fn) => {
    setBusyId(id);
    try { await fn(); await reload(); } catch (e) { console.error(e); } finally { setBusyId(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Fleet Inventory ({vehicles.length})</h3>
        <button onClick={() => setShowAdd((s) => !s)}
          className="px-4 py-2 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md">
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAdd ? "Close" : "Add Vehicle"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={submit} className="glass-premium p-6 rounded-2xl border border-gold/30 bg-gold/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          <Labeled label="Vehicle Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Toyota Fortuner" /></Labeled>
          <Labeled label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Labeled>
          <Labeled label="Seats"><input value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} className={inputCls} placeholder="e.g. 6+1" /></Labeled>
          <Labeled label="Outstation ₹/km"><input type="number" value={form.outstationRate} onChange={(e) => setForm({ ...form, outstationRate: e.target.value })} className={inputCls} /></Labeled>
          <Labeled label="Driver Bata ₹/day"><input type="number" value={form.driverBata} onChange={(e) => setForm({ ...form, driverBata: e.target.value })} className={inputCls} /></Labeled>
          <Labeled label="Units Available"><input type="number" min="1" value={form.totalUnits} onChange={(e) => setForm({ ...form, totalUnits: e.target.value })} className={inputCls} /></Labeled>
          <Labeled label="Local 4h/40km ₹"><input type="number" value={form.localPricing.fourHours} onChange={(e) => setForm({ ...form, localPricing: { ...form.localPricing, fourHours: e.target.value } })} className={inputCls} /></Labeled>
          <Labeled label="Local 8h/80km ₹"><input type="number" value={form.localPricing.eightHours} onChange={(e) => setForm({ ...form, localPricing: { ...form.localPricing, eightHours: e.target.value } })} className={inputCls} /></Labeled>
          <Labeled label="Local 12h/120km ₹"><input type="number" value={form.localPricing.twelveHours} onChange={(e) => setForm({ ...form, localPricing: { ...form.localPricing, twelveHours: e.target.value } })} className={inputCls} /></Labeled>
          <Labeled label="Extra Km ₹"><input type="number" value={form.localPricing.extraKm} onChange={(e) => setForm({ ...form, localPricing: { ...form.localPricing, extraKm: e.target.value } })} className={inputCls} /></Labeled>
          <Labeled label="Extra Hr ₹"><input type="number" value={form.localPricing.extraHr} onChange={(e) => setForm({ ...form, localPricing: { ...form.localPricing, extraHr: e.target.value } })} className={inputCls} /></Labeled>
          <Labeled label="Photo / Video"><input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files)} className="text-[11px] text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gold/20 file:text-gold" /></Labeled>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={saving} className="w-full py-2.5 bg-gold hover:bg-gold-hover disabled:opacity-60 text-zinc-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Add Vehicle to Fleet
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map((v) => (
          <VehicleCard key={v.id} v={v} busy={busyId === v.id} withBusy={withBusy} />
        ))}
      </div>
    </div>
  );
}

function VehicleCard({ v, busy, withBusy }) {
  const fileRef = useRef(null);
  const [units, setUnits] = useState(v.totalUnits);
  useEffect(() => setUnits(v.totalUnits), [v.totalUnits]);
  const cover = mediaUrl((v.images && v.images[0]) || "");

  return (
    <div className="glass-premium rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-zinc-900/10 overflow-hidden">
      <div className="flex gap-4 p-4">
        <div className="w-28 h-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
          {cover ? <img src={cover} alt={v.name} className="w-full h-full object-cover" /> :
            <div className="w-full h-full flex items-center justify-center text-zinc-300"><Car className="w-8 h-8" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{v.name}</h4>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">{v.category} · {v.seats}</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${v.available ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
              {v.available ? "Units free" : "All units on trips"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
            <span>₹{v.outstationRate}/km</span>
            <span className="flex items-center gap-1">{v.images?.length || 0} <ImageIcon className="w-3 h-3" /></span>
            <span className="flex items-center gap-1">{v.videos?.length || 0} <Film className="w-3 h-3" /></span>
            <span>{v.heldCount}/{v.totalUnits} out</span>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <div className="flex items-center gap-1">
              <input type="number" min="1" value={units} onChange={(e) => setUnits(e.target.value)}
                className="w-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded px-1.5 py-1 text-[11px] text-zinc-800 dark:text-zinc-200" />
              <button onClick={() => withBusy(v.id, () => updateVehicle(v.id, { totalUnits: units }))}
                className="px-2 py-1 text-[10px] font-bold bg-zinc-100 dark:bg-white/5 hover:bg-gold hover:text-zinc-950 rounded" title="Save units">units</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden"
              onChange={(e) => e.target.files.length && withBusy(v.id, () => uploadVehicleMedia(v.id, e.target.files))} />
            <button onClick={() => fileRef.current?.click()} className="px-2 py-1 text-[10px] font-bold bg-zinc-100 dark:bg-white/5 hover:bg-gold hover:text-zinc-950 rounded flex items-center gap-1">
              <Upload className="w-3 h-3" /> Media
            </button>
            <button onClick={() => { if (confirm(`Delete "${v.name}"?`)) withBusy(v.id, () => deleteVehicle(v.id)); }}
              className="px-2 py-1 text-[10px] font-bold text-red-500 hover:bg-red-500/10 rounded flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />}
          </div>
        </div>
      </div>

      {/* Held units — they free automatically after each trip's end date;
          the "Free" button releases one early (e.g. a trip that ended sooner). */}
      {v.heldBookings && v.heldBookings.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-white/5 bg-zinc-50/60 dark:bg-zinc-950/30 p-3 space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Currently held by (auto-frees after trip end)</p>
          {v.heldBookings.map((h) => (
            <div key={h.id} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-zinc-600 dark:text-zinc-300 truncate">
                <span className="font-mono font-bold">{h.id}</span> · {h.name} · {h.fromDate}→{h.toDate}
              </span>
              <button onClick={() => withBusy(v.id, () => releaseVehicleHold(h.id))}
                className="px-2 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded flex items-center gap-1 flex-shrink-0">
                <Unlock className="w-3 h-3" /> Free
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
//  Gallery
// ============================================================================
function GalleryTab({ gallery, reload }) {
  const [files, setFiles] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const upload = async (e) => {
    e.preventDefault();
    if (!files || !files.length) return;
    setUploading(true);
    try {
      await uploadGalleryMedia(files, caption);
      setFiles(null); setCaption("");
      if (inputRef.current) inputRef.current.value = "";
      await reload();
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this media?")) return;
    try { await deleteGalleryItem(id); await reload(); } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={upload} className="glass-premium p-5 rounded-2xl border border-gold/30 bg-gold/5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1">
          <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Photos / Videos</label>
          <input ref={inputRef} type="file" accept="image/*,video/*" multiple onChange={(e) => setFiles(e.target.files)}
            className="text-xs text-zinc-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gold/20 file:text-gold file:font-bold" />
        </div>
        <div className="flex-1">
          <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Caption (optional)</label>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} className={inputCls} placeholder="e.g. Munnar tour, June 2026" />
        </div>
        <button type="submit" disabled={uploading || !files}
          className="px-5 py-2 bg-gold hover:bg-gold-hover disabled:opacity-50 text-zinc-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 h-[38px]">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload
        </button>
      </form>

      {gallery.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">No media uploaded yet. Uploads appear on the public Gallery page.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((m) => (
            <div key={m.id} className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900 aspect-square">
              {m.type === "video"
                ? <video src={mediaUrl(m.url)} className="w-full h-full object-cover" muted />
                : <img src={mediaUrl(m.url)} alt={m.caption || "Gallery media"} className="w-full h-full object-cover" />}
              {m.type === "video" && <Film className="absolute top-2 left-2 w-4 h-4 text-white drop-shadow" />}
              <button onClick={() => remove(m.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {m.caption && <p className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1.5 truncate">{m.caption}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
//  Packages (Tours & Travels page) — add / edit / hide / delete, plus the
//  payment rule: online only, offline only, or partial (advance %) online.
// ============================================================================
const EMPTY_PACKAGE = {
  name: "", tagline: "", duration: "", price: "", rating: "4.8", reviewsCount: "0",
  inclusions: "", exclusions: "", paymentMode: "online", advancePercent: "20",
};

const PAY_MODES = [
  { id: "online", label: "Online only", hint: "Full amount paid online" },
  { id: "offline", label: "Offline only", hint: "Reserve now, pay in person" },
  { id: "partial", label: "Partial online", hint: "Advance % online, balance later" },
];

const payModeLabel = (p) =>
  p.paymentMode === "partial" ? `Partial — ${p.advancePercent}% online`
  : p.paymentMode === "offline" ? "Offline only" : "Online only";

function PackagesTab({ packages, reload }) {
  const [form, setForm] = useState(EMPTY_PACKAGE);
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState("");
  const imageRef = useRef(null);
  const formRef = useRef(null);

  const reset = () => {
    setForm(EMPTY_PACKAGE); setEditingId(null); setImage(null); setErr("");
    if (imageRef.current) imageRef.current.value = "";
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setImage(null);
    setErr("");
    setForm({
      name: p.name, tagline: p.tagline, duration: p.duration, price: p.price,
      rating: p.rating, reviewsCount: String(p.reviewsCount ?? 0),
      inclusions: p.inclusions.join("\n"), exclusions: p.exclusions.join("\n"),
      paymentMode: p.paymentMode, advancePercent: String(p.advancePercent),
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true); setErr("");
    try {
      if (editingId) await updatePackage(editingId, form, image);
      else await createPackage(form, image);
      reset();
      await reload();
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  };

  const withBusy = async (id, fn) => {
    setBusyId(id);
    try { await fn(); await reload(); } catch (ex) { alert(ex.message); } finally { setBusyId(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Tour Packages ({packages.length})</h3>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
          Live packages appear on the <span className="text-gold font-bold">Tours &amp; Travels</span> page. Choose how customers pay for each one.
        </p>
      </div>

      <form ref={formRef} onSubmit={submit} className="glass-premium p-6 rounded-2xl border border-gold/30 bg-gold/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="sm:col-span-2 lg:col-span-3 text-xs font-bold text-gold uppercase tracking-wider">
          {editingId ? "Edit package" : "Add a new package"}
        </div>
        <Labeled label="Package Name *">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Munnar Tea Hills Escape" />
        </Labeled>
        <Labeled label="Tagline">
          <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputCls} placeholder="e.g. Misty tea estates & waterfalls" />
        </Labeled>
        <Labeled label="Duration">
          <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputCls} placeholder="e.g. 3 Days · 2 Nights" />
        </Labeled>
        <Labeled label="Price ₹ per person">
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} placeholder="e.g. 6,999" />
        </Labeled>
        <Labeled label="Rating (e.g. 4.8)">
          <input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className={inputCls} />
        </Labeled>
        <Labeled label="Reviews count">
          <input type="number" min="0" value={form.reviewsCount} onChange={(e) => setForm({ ...form, reviewsCount: e.target.value })} className={inputCls} />
        </Labeled>
        <Labeled label="Included (one per line)">
          <textarea rows={4} value={form.inclusions} onChange={(e) => setForm({ ...form, inclusions: e.target.value })}
            className={inputCls} placeholder={"4★ stay\nPrivate transport\nBreakfast"} />
        </Labeled>
        <Labeled label="Excluded (one per line)">
          <textarea rows={4} value={form.exclusions} onChange={(e) => setForm({ ...form, exclusions: e.target.value })}
            className={inputCls} placeholder={"Lunch & dinner\nEntry tickets\nToll & parking"} />
        </Labeled>
        <Labeled label={editingId ? "Cover Photo (leave empty to keep)" : "Cover Photo"}>
          <input ref={imageRef} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="text-[11px] text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gold/20 file:text-gold" />
        </Labeled>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Payment option for this package</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PAY_MODES.map((m) => (
              <button
                key={m.id} type="button" onClick={() => setForm({ ...form, paymentMode: m.id })}
                className={`text-left p-3 rounded-xl border transition-all ${
                  form.paymentMode === m.id
                    ? "border-gold bg-gold/10"
                    : "border-zinc-200 dark:border-white/10 hover:border-gold/40"
                }`}
              >
                <p className="text-xs font-bold text-zinc-900 dark:text-white">{m.label}</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{m.hint}</p>
              </button>
            ))}
          </div>
          {form.paymentMode === "partial" && (
            <div className="mt-3 max-w-xs">
              <Labeled label="Advance to pay online (%)">
                <input type="number" min="1" max="99" value={form.advancePercent}
                  onChange={(e) => setForm({ ...form, advancePercent: e.target.value })} className={inputCls} />
              </Labeled>
            </div>
          )}
        </div>

        {err && <p className="sm:col-span-2 lg:col-span-3 text-red-500 text-xs">{err}</p>}
        <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gold hover:bg-gold-hover disabled:opacity-60 text-zinc-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editingId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {editingId ? "Save Changes" : "Add Package"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="px-5 py-2.5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 font-bold rounded-lg text-xs uppercase tracking-wider">
              Cancel
            </button>
          )}
        </div>
      </form>

      {packages.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">No packages yet. Add one and it will appear on the Tours &amp; Travels page.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((p) => (
            <div key={p.id} className="glass-premium rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-zinc-900/10 overflow-hidden flex gap-4 p-4">
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                {p.imageUrl ? (
                  <img src={mediaUrl(p.imageUrl)} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300"><PackageIcon className="w-8 h-8" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{p.name}</h4>
                    {p.tagline && <p className="text-[10px] text-zinc-400 truncate">{p.tagline}</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase flex-shrink-0 ${p.active ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-400"}`}>
                    {p.active ? "Live" : "Hidden"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500 flex-wrap">
                  {p.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.duration}</span>}
                  {p.price && <span className="font-bold text-gold">₹{p.price}</span>}
                </div>
                <p className="mt-1.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">Payment: {payModeLabel(p)}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button onClick={() => startEdit(p)}
                    className="px-2 py-1 text-[10px] font-bold bg-zinc-100 dark:bg-white/5 hover:bg-gold hover:text-zinc-950 rounded flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => withBusy(p.id, () => updatePackage(p.id, { active: !p.active }))}
                    className="px-2 py-1 text-[10px] font-bold bg-zinc-100 dark:bg-white/5 hover:bg-gold hover:text-zinc-950 rounded flex items-center gap-1">
                    {p.active ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Go Live</>}
                  </button>
                  <button onClick={() => { if (confirm(`Delete package "${p.name}"?`)) withBusy(p.id, () => deletePackage(p.id)); }}
                    className="px-2 py-1 text-[10px] font-bold text-red-500 hover:bg-red-500/10 rounded flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                  {busyId === p.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
//  Promotions (travel-package popup shown to visitors on site open)
// ============================================================================
const EMPTY_PROMO = { title: "", tagline: "", duration: "", price: "", highlights: "" };

function PromosTab({ promos, reload }) {
  const [form, setForm] = useState(EMPTY_PROMO);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const imageRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await createPromo(form, image);
      setForm(EMPTY_PROMO); setImage(null);
      if (imageRef.current) imageRef.current.value = "";
      await reload();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  /**
   * Announce a package to existing customers. Confirmed explicitly because this
   * is the one action on this screen that costs money and cannot be undone —
   * Hide and Delete only affect the website. Re-announcing the same promo is a
   * no-op server-side (deduped per customer per promo), so the guard is really
   * about the FIRST accidental click.
   */
  /**
   * Download the DLT consent workbook. Warns on an empty list rather than
   * handing over a header-only file: uploading one to Airtel adds nothing and
   * looks identical to a failed upload afterwards.
   */
  const downloadConsent = async () => {
    setBusyId("consent");
    try {
      const { blob, rows } = await downloadConsentFile();
      if (!rows) {
        // Distinguish "nobody opted in" from "they opted in but we hold no mobile
        // number for them". Those need opposite fixes, and a bare zero sends an
        // admin looking in the wrong place.
        const s = await consentSummary().catch(() => null);
        alert(
          s && s.optedIn > 0
            ? `${s.optedIn} customer(s) opted in, but none has a valid 10-digit mobile on their account, so there is nothing to upload.\n\nAdd a mobile number to those accounts, or have them sign in with "Continue with Mobile Number".`
            : "No customers have opted in yet, so the file would be empty.\n\nCustomers opt in at My Bookings → Trip offers."
        );
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "roadcruise-consent.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      alert(`Downloaded ${rows} consent record${rows === 1 ? "" : "s"}.\n\nUpload it at DLT → Manage Consent → Upload Consent.`);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const announce = async (p) => {
    if (!confirm(`Send "${p.title}" to all customers?\n\nEmails go out immediately. This cannot be unsent.`)) return;
    setBusyId(p.id);
    try {
      const r = await announcePromo(p.id);
      alert(`Announcement queued for ${r.audience} customer${r.audience === 1 ? "" : "s"}.\n\n${r.note}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const withBusy = async (id, fn) => {
    setBusyId(id);
    try { await fn(); await reload(); } catch (e) { console.error(e); } finally { setBusyId(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
        <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Package Promotions ({promos.length})</h3>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
          The newest <span className="text-gold font-bold">Live</span> promotion appears as a popup when visitors open the website — once per session.
        </p>
        </div>
        <button
          type="button"
          onClick={downloadConsent}
          disabled={busyId === "consent"}
          title="Export customers who opted in, in Airtel DLT's Upload Consent format"
          className="px-3 py-1.5 text-[11px] font-bold border border-zinc-200 dark:border-white/10 hover:border-gold/60 text-zinc-600 dark:text-zinc-300 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" /> Consent file for DLT
        </button>
      </div>

      <form onSubmit={submit} className="glass-premium p-6 rounded-2xl border border-gold/30 bg-gold/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Labeled label="Package Title *">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="e.g. Kodaikanal Adventure Special" />
        </Labeled>
        <Labeled label="Tagline">
          <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputCls} placeholder="e.g. Misty hills, bonfires & lakeside views" />
        </Labeled>
        <Labeled label="Duration">
          <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputCls} placeholder="e.g. 3 Days · 4 Nights" />
        </Labeled>
        <Labeled label="Price ₹ (starting from)">
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} placeholder="e.g. 6,999" />
        </Labeled>
        <Labeled label="Cover Photo">
          <input ref={imageRef} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="text-[11px] text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gold/20 file:text-gold" />
        </Labeled>
        <div className="sm:col-span-2 lg:col-span-1">
          <Labeled label="Highlights (one per line, max 6)">
            <textarea rows={3} value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })}
              className={inputCls} placeholder={"Sightseeing & local guides\nPrivate SUV transport\nComplimentary breakfasts"} />
          </Labeled>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-gold hover:bg-gold-hover disabled:opacity-60 text-zinc-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Megaphone className="w-3.5 h-3.5" />} Publish Promotion
          </button>
        </div>
      </form>

      {promos.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">No promotions yet. Publish one and it will greet visitors on the home page.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promos.map((p) => (
            <div key={p.id} className="glass-premium rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-zinc-900/10 overflow-hidden flex gap-4 p-4">
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                {p.imageUrl ? (
                  <img src={mediaUrl(p.imageUrl)} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300"><Megaphone className="w-8 h-8" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{p.title}</h4>
                    {p.tagline && <p className="text-[10px] text-zinc-400 truncate">{p.tagline}</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase flex-shrink-0 ${p.active ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-400"}`}>
                    {p.active ? "Live" : "Hidden"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500">
                  {p.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.duration}</span>}
                  {p.price && <span className="font-bold text-gold">₹{p.price}</span>}
                  {p.highlights?.length > 0 && <span>{p.highlights.length} highlights</span>}
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button onClick={() => withBusy(p.id, () => updatePromo(p.id, { active: !p.active }))}
                    className="px-2 py-1 text-[10px] font-bold bg-zinc-100 dark:bg-white/5 hover:bg-gold hover:text-zinc-950 rounded flex items-center gap-1">
                    {p.active ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Go Live</>}
                  </button>
                  <button
                    onClick={() => announce(p)}
                    disabled={busyId === p.id}
                    title="Email existing customers about this package (SMS follows once the DLT template is approved)"
                    className="px-2 py-1 text-[10px] font-bold bg-gold/10 text-gold hover:bg-gold hover:text-zinc-950 rounded flex items-center gap-1 disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" /> Notify Customers
                  </button>
                  <button onClick={() => { if (confirm(`Delete promotion "${p.title}"?`)) withBusy(p.id, () => deletePromo(p.id)); }}
                    className="px-2 py-1 text-[10px] font-bold text-red-500 hover:bg-red-500/10 rounded flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                  {busyId === p.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Labeled({ label, children }) {
  return (
    <div>
      <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );
}
