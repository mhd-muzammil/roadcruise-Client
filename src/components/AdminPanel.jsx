import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Car, ClipboardList, DollarSign, Plus, ShieldAlert, Trash2, Check, X,
  Users, Image as ImageIcon, Film, Upload, Unlock, Loader2, LayoutGrid,
} from "lucide-react";
import {
  fetchBookings, updateBooking, deleteBooking,
  getAdminVehicles, createVehicle, updateVehicle, deleteVehicle, uploadVehicleMedia, releaseVehicleHold,
  getGallery, uploadGalleryMedia, deleteGalleryItem, mediaUrl,
} from "../utils/api";

const TABS = [
  { id: "overview", label: "Analytics", icon: LayoutGrid },
  { id: "bookings", label: "Bookings", icon: ClipboardList },
  { id: "fleet", label: "Vehicles", icon: Car },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
];

const CATEGORIES = ["Sedans", "SUVs", "Tempo Travellers", "Mini Buses", "Luxury", "Other"];
const DRIVERS = ["None", "Arjun Singh", "Ramesh Kumar", "Karthik Raja", "Sathish Nair"];

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
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

  useEffect(() => {
    if (!isAdmin) return;
    loadBookings();
    loadVehicles();
    loadGallery();
  }, [isAdmin, loadBookings, loadVehicles, loadGallery]);

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

function BookingsTab({ bookings, reload, reloadVehicles }) {
  const [busy, setBusy] = useState(null);

  const act = async (fn, id) => {
    setBusy(id);
    try { await fn(); await reload(); await reloadVehicles(); }
    catch (e) { console.error(e); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Booking Logs ({bookings.length})</h3>
      <div className="w-full overflow-x-auto rounded-2xl border border-zinc-200 dark:border-white/5 shadow-xl glass-premium bg-white/40 dark:bg-zinc-900/10">
        <table className="w-full text-left border-collapse min-w-[820px]">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-white/5 bg-zinc-100/40 dark:bg-zinc-950/20 text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
              <th className="p-4">Ref</th>
              <th className="p-4">Client</th>
              <th className="p-4">Vehicle / Route</th>
              <th className="p-4">Dates</th>
              <th className="p-4">Fare</th>
              <th className="p-4">Status</th>
              <th className="p-4">Driver</th>
              <th className="p-4 text-center">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5 text-xs text-zinc-700 dark:text-zinc-300">
            {bookings.length === 0 ? (
              <tr><td colSpan="8" className="p-8 text-center text-zinc-400 italic">No bookings yet.</td></tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono font-bold text-zinc-900 dark:text-white">{b.id}</td>
                  <td className="p-4">
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{b.name}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">{b.phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{b.vehicle || b.item}</p>
                    {(b.pickup || b.drop) && (
                      <p className="text-[10px] text-zinc-400">{[b.pickup, b.drop].filter(Boolean).join(" → ")}</p>
                    )}
                    <span className="text-[8px] bg-gold/10 text-gold px-1 rounded uppercase font-semibold">{b.tripType}</span>
                  </td>
                  <td className="p-4 font-mono text-[10px]">{b.fromDate} → {b.toDate}</td>
                  <td className="p-4 font-bold font-mono text-zinc-900 dark:text-white">{inr(b.fare)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${statusCls(b.status)}`}>{b.status}</span>
                    {b.vehicleId && b.vehicleReleased && <span className="block text-[8px] text-zinc-400 mt-1">unit freed</span>}
                  </td>
                  <td className="p-4">
                    <select
                      value={b.driver || "None"}
                      onChange={(e) => act(() => updateBooking(b.id, { driver: e.target.value }), b.id)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-gold text-zinc-800 dark:text-zinc-300 font-medium"
                    >
                      {DRIVERS.map((d) => <option key={d} value={d}>{d === "None" ? "Unassigned" : d}</option>)}
                    </select>
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
              ))
            )}
          </tbody>
        </table>
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
              {v.available ? "Available" : "Fully booked"}
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

      {/* Held units — admin frees them here after the trip */}
      {v.heldBookings && v.heldBookings.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-white/5 bg-zinc-50/60 dark:bg-zinc-950/30 p-3 space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Currently held by</p>
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

function Labeled({ label, children }) {
  return (
    <div>
      <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );
}
