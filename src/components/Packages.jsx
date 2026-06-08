import React from "react";
import { CheckCircle } from "lucide-react";

const GROUP_TOURS = [
  { id: 1, name: "Kodaikanal Group Tour", date: "July 2026", seats: 12 },
  { id: 2, name: "Ooty Weekend Ride", date: "August 2026", seats: 18 },
  { id: 3, name: "Kerala Backwaters Cruise", date: "September 2026", seats: 8 }
];

export default function Packages({ onBookNowClick }) {
  return (
    <section id="packages" className="py-24 bg-zinc-100/50 dark:bg-zinc-950/60 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">Curated Packages</h2>
          <p className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 dark:text-white">
            Luxury tours designed for you.
          </p>
        </div>

        {/* Grid split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Featured Tour Card */}
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 p-8 flex flex-col justify-between relative shadow-sm dark:shadow-none bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900/50 dark:to-zinc-950/30">
            <div className="absolute top-6 right-6 px-3.5 py-1 bg-gold/10 border border-gold/30 rounded-full">
              <span className="text-[10px] text-gold font-bold tracking-widest uppercase">Best Seller</span>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white tracking-wide">
                  Featured Tour: Kodaikanal Premium
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">2 Days · 1 Night Package</p>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                Escape to the pristine hills of Kodaikanal. Our premium tour package includes travel in a sanitised SUV, stay at selected 4-star properties, complimentary breakfasts & dinners, localized tourist sightseeing, and drop back.
              </p>

              {/* Package Inclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Selected 4★ Accommodation</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Private SUV Transport (Innova)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Sightseeing & Guide Services</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Complimentary Meals (Breakfast & Dinner)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-zinc-200 dark:border-white/5 pt-6 mt-8 gap-4">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Complete Deal Starts at</span>
                <span className="text-2xl font-serif font-bold text-gold">₹4,999</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400"> / Person</span>
              </div>
              <button
                onClick={() => onBookNowClick("Kodaikanal Premium", "package")}
                className="w-full sm:w-auto px-8 py-3.5 bg-gold hover:bg-gold-hover text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer"
              >
                Book Package
              </button>
            </div>
          </div>

          {/* Monthly Group Tours */}
          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 p-8 flex flex-col justify-between shadow-sm dark:shadow-none">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-white tracking-wide">
                  Monthly Group Tours
                </h3>
                <p className="text-xs text-gold/80 mt-1 uppercase tracking-widest font-semibold">Reserve Your Seat</p>
              </div>

              {/* Tracker list */}
              <div className="space-y-4 pt-2">
                {GROUP_TOURS.map((tour) => (
                  <div 
                    key={tour.id}
                    className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 hover:border-gold/10 rounded-xl transition-all"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white tracking-wide">{tour.name}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{tour.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 rounded-full text-[10px] font-bold text-red-600 dark:text-red-400 animate-pulse">
                        {tour.seats} seats left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onBookNowClick("Monthly Group Tour Seat", "package")}
              className="w-full py-3.5 mt-8 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 border border-gold text-gold font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer"
            >
              Reserve Seat Now
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
