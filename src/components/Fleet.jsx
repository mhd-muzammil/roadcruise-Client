import React, { useState } from "react";
import { Users, Shield, Info } from "lucide-react";
import innovaCrystaImg from "../assets/innova-crysta.webp";

const VEHICLE_CATEGORIES = [
  "All",
  "Sedans",
  "SUVs",
  "Tempo Travellers",
  "Mini Buses"
];

const VEHICLES = [
  {
    id: "sedan",
    name: "Sedan (Dzire, Aura, Amaze)",
    category: "Sedans",
    seats: "4+1",
    image:
      "https://i.pinimg.com/736x/8e/64/cc/8e64cc674cf764b5275adbb274d04698.jpg",
    outstationRate: 14,
    driverBata: 500,
    localPricing: {
      fourHours: 1250,
      eightHours: 2300,
      twelveHours: 3200,
      extraKm: 20,
      extraHr: 220,
    },
  },
  {
    id: "suv-any",
    name: "Any SUV (Ertiga, Marazzo, Kia Carens)",
    category: "SUVs",
    seats: "6+1",
    image:
      "https://i.pinimg.com/736x/ff/a4/7c/ffa47cd2acadeae55de83aaa4ac5e127.jpg",
    outstationRate: 18,
    driverBata: 500,
    localPricing: {
      fourHours: 1500,
      eightHours: 3300,
      twelveHours: 4700,
      extraKm: 30,
      extraHr: 330,
    },
  },
  {
    id: "kia-carens",
    name: "Kia Carens",
    category: "SUVs",
    seats: "6+1",
    image:
      "https://i.pinimg.com/736x/c7/1a/dd/c71add24f15c9afa2208057e15cb8872.jpg",
    outstationRate: 20,
    driverBata: 600,
    localPricing: {
      fourHours: 1600,
      eightHours: 3500,
      twelveHours: 4900,
      extraKm: 33,
      extraHr: 350,
    },
  },
  {
    id: "innova-crysta",
    name: "Innova Crysta",
    category: "SUVs",
    seats: "7+1",
    image: innovaCrystaImg,
    outstationRate: 22,
    driverBata: 600,
    localPricing: {
      fourHours: 2000,
      eightHours: 1, // TEMP: ₹1 to test a real live payment — REVERT to 4000 after
      twelveHours: 5900,
      extraKm: 33,
      extraHr: 450,
    },
  },
  {
    id: "innova-hycross",
    name: "Innova Hycross",
    category: "SUVs",
    seats: "6+1 OR 7+1",
    image:
      "https://i.pinimg.com/736x/f7/ed/ca/f7edca42deefeeeea0db247dcf0f6669.jpg",
    outstationRate: 24,
    driverBata: 700,
    localPricing: {
      fourHours: 2200,
      eightHours: 4400,
      twelveHours: 6500,
      extraKm: 35,
      extraHr: 500,
    },
  },
  {
    id: "urbania",
    name: "Urbania 12+1",
    category: "Tempo Travellers",
    seats: "12+1",
    image:
      "https://i.pinimg.com/736x/bf/15/ec/bf15ec742c2440c20ad5100b11fa260c.jpg",
    outstationRate: 35,
    driverBata: 1000,
    localPricing: {
      fourHours: 5000,
      eightHours: 10000,
      twelveHours: 14000,
      extraKm: 45,
      extraHr: 1000,
    },
  },
  {
    id: "tt-12",
    name: "Tempo Traveller 12 A/C",
    category: "Tempo Travellers",
    seats: "12+1",
    image:
      "https://i.pinimg.com/736x/30/1d/4a/301d4abe73a0f1696cb52aca1f9d971d.jpg",
    outstationRate: 24,
    driverBata: 800,
    localPricing: {
      fourHours: 3000,
      eightHours: 6000,
      twelveHours: 8500,
      extraKm: 35,
      extraHr: 600,
    },
  },
  {
    id: "tt-18",
    name: "Tempo Traveller 18 A/C",
    category: "Tempo Travellers",
    seats: "18+1",
    image:
      "https://i.pinimg.com/736x/7b/51/ec/7b51eccb7d78865b277dcdcf0c4c2260.jpg",
    outstationRate: 26,
    driverBata: 900,
    localPricing: {
      fourHours: 3500,
      eightHours: 7000,
      twelveHours: 9900,
      extraKm: 35,
      extraHr: 700,
    },
  },
  {
    id: "minibus-21",
    name: "Mini Bus 21 Seater",
    category: "Mini Buses",
    seats: "21+1",
    image:
      "https://i.pinimg.com/736x/22/49/f8/2249f882da27004c2d6bc07085ea6349.jpg",
    outstationRate: 30,
    driverBata: 1000,
    localPricing: {
      fourHours: 5000,
      eightHours: 9000,
      twelveHours: 12200,
      extraKm: 40,
      extraHr: 800,
    },
  },
  {
    id: "minibus-32",
    name: "Mini Bus 32 Seater",
    category: "Mini Buses",
    seats: "32+1",
    image:
      "https://i.pinimg.com/736x/5a/2c/24/5a2c24f96ef56e633fec7fc21aff079f.jpg",
    outstationRate: 50,
    driverBata: 1200,
    localPricing: {
      fourHours: 8000,
      eightHours: 12000,
      twelveHours: 18000,
      extraKm: 50,
      extraHr: 1500,
    },
  },
];

export default function Fleet({ onBookNowClick }) {
  const [activeTab, setActiveTab] = useState("All");

  const filteredVehicles = activeTab === "All" 
    ? VEHICLES 
    : VEHICLES.filter((v) => v.category === activeTab);

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

        {/* Navigation Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12">
          {VEHICLE_CATEGORIES.map((category) => (
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

        {/* Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map((vehicle) => (
            <div 
              key={vehicle.id} 
              className="group overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 hover:border-gold/30 dark:hover:border-gold/30 hover:scale-[1.01] flex flex-col h-full shadow-sm hover:shadow-md dark:shadow-none transition-all duration-300"
            >
              {/* Image Showcase */}
              <div className="h-52 overflow-hidden relative bg-zinc-950">
                <img 
                  src={vehicle.image}
                  alt={`${vehicle.name} — chauffeur-driven rental in Chennai, South India`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
                
                {/* Seating badge */}
                <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] uppercase font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gold" />
                  <span>{vehicle.seats} seats</span>
                </div>

                <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md border border-gold/40 px-3.5 py-1.5 rounded-full shadow-sm">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Outstation: </span>
                  <span className="text-sm font-serif font-bold text-gold">₹{vehicle.outstationRate}</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">/km</span>
                </div>
              </div>

              {/* Body details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-white tracking-wide group-hover:text-gold transition-colors">
                      {vehicle.name}
                    </h3>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-1">
                      {vehicle.category}
                    </p>
                  </div>

                  {/* Outstation Rates & Bata */}
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

                  {/* Local Packages Grid */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-gold/80" />
                      <span>Local Packages</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="p-2 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-200 dark:border-white/5">
                        <span className="block text-zinc-400 mb-0.5">4h / 40km</span>
                        <span className="font-bold text-zinc-900 dark:text-white">₹{vehicle.localPricing.fourHours}</span>
                      </div>
                      <div className="p-2 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-200 dark:border-white/5">
                        <span className="block text-zinc-400 mb-0.5">8h / 80km</span>
                        <span className="font-bold text-zinc-900 dark:text-white">₹{vehicle.localPricing.eightHours}</span>
                      </div>
                      <div className="p-2 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-200 dark:border-white/5">
                        <span className="block text-zinc-400 mb-0.5">12h / 120km</span>
                        <span className="font-bold text-zinc-900 dark:text-white">₹{vehicle.localPricing.twelveHours}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 px-1 pt-1.5 border-t border-zinc-100 dark:border-white/5 font-light">
                      <span>Extra Km: ₹{vehicle.localPricing.extraKm}/km</span>
                      <span>Extra Hr: ₹{vehicle.localPricing.extraHr}/hr</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => onBookNowClick({ name: vehicle.name, type: "vehicle", vehicle })}
                  className="w-full py-3 bg-zinc-100 dark:bg-white/5 hover:bg-gold hover:text-zinc-950 dark:hover:text-zinc-950 text-zinc-800 dark:text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Exclusions Disclaimer Box */}
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
