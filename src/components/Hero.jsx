import React from "react";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import TripPlanner from "./booking/TripPlanner";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-zinc-100/35 via-zinc-50/70 to-white/90 dark:from-zinc-900/30 dark:via-zinc-950/95 dark:to-zinc-950 z-10 transition-colors duration-300"></div>

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 cinematic-vignette z-15 pointer-events-none opacity-30 dark:opacity-90"></div>

      {/* Background Video with Poster Fallback */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          //poster="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920"
          className="w-full h-full object-cover opacity-35 dark:opacity-100 transition-opacity duration-500"
        >
          <source
            src="https://www.pexels.com/download/video/32298055/"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 md:px-6 text-center space-y-8 mt-8">

        {/* Govt Recognition Badge */}
        <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 animate-pulse">
          <Award className="w-4 h-4 text-gold text-glow-gold" />
          <span className="text-[10px] tracking-[0.2em] font-semibold text-gold uppercase">
            Ministry of Tourism · Government of India
          </span>
        </div>

        {/* Main Tagline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
          Where every journey <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold italic font-normal text-glow-gold">
            feels like a cruise.
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
          Premium rental vehicles and curated tour packages across South India — driven by certified professionals, meticulously designed for the ultimate comfort of a true cruise.
        </p>

        {/* Trip Planner — airport / one-way / round-trip / hourly fare search */}
        <div className="w-full max-w-5xl mx-auto mt-6 relative group/booking">
          {/* Animated glow border underneath card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-gold/30 to-gold-dark/30 rounded-3xl blur-xl opacity-20 group-hover/booking:opacity-45 transition duration-500 pointer-events-none"></div>
          <div className="relative">
            <TripPlanner variant="hero" />
          </div>
        </div>

        {/* Alternative Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          <span className="hidden sm:inline">Or explore more:</span>
          <Link to="/vehicles" className="hover:text-gold transition-colors">View Fleet</Link>
          <span className="text-zinc-300 dark:text-white/10">•</span>
          <Link to="/tours-travels" className="hover:text-gold transition-colors">Tour Packages</Link>
          <span className="text-zinc-300 dark:text-white/10">•</span>
          <Link to="/contact" className="hover:text-gold transition-colors">Contact Support</Link>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-16 border-t border-zinc-200 dark:border-white/5">
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif font-bold text-gold text-glow-gold">Govt. Recognized</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 uppercase tracking-widest">Tourism Approved</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif font-bold text-gold text-glow-gold">ISO 9001:2015</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 uppercase tracking-widest">Certified Quality</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif font-bold text-gold text-glow-gold">Trusted by 10K+</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 uppercase tracking-widest">Happy Customers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif font-bold text-gold text-glow-gold">24/7 Support</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 uppercase tracking-widest">Always Available</span>
          </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent"></div>
    </section>
  );
}
