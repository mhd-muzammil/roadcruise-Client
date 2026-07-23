import React, { useState, useEffect } from "react";
import { Users, Shield, Info, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import innovaCrystaImg from "../assets/innova-crysta.webp";
import { getVehicles, mediaUrl } from "../utils/api";

// Bundled fallback image for the seed innova-crysta (it shipped as an asset, not
// a URL). Used only until an admin uploads a real photo for it.
const SEED_ASSET = { "innova-crysta": innovaCrystaImg };

// Cover image for a vehicle: first uploaded/seed image, else the bundled asset
// fallback for known seed ids, else null (renders a placeholder).
const coverFor = (v) => {
  if (v.images && v.images.length) return mediaUrl(v.images[0]);
  return SEED_ASSET[v.id] || null;
};

export default function Fleet({ onBookNowClick }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // Retry handler (used by the error state's button).
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setVehicles(await getVehicles());
    } catch (e) {
      setError(e?.message || "Could not load the fleet.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch. Kept inline (not calling load()) so no setState runs
  // synchronously in the effect body — the first update happens after the await.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getVehicles();
        if (active) setVehicles(data);
      } catch (e) {
        if (active) setError(e?.message || "Could not load the fleet.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const categories = ["All", ...Array.from(new Set(vehicles.map((v) => v.category).filter(Boolean)))];
  const filtered = activeTab === "All" ? vehicles : vehicles.filter((v) => v.category === activeTab);

  return (
    <section id="fleet" className="py-24 bg-zinc-100/50 dark:bg-zinc-950/60 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">Our Premium Fleet</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 dark:text-white">
            A luxury vehicle for every mile ahead.
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light">
            Review our verified, deep-cleaned, GPS-enabled fleet with detailed local package and outstation pricing structures.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
            <p className="text-sm mt-3">Loading the fleet…</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center py-16 space-y-4">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
            <button onClick={load} className="px-5 py-2.5 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-full text-xs uppercase tracking-wider transition-all">
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Category filter tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === category
                      ? "bg-gold text-zinc-950 shadow-md shadow-gold/10 font-bold"
                      : "bg-white dark:bg-white/5 border border-zinc-200 dark:border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((vehicle) => {
                const cover = coverFor(vehicle);
                const booked = vehicle.available === false;
                const lp = vehicle.localPricing || {};
                return (
                  <div
                    key={vehicle.id}
                    className="group overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 hover:border-gold/30 dark:hover:border-gold/30 hover:scale-[1.01] flex flex-col h-full shadow-sm hover:shadow-md dark:shadow-none transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="h-52 overflow-hidden relative bg-zinc-950">
                      {cover ? (
                        <img
                          src={cover}
                          alt={`${vehicle.name} — chauffeur-driven rental in Chennai, South India`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs uppercase tracking-widest">No image</div>
                      )}

                      {/* Seating badge */}
                      <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] uppercase font-bold text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gold" />
                        <span>{vehicle.seats} seats</span>
                      </div>

                      {/* Availability badge */}
                      <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-[10px] uppercase font-bold flex items-center gap-1.5 backdrop-blur-md border ${
                        booked ? "bg-red-500/20 border-red-400/40 text-red-100" : "bg-emerald-500/20 border-emerald-400/40 text-emerald-100"
                      }`}>
                        {booked ? "Currently Booked" : <><CheckCircle className="w-3 h-3" /> Available</>}
                      </div>

                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md border border-gold/40 px-3.5 py-1.5 rounded-full shadow-sm">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Outstation: </span>
                        <span className="text-sm font-serif font-bold text-gold">₹{vehicle.outstationRate}</span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">/km</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-white tracking-wide group-hover:text-gold transition-colors">
                            {vehicle.name}
                          </h3>
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-1">{vehicle.category}</p>
                        </div>

                        <div className="bg-zinc-50 dark:bg-white/5 p-3.5 rounded-xl border border-zinc-200 dark:border-white/5 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500">Outstation Rate:</span>
                            <span className="font-bold text-zinc-900 dark:text-white">₹{vehicle.outstationRate} / km</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500">Driver Bata:</span>
                            <span className="font-bold text-zinc-900 dark:text-white">₹{vehicle.driverBata} / day</span>
                          </div>
                        </div>

                        {(lp.fourHours || lp.eightHours || lp.twelveHours) && (
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-gold/80" />
                              <span>Local Packages</span>
                            </h4>
                            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                              <div className="p-2 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-200 dark:border-white/5">
                                <span className="block text-zinc-400 mb-0.5">4h / 40km</span>
                                <span className="font-bold text-zinc-900 dark:text-white">₹{lp.fourHours}</span>
                              </div>
                              <div className="p-2 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-200 dark:border-white/5">
                                <span className="block text-zinc-400 mb-0.5">8h / 80km</span>
                                <span className="font-bold text-zinc-900 dark:text-white">₹{lp.eightHours}</span>
                              </div>
                              <div className="p-2 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-200 dark:border-white/5">
                                <span className="block text-zinc-400 mb-0.5">12h / 120km</span>
                                <span className="font-bold text-zinc-900 dark:text-white">₹{lp.twelveHours}</span>
                              </div>
                            </div>
                            <div className="flex justify-between text-[10px] text-zinc-500 px-1 pt-1.5 border-t border-zinc-100 dark:border-white/5 font-light">
                              <span>Extra Km: ₹{lp.extraKm}/km</span>
                              <span>Extra Hr: ₹{lp.extraHr}/hr</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => !booked && onBookNowClick({ name: vehicle.name, type: "vehicle", vehicle })}
                        disabled={booked}
                        className={`w-full py-3 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${
                          booked
                            ? "bg-zinc-200 dark:bg-white/5 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                            : "bg-zinc-100 dark:bg-white/5 hover:bg-gold hover:text-zinc-950 dark:hover:text-zinc-950 text-zinc-800 dark:text-white cursor-pointer"
                        }`}
                      >
                        {booked ? "Booked — Choose Another" : "Book Now"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Exclusions */}
        <div className="mt-16 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-600 dark:text-zinc-400 max-w-4xl mx-auto space-y-3">
          <h4 className="font-bold text-gold uppercase tracking-wider text-center sm:text-left flex items-center gap-2">
            <Info className="w-4 h-4 text-gold flex-shrink-0" />
            <span>Tariff Exclusions & Guidelines</span>
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 list-disc list-inside">
            <li>Excludes Toll Gate fees & Parking charges.</li>
            <li>Excludes State Entry Tax & Permits.</li>
            <li>Excludes Hill Station entry charges.</li>
            <li>Night allowance of ₹200 to ₹500 applies for driving between 10:00 PM and 5:00 AM (varies per vehicle).</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
