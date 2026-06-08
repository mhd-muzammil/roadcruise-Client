import React from "react";
import { Award } from "lucide-react";

export default function Hero({ onBookNowClick }) {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-zinc-900/40 via-zinc-950/90 to-zinc-950 z-0"></div>
      <div 
        className="absolute inset-0 z-0 opacity-15 bg-cover bg-center mix-blend-overlay"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920')` }}
      ></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8 mt-8">
        
        {/* Govt Recognition Badge */}
        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 animate-bounce-slow">
          <Award className="w-4 h-4 text-gold" />
          <span className="text-[10px] tracking-[0.2em] font-semibold text-gold uppercase">
            Ministry of Tourism · Government of India
          </span>
        </div>

        {/* Main Tagline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white leading-none">
          Where every journey <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold italic font-normal">
            feels like a cruise.
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-sm md:text-base text-zinc-400 leading-relaxed font-light">
          Premium rental vehicles and curated tour packages across South India — driven by certified professionals, meticulously designed for the ultimate comfort of a true cruise.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a 
            href="#fleet"
            className="w-full sm:w-auto px-8 py-3.5 bg-gold hover:bg-gold-hover text-zinc-950 font-bold text-sm tracking-wider uppercase rounded-full shadow-lg shadow-gold/10 active:scale-[0.98] transition-all duration-300"
          >
            Book Rental Vehicle
          </a>
          <a 
            href="#packages"
            className="w-full sm:w-auto px-8 py-3.5 glass hover:bg-white/5 text-white font-bold text-sm tracking-wider uppercase rounded-full active:scale-[0.98] transition-all duration-300"
          >
            Explore Tour Packages
          </a>
          <a 
            href="#contact"
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:text-gold border border-white/10 hover:border-gold/50 text-zinc-300 text-sm tracking-wider uppercase rounded-full transition-all duration-300"
          >
            Contact Us
          </a>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-16 border-t border-white/5">
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif font-bold text-gold">Govt. Recognized</span>
            <span className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Tourism Approved</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif font-bold text-gold">ISO 9001:2015</span>
            <span className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Certified Quality</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif font-bold text-gold">Trusted by 10K+</span>
            <span className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Happy Customers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif font-bold text-gold">24/7 Support</span>
            <span className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Always Available</span>
          </div>
        </div>

      </div>

      {/* Section Transition Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent"></div>
    </section>
  );
}
