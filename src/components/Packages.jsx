import React from "react";
import { Star, CheckCircle, Clock, MapPin, Calendar, ArrowRight } from "lucide-react";

const PACKAGES_DATA = [
  {
    id: "kodai-premium",
    name: "Kodaikanal Premium Package",
    tagline: "Escape to the Pristine Hills",
    duration: "2 Days · 1 Night",
    price: "4,999",
    rating: "4.9",
    reviewsCount: 142,
    image: "https://images.pexels.com/photos/26933686/pexels-photo-26933686.jpeg",
    inclusions: [
      "Selected 4★ Boutique Stay",
      "Private Transport (Dzire/SUV)",
      "Sightseeing & Local Guides",
      "Complimentary Breakfasts"
    ]
  },
  {
    id: "kerala-backwaters",
    name: "Kerala Backwaters Cruise",
    tagline: "Unwind on Premium Houseboats",
    duration: "4 Days · 3 Nights",
    price: "12,999",
    rating: "4.8",
    reviewsCount: 98,
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=600",
    inclusions: [
      "Premium Houseboat Accommodation",
      "All Meals (Traditional Kerala)",
      "Alleppey & Kumarakom Tours",
      "Private Cochin Airport Pickup"
    ]
  },
  {
    id: "ooty-heritage",
    name: "Ooty Tea Garden Retreat",
    tagline: "Ride the Iconic Toy Train",
    duration: "3 Days · 2 Nights",
    price: "6,499",
    rating: "4.9",
    reviewsCount: 165,
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
    inclusions: [
      "Boutique Estate Resort Stay",
      "Toy Train First Class Tickets",
      "Tea Estate Sightseeing",
      "Local Driver Bata Included"
    ]
  },
  {
    id: "coorg-coffee",
    name: "Coorg Coffee Plantation Trek",
    tagline: "Mist, Waterfalls, & Trekking",
    duration: "3 Days · 2 Nights",
    price: "7,999",
    rating: "4.7",
    reviewsCount: 110,
    image: "https://images.pexels.com/photos/29535096/pexels-photo-29535096.jpeg",
    inclusions: [
      "Heritage Plantation Homestay",
      "Abbey & Iruppu Falls Sightseeing",
      "Guided Estate Trek & Tasting",
      "Private SUV Transport (Innova)"
    ]
  }
];

const GROUP_TOURS = [
  { 
    id: 1, 
    name: "Kodaikanal Monsoons Group Ride", 
    date: "July 12, 2026", 
    duration: "2D · 1N", 
    seatsLeft: 5, 
    totalSeats: 12, 
    price: "4,499",
    status: "Filling Fast"
  },
  { 
    id: 2, 
    name: "Ooty Independence Weekend Ride", 
    date: "August 15, 2026", 
    duration: "3D · 2N", 
    seatsLeft: 9, 
    totalSeats: 18, 
    price: "5,999",
    status: "Limited Seats"
  },
  { 
    id: 3, 
    name: "Kerala Backwaters Winter Cruise", 
    date: "September 24, 2026", 
    duration: "4D · 3N", 
    seatsLeft: 3, 
    totalSeats: 8, 
    price: "11,999",
    status: "Almost Full"
  }
];

export default function Packages({ onBookNowClick }) {
  return (
    <section id="packages" className="py-24 bg-zinc-50 dark:bg-bg-dark relative overflow-hidden transition-colors duration-300">
      
      {/* Cinematic ambient highlights */}
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-gold/5 blur-[130px] rounded-full pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" style={{ animationDelay: "3s" }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-24">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 bg-gold/15 border border-gold/30 rounded-full animate-pulse">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase text-glow-gold">Curated Tour Packages</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
            Journeys Crafted For The <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold-dark italic font-normal text-glow-gold">
              Discerning Traveller
            </span>
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
            Avoid planning stress. Choose our high-end, pre-scheduled private vacation packages complete with premium transport, dining reservations, and certified accommodations.
          </p>
        </div>

        {/* 1. Holiday Packages Grid (4 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PACKAGES_DATA.map((pkg) => (
            <div 
              key={pkg.id} 
              className="group flex flex-col justify-between rounded-3xl glass-premium border border-zinc-200 dark:border-white/5 hover:border-gold/40 hover:scale-[1.02] hover:-translate-y-1.5 shadow-2xl hover:shadow-gold/5 transition-all duration-500 bg-white/40 dark:bg-zinc-900/10 overflow-hidden"
            >
              
              {/* Image Section */}
              <div className="h-48 relative overflow-hidden bg-zinc-950">
                <img 
                  src={pkg.image} 
                  alt={pkg.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent"></div>
                
                {/* Duration Badge */}
                <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-3.5 py-1 rounded-full text-[9px] uppercase font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  <span>{pkg.duration}</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border border-gold/40 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 text-zinc-800 dark:text-white shadow-sm">
                  <Star className="w-3.5 h-3.5 text-gold fill-gold text-glow-gold" />
                  <span>{pkg.rating}</span>
                </div>
              </div>

              {/* Card Details Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white group-hover:text-gold transition-colors tracking-wide leading-snug">
                      {pkg.name}
                    </h3>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 italic">
                      {pkg.tagline}
                    </p>
                  </div>

                  {/* Bullet Inclusions with Gold Check */}
                  <div className="space-y-2 pt-2 border-t border-zinc-150 dark:border-white/5">
                    {pkg.inclusions.map((inc, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                        <CheckCircle className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing & Booking CTA */}
                <div className="pt-4 border-t border-zinc-100 dark:border-white/5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">Rate Per Person</span>
                    <span className="text-sm font-serif font-bold text-gold text-glow-gold">₹{pkg.price}</span>
                  </div>

                  <button
                    onClick={() => onBookNowClick(pkg.name, "package")}
                    className="w-full py-3 bg-zinc-950 hover:bg-gold dark:bg-white/5 dark:hover:bg-gold text-white hover:text-zinc-950 dark:text-white dark:hover:text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                  >
                    Book Package
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* 2. Monthly Scheduled Group Departures (Full-width Board) */}
        <div className="relative group/board pt-12">
          {/* Ambient Board Shadow glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-gold/15 to-gold-dark/15 rounded-3xl blur-xl opacity-15 pointer-events-none"></div>

          <div className="glass-premium p-8 rounded-3xl bg-white/40 dark:bg-zinc-900/10 border border-zinc-200 dark:border-white/5 relative z-10 space-y-8 text-left">
            <div>
              <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-white tracking-wide">
                Monthly Scheduled Group Tours
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Reserve individual seats on our shared premium coaches. Perfect for solo travellers, couples, or budget-conscious families.
              </p>
            </div>

            {/* Departures List Board */}
            <div className="divide-y divide-zinc-200/50 dark:divide-white/5 space-y-4">
              {GROUP_TOURS.map((tour) => (
                <div 
                  key={tour.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white tracking-wide group-hover:text-gold transition-colors">
                        {tour.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-red-500/10 border border-red-500/20 text-red-500">
                        {tour.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gold" />
                        {tour.date}
                      </span>
                      <span>•</span>
                      <span>Duration: {tour.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">Seat Price</span>
                      <span className="text-base font-serif font-bold text-gold text-glow-gold">₹{tour.price}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-block px-3 py-1 bg-zinc-100 dark:bg-white/5 border border-zinc-250 dark:border-white/10 rounded-full text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                        {tour.seatsLeft} of {tour.totalSeats} seats left
                      </span>
                      <button
                        onClick={() => onBookNowClick(tour.name, "package")}
                        className="px-5 py-2.5 bg-gold hover:bg-gold-hover text-zinc-950 font-bold text-[10px] tracking-wider uppercase rounded-xl active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>Reserve Seat</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
