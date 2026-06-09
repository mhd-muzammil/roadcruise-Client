import React from "react";
import { Compass, Clock, MapPin, ArrowRight } from "lucide-react";

const DESTINATIONS = [
  {
    name: "Ooty Hills",
    category: "Hill Station",
    duration: "2N · 3D",
    price: "6,499",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
    landmarks: "Doddabetta Peak, Tea Estates, Pykara Lake"
  },
  {
    name: "Kodaikanal Lake",
    category: "Hill Station",
    duration: "1N · 2D",
    price: "4,999",
    image: "https://images.unsplash.com/photo-1626583223726-b259a1cf244c?auto=format&fit=crop&q=80&w=600",
    landmarks: "Pillar Rocks, Coaker's Walk, Pine Forests"
  },
  {
    name: "Kerala Backwaters",
    category: "Houseboat Tour",
    duration: "3N · 4D",
    price: "12,999",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=600",
    landmarks: "Alleppey Houseboats, Kumarakom Bird Sanctuary"
  },
  {
    name: "Mysore Heritage",
    category: "Palace Tour",
    duration: "1N · 2D",
    price: "5,499",
    image: "https://images.unsplash.com/photo-1590766948562-0f69f159e47f?auto=format&fit=crop&q=80&w=600",
    landmarks: "Mysore Palace, Chamundi Hills, Brindavan Gardens"
  },
  {
    name: "Coorg Mist",
    category: "Coffee Highlands",
    duration: "2N · 3D",
    price: "7,999",
    image: "https://images.unsplash.com/photo-1593693411515-c202e974fe05?auto=format&fit=crop&q=80&w=600",
    landmarks: "Abbey Falls, Dubare Elephant Camp, Raja's Seat"
  },
  {
    name: "Munnar Valleys",
    category: "Tea Gardens",
    duration: "3N · 4D",
    price: "9,499",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
    landmarks: "Eravikulam National Park, Mattupetty Dam, Tea Museum"
  },
  {
    name: "Pondicherry Coast",
    category: "French Colony",
    duration: "2N · 3D",
    price: "5,999",
    image: "https://images.unsplash.com/photo-1588598046603-51833dc86938?auto=format&fit=crop&q=80&w=600",
    landmarks: "Auroville, Paradise Beach, White Town Streets"
  },
  {
    name: "Kanyakumari Shore",
    category: "Ocean Sunrise",
    duration: "1N · 2D",
    price: "4,999",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=600",
    landmarks: "Vivekananda Rock, Thiruvalluvar Statue, Triveni Sangam"
  }
];

export default function Destinations() {
  return (
    <section id="destinations" className="py-24 relative overflow-hidden bg-zinc-50 dark:bg-bg-dark transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6 border-b border-zinc-200 dark:border-white/5 pb-8">
          <div className="space-y-4 text-left">
            <div className="inline-block px-3 py-1 bg-gold/15 border border-gold/30 rounded-full animate-pulse">
              <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase text-glow-gold">Featured Destinations</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
              Explore Incredible <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-dark italic font-normal text-glow-gold">
                South India Gateway
              </span>
            </h2>
          </div>
          <a 
            href="#packages"
            className="text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors flex items-center gap-1.5 group border border-gold/30 px-5 py-2.5 rounded-xl bg-gold/5 hover:bg-gold/10"
          >
            <span>View All Packages</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Destinations Grid (8 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {DESTINATIONS.map((dest, idx) => (
            <div 
              key={dest.name}
              className="group relative h-96 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-white/5 hover:border-gold/50 hover:scale-[1.03] hover:-translate-y-1.5 transition-all duration-500 bg-zinc-950 flex flex-col justify-end"
            >
              
              {/* Img background */}
              <img 
                src={dest.image} 
                alt={dest.name} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1200ms] brightness-[0.7] group-hover:brightness-[0.85]"
                loading="lazy"
              />
              
              {/* Ambient dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent z-10"></div>

              {/* Floating top right compass on hover */}
              <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 p-2.5 rounded-full text-gold opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 z-20">
                <Compass className="w-4 h-4 text-glow-gold group-hover:rotate-45 transition-transform duration-500" />
              </div>

              {/* Index Watermark on left */}
              <span className="absolute left-6 top-4 text-4xl font-serif font-extrabold text-white/5 select-none pointer-events-none z-20">
                {String(idx + 1).padStart(2, "0")}
              </span>

              {/* Content Overlay */}
              <div className="p-6 space-y-4 relative z-20 text-left">
                <span className="px-3 py-1 bg-gold/20 backdrop-blur-md border border-gold/30 rounded-full text-[9px] uppercase tracking-widest text-gold w-max font-bold">
                  {dest.category}
                </span>
                
                <div>
                  <h3 className="text-xl font-serif font-bold text-white tracking-wide">{dest.name}</h3>
                  <p className="text-xs text-zinc-300 mt-0.5">{dest.duration}</p>
                </div>

                {/* Landmarks list sliding open on hover */}
                <div className="max-h-0 opacity-0 group-hover:max-h-16 group-hover:opacity-100 transition-all duration-500 overflow-hidden text-[10px] text-zinc-300 pt-2.5 border-t border-white/10 mt-1">
                  <span className="font-semibold text-gold">Highlights:</span> {dest.landmarks}
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3.5">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Starts from</span>
                  <span className="text-sm font-serif font-bold text-gold text-glow-gold">₹{dest.price}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
