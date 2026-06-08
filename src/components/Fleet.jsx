import React, { useState } from "react";
import { Users, Clock, Car } from "lucide-react";

const VEHICLE_CATEGORIES = [
  "SUVs",
  "Sedans",
  "Hatchbacks",
  "Luxury Cars",
  "Tempo Travellers",
  "Mini Buses"
];

const VEHICLES = [
  {
    id: "innova",
    name: "Toyota Innova Crysta",
    category: "SUVs",
    rate: 18,
    seats: 7,
    hours: 24,
    minDistance: 300,
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "fortuner",
    name: "Toyota Fortuner 4x4",
    category: "SUVs",
    rate: 26,
    seats: 7,
    hours: 24,
    minDistance: 300,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "eclass",
    name: "Mercedes-Benz E-Class",
    category: "Luxury Cars",
    rate: 32,
    seats: 4,
    hours: 12,
    minDistance: 250,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "sclass",
    name: "Mercedes-Benz S-Class",
    category: "Luxury Cars",
    rate: 65,
    seats: 4,
    hours: 12,
    minDistance: 200,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "urbania",
    name: "Force Urbania Premium",
    category: "Tempo Travellers",
    rate: 26,
    seats: 13,
    hours: 24,
    minDistance: 300,
    image: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "traveller",
    name: "Tempo Traveller Executive",
    category: "Tempo Travellers",
    rate: 22,
    seats: 12,
    hours: 24,
    minDistance: 300,
    image: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "swift",
    name: "Maruti Suzuki Swift",
    category: "Hatchbacks",
    rate: 12,
    seats: 5,
    hours: 24,
    minDistance: 200,
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "i20",
    name: "Hyundai i20 Asta",
    category: "Hatchbacks",
    rate: 13,
    seats: 5,
    hours: 24,
    minDistance: 200,
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "city",
    name: "Honda City i-VTEC",
    category: "Sedans",
    rate: 16,
    seats: 5,
    hours: 24,
    minDistance: 250,
    image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "ciaz",
    name: "Maruti Suzuki Ciaz",
    category: "Sedans",
    rate: 15,
    seats: 5,
    hours: 24,
    minDistance: 250,
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "minibus",
    name: "Premium Charter Mini Bus",
    category: "Mini Buses",
    rate: 38,
    seats: 21,
    hours: 24,
    minDistance: 350,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600"
  }
];

export default function Fleet({ onBookNowClick }) {
  const [activeTab, setActiveTab] = useState("SUVs");

  const filteredVehicles = VEHICLES.filter((v) => v.category === activeTab);

  return (
    <section id="fleet" className="py-24 bg-zinc-950/60 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">Our Premium Fleet</h2>
          <p className="text-3xl md:text-4xl font-serif font-bold text-white">
            A luxury vehicle for every mile ahead.
          </p>
          <p className="text-sm text-zinc-400 font-light">
            From efficient hatchbacks for city visits to luxury sedans and full-scale mini buses for group travel — every vehicle is deeply sanitised, GPS-enabled, and paired with a verified chauffeur.
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
                  : "glass text-zinc-400 hover:text-white"
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
              className="group overflow-hidden rounded-2xl glass-card border border-white/5 hover:border-gold/30 hover:scale-[1.01] flex flex-col h-full bg-zinc-900/30"
            >
              {/* Image Showcase */}
              <div className="h-52 overflow-hidden relative bg-zinc-950">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md border border-gold/40 px-3.5 py-1.5 rounded-full">
                  <span className="text-sm font-serif font-bold text-gold">₹{vehicle.rate}</span>
                  <span className="text-[10px] text-zinc-400">/km</span>
                </div>
              </div>

              {/* Body details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-serif text-white tracking-wide group-hover:text-gold transition-colors">
                    {vehicle.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
                    {vehicle.category}
                  </p>
                </div>

                {/* Vehicle Specs Icons */}
                <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-4 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold/80" />
                    <span>{vehicle.seats} Seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold/80" />
                    <span>{vehicle.hours} Hrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gold/80" />
                    <span>{vehicle.minDistance} km min</span>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => onBookNowClick(vehicle.name, "vehicle")}
                  className="w-full py-3 bg-white/5 hover:bg-gold hover:text-zinc-950 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
