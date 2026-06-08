import React from "react";
import { ArrowRight } from "lucide-react";

const DESTINATIONS = [
  {
    name: "Ooty",
    category: "Hill Station",
    duration: "2N · 3D",
    price: "6,499",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600"
  },
  {
    name: "Kodaikanal",
    category: "Hill Station",
    duration: "1N · 2D",
    price: "4,999",
    image: "https://images.unsplash.com/photo-1626583223726-b259a1cf244c?auto=format&fit=crop&q=80&w=600"
  },
  {
    name: "Kerala Backwaters",
    category: "Houseboat Tour",
    duration: "3N · 4D",
    price: "12,999",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=600"
  },
  {
    name: "Mysore Heritage",
    category: "Palace Tour",
    duration: "1N · 2D",
    price: "5,499",
    image: "https://images.unsplash.com/photo-1590766948562-0f69f159e47f?auto=format&fit=crop&q=80&w=600"
  }
];

export default function Destinations() {
  return (
    <section id="destinations" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <h2 className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">Featured Destinations</h2>
            <p className="text-3xl md:text-4xl font-serif font-bold text-white">
              Explore incredible South India.
            </p>
          </div>
          <a 
            href="#packages"
            className="text-sm font-semibold text-gold hover:text-gold-hover transition-colors flex items-center gap-1.5 group"
          >
            <span>View all packages</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DESTINATIONS.map((dest) => (
            <div 
              key={dest.name}
              className="group relative h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/5 hover:border-gold/30 hover:scale-[1.01] transition-all duration-300"
            >
              {/* Img background */}
              <img 
                src={dest.image} 
                alt={dest.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-90"
                loading="lazy"
              />
              
              {/* Ambient dark gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

              {/* Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end space-y-3">
                <span className="px-3 py-1 bg-gold/25 backdrop-blur-md border border-gold/40 rounded-full text-[9px] uppercase tracking-widest text-gold w-max font-semibold">
                  {dest.category}
                </span>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white tracking-wide">{dest.name}</h3>
                  <p className="text-xs text-zinc-400">{dest.duration}</p>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Starts from</span>
                  <span className="text-sm font-serif font-bold text-gold">₹{dest.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
