import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  BadgeCheck, ShieldCheck, Timer, Check, X, Car, Users, Route, Pencil, ChevronDown,
} from "lucide-react";
import TripPlanner from "../components/booking/TripPlanner";
import { RouteTimeline } from "../components/booking/FareBreakdown";
import { getVehicles, quoteTrip, mediaUrl } from "../utils/api";
import {
  decodeSearch, tripFromSearch, tripTypeByKey, hourlyPackageByKey,
  formatINR, fmtDate, fmtTime, fmtDuration,
} from "../utils/fare";
import innovaCrystaImg from "../assets/innova-crysta.webp";

// Bundled fallback for the seed innova-crysta (same convention as Fleet.jsx).
const SEED_ASSET = { "innova-crysta": innovaCrystaImg };
const vehicleImage = (v) => {
  if (v.images && v.images.length) return mediaUrl(v.images[0]);
  return SEED_ASSET[v.id] || null;
};

const TRUST_ITEMS = [
  { icon: BadgeCheck, text: "No Hidden Charges" },
  { icon: ShieldCheck, text: "Free Cancellation Up To 1 Hour" },
  { icon: Timer, text: "On-Time Pickup" },
];

export default function BookResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const search = useMemo(() => decodeSearch(params), [params]);

  const [vehicles, setVehicles] = useState(null); // null = loading
  const [quote, setQuote] = useState(null); // server quote: { route, days, gstRate, advanceRate, quotes }
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false); // mobile "modify search"

  // Invalid/expired URL -> back to the hero widget.
  useEffect(() => {
    if (!search) navigate("/", { replace: true });
  }, [search, navigate]);

  useEffect(() => {
    if (!search) return;
    let active = true;
    setVehicles(null);
    setQuote(null);
    setError("");
    setEditOpen(false);

    // Prices come from the server (same code that prices the booking); the
    // vehicle list supplies names, photos and seats.
    Promise.all([getVehicles(), quoteTrip(tripFromSearch(search))])
      .then(([v, q]) => {
        if (!active) return;
        setVehicles(Array.isArray(v) ? v : []);
        setQuote(q);
      })
      .catch((e) => active && setError(e.message || "Could not load fares. Please try again."));
    return () => {
      active = false;
    };
  }, [search]);

  if (!search) return null;

  const pkg = search.type === "hourly" ? hourlyPackageByKey(search.pkg) : null;
  const route = quote?.route || null;
  const days = quote?.days || 1;
  const stops = search.stops || [];
  const ready = vehicles !== null && quote !== null;

  // Every configured vehicle that can serve this trip type is bookable.
  const byId = new Map((vehicles || []).map((v) => [v.id, v]));
  const cards = ready
    ? quote.quotes
        .filter((q) => byId.has(q.vehicleId))
        .map((q) => ({ vehicle: byId.get(q.vehicleId), quote: q }))
        .sort((a, b) => a.quote.pricing.total - b.quote.pricing.total)
    : [];

  const selectCab = ({ vehicle, quote: vq }) => {
    const payload = {
      search,
      route,
      days,
      advanceRate: quote.advanceRate,
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        category: vehicle.category,
        seats: vehicle.seats,
        outstationRate: vehicle.outstationRate,
        image: vehicleImage(vehicle),
      },
      quote: vq,
      savedAt: Date.now(),
    };
    sessionStorage.setItem("rc_checkout", JSON.stringify(payload));
    navigate("/book/checkout");
  };

  return (
    <section className="min-h-screen pt-24 pb-16 bg-zinc-50 dark:bg-bg-dark">
      {/* Trust strip */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6">
        <div className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark rounded-2xl px-6 py-3.5 flex flex-wrap items-center justify-center md:justify-between gap-x-8 gap-y-2 shadow-lg shadow-gold/10">
          {TRUST_ITEMS.map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-2 text-zinc-950 text-xs font-bold tracking-wide">
              <Icon className="w-4 h-4" /> {text}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* ---------------------------------------------------- search panel */}
        <aside className="lg:sticky lg:top-24">
          <div className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
            {/* Mobile: collapsed summary with a "modify" toggle */}
            <button
              type="button"
              onClick={() => setEditOpen((o) => !o)}
              className="lg:hidden w-full flex items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer"
            >
              <span className="min-w-0">
                <span className="block text-[10px] uppercase tracking-wider text-gold font-bold mb-0.5">
                  {tripTypeByKey(search.type)?.short}
                </span>
                <span className="block text-sm font-semibold text-zinc-900 dark:text-white truncate">
                  {search.pickup.name || search.pickup.label}
                  {search.drop ? ` → ${search.drop.name || search.drop.label}` : ` · ${pkg?.label}`}
                  {stops.length > 0 && ` · ${stops.length} stop${stops.length > 1 ? "s" : ""}`}
                </span>
                <span className="block text-xs text-zinc-500 mt-0.5">
                  {fmtDate(search.date)} · {fmtTime(search.time)}
                </span>
              </span>
              <span className="flex items-center gap-1 text-gold text-xs font-bold shrink-0">
                <Pencil className="w-3.5 h-3.5" />
                <ChevronDown className={`w-4 h-4 transition-transform ${editOpen ? "rotate-180" : ""}`} />
              </span>
            </button>

            <div className={`${editOpen ? "block" : "hidden"} lg:block p-5 lg:pt-5 pt-0`}>
              {/* Desktop route summary */}
              <div className="hidden lg:block mb-4">
                <span className="block text-[10px] uppercase tracking-wider text-gold font-bold mb-3">
                  Your Trip
                </span>
                <RouteTimeline pickup={search.pickup.label} stops={stops} drop={search.drop?.label} />
              </div>
              <TripPlanner key={params.toString()} variant="panel" initial={search} />
            </div>
          </div>
        </aside>

        {/* --------------------------------------------------------- results */}
        <div className="min-w-0">
          {/* Distance / package banner */}
          <div className="mb-5">
            {search.type === "hourly" ? (
              <p className="text-sm md:text-base font-semibold text-zinc-800 dark:text-zinc-200">
                <Timer className="w-4 h-4 inline-block mr-2 text-gold -mt-0.5" />
                {pkg.label} rental · {fmtDate(search.date)} · {fmtTime(search.time)}
                <span className="block md:inline md:ml-2 text-xs font-normal text-zinc-500">
                  Extra hours & kms charged as per tariff
                </span>
              </p>
            ) : route ? (
              <p className="text-sm md:text-base font-semibold text-zinc-800 dark:text-zinc-200">
                <Route className="w-4 h-4 inline-block mr-2 text-gold -mt-0.5" />
                {search.type === "roundtrip" ? (
                  <>Round trip — {formatINR(route.distanceKm)} km up + {formatINR(route.distanceKm)} km down = <span className="text-gold">{formatINR(route.distanceKm * 2)} km</span></>
                ) : (
                  <>Distance — {route.distanceKm} km</>
                )}
                {stops.length > 0 && ` via ${stops.length} stop${stops.length > 1 ? "s" : ""}`} · Travel time — {fmtDuration(route.durationMin)}{search.type === "roundtrip" && " each way"}
                <span className="block md:inline md:ml-2 text-xs font-normal text-zinc-500">
                  {route.estimated ? "Estimated · " : ""}Actual travel distance and time may vary
                </span>
              </p>
            ) : !error ? (
              <div className="h-5 w-72 max-w-full rounded bg-zinc-200 dark:bg-white/10 animate-pulse" />
            ) : null}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl p-6 text-sm">
              {error}
              <button
                onClick={() => navigate(0)}
                className="block mt-3 text-gold font-bold uppercase text-xs tracking-wider cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {!ready && !error && (
            <div className="space-y-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-2xl p-6 animate-pulse">
                  <div className="flex gap-6">
                    <div className="w-40 h-28 rounded-xl bg-zinc-200 dark:bg-white/10 hidden sm:block" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-white/10" />
                      <div className="h-3 w-64 max-w-full rounded bg-zinc-200 dark:bg-white/10" />
                      <div className="h-3 w-52 max-w-full rounded bg-zinc-200 dark:bg-white/10" />
                    </div>
                    <div className="w-28 space-y-3 hidden md:block">
                      <div className="h-7 rounded bg-zinc-200 dark:bg-white/10" />
                      <div className="h-9 rounded bg-zinc-200 dark:bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {ready && !error && cards.length === 0 && (
            <div className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-2xl p-10 text-center">
              <Car className="w-10 h-10 text-gold mx-auto mb-3" />
              <p className="text-zinc-800 dark:text-zinc-200 font-semibold">No cabs available for this trip type yet.</p>
              <p className="text-sm text-zinc-500 mt-1">
                Try a different trip type, or <Link to="/contact" className="text-gold underline">contact us</Link> for a custom quote.
              </p>
            </div>
          )}

          <div className="space-y-5">
            {cards.map((c) => (
              <CabCard key={c.vehicle.id} card={c} onSelect={() => selectCab(c)} />
            ))}
          </div>

          {ready && cards.length > 0 && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-6">
              Fares include {quote.gstRate}% GST and the charges listed under inclusions; anything listed
              under exclusions is payable separately.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function CabCard({ card, onSelect }) {
  const { vehicle, quote } = card;
  const { pricing } = quote;
  // Remote seed images can 404/be hotlink-blocked — fall back to the icon.
  const [imgFailed, setImgFailed] = useState(false);
  const img = !imgFailed && vehicleImage(vehicle);

  return (
    <div
      className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/5 transition-all hover:border-gold/40 hover:shadow-gold/5"
    >
      <div className="grid md:grid-cols-[1fr_auto] items-stretch">
        <div className="p-5 md:p-6 flex flex-col sm:flex-row gap-5 min-w-0">
          {/* Photo */}
          <div className="w-full sm:w-44 h-40 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-white/5 flex items-center justify-center">
            {img ? (
              <img
                src={img}
                alt={vehicle.name}
                loading="lazy"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Car className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">{vehicle.name}</h3>
              {vehicle.seats && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 rounded-full px-2.5 py-0.5">
                  <Users className="w-3 h-3" /> {vehicle.seats}
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5">
                <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                  <Check className="w-4 h-4" /> Included
                </p>
                <ul className="space-y-1.5">
                  {quote.included.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-[13px] font-medium text-zinc-800 dark:text-zinc-100 leading-snug">
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 dark:bg-red-500/10 p-3.5">
                <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
                  <X className="w-4 h-4" /> Excluded
                </p>
                <ul className="space-y-1.5">
                  {quote.excluded.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-[13px] font-medium text-zinc-700 dark:text-zinc-200 leading-snug">
                      <X className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-500" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="md:w-52 md:border-l border-t md:border-t-0 border-zinc-100 dark:border-white/5 p-5 md:p-6 flex md:flex-col items-center justify-between md:justify-center gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">
              ₹ {formatINR(pricing.total)}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug tabular-nums">
              ₹ {formatINR(pricing.subtotal)} + {pricing.gstRate}% GST
            </p>
          </div>
          <button
            type="button"
            onClick={onSelect}
            className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all bg-gold hover:bg-gold-hover text-zinc-950 shadow-md shadow-gold/15 hover:shadow-lg active:scale-[0.98] cursor-pointer"
          >
            Select Cab
          </button>
        </div>
      </div>
    </div>
  );
}
