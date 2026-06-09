import React from "react";
import { 
  Shield, Car, Compass, DollarSign, Star, 
  Award, Phone, FileText, Sparkles, Users, 
  Target, Clock, ArrowRight 
} from "lucide-react";

const ADVANTAGES = [
  {
    title: "Premium Rental Services",
    desc: "A handpicked selection of top-tier vehicles tailored for corporate, family, and luxury travel.",
    icon: Car
  },
  {
    title: "Safe & Verified Vehicles",
    desc: "GPS tracking, speed limiters, speed governors, and verified professional chauffeurs.",
    icon: Shield
  },
  {
    title: "Wide Destination Coverage",
    desc: "Curated packages across South India's premium hills, beaches, and heritage locations.",
    icon: Compass
  },
  {
    title: "Affordable Pricing",
    desc: "Transparent rates per kilometer with no hidden fees, dynamic surcharges, or surprises.",
    icon: DollarSign
  },
  {
    title: "Trusted Customer Reviews",
    desc: "Over 10,000+ satisfied travellers scoring us consistently at 4.9 out of 5 stars.",
    icon: Star
  },
  {
    title: "Government Recognized",
    desc: "Officially recognized by the Ministry of Tourism, Government of India.",
    icon: Award
  },
  {
    title: "24/7 Customer Support",
    desc: "Dedicated travel support desk available round-the-clock for route changes and emergencies.",
    icon: Phone
  },
  {
    title: "Instant Invoice Download",
    desc: "Fast, automated corporate and personal invoicing generated right after journey closure.",
    icon: FileText
  }
];

const CORE_VALUES = [
  {
    title: "Safety & Integrity",
    desc: "Every fleet vehicle is GPS-monitored with strict speed-limits and certified drivers. Your safety is our absolute priority.",
    icon: Shield
  },
  {
    title: "Luxury Excellence",
    desc: "Meticulously maintained, deep-cleaned interiors, premium seating arrangements, and premium climate controls.",
    icon: Sparkles
  },
  {
    title: "Absolute Transparency",
    desc: "Upfront pricing calculations, detailed outstation/local invoices, and zero hidden charges at the end of the trip.",
    icon: Target
  }
];

const STATS = [
  { label: "Happy Travellers", value: "10K+", icon: Users },
  { label: "Premium Vehicles", value: "25+", icon: Car },
  { label: "Customer Rating", value: "4.9★", icon: Star },
  { label: "Years of Trust", value: "5+", icon: Award }
];

export default function About() {
  return (
    <div className="space-y-24 pb-24 transition-colors duration-300">
      
      {/* 1. Brand Story & Statistics Grid */}
      <section className="relative overflow-hidden pt-28 pb-16 bg-zinc-50 dark:bg-bg-dark border-b border-zinc-200 dark:border-white/5">
        {/* Cinematic ambient lighting */}
        <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-gold/5 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Story Text (Left 7 Columns) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-block px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
                <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase text-glow-gold">Our Story</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
                Crafting road journeys that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-dark italic font-normal text-glow-gold">
                  feel like a cruise.
                </span>
              </h2>
              
              <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                <p>
                  Founded with a vision to redefine travel in South India, **Road Cruise** is more than just a car rental service. We set out to bridge the gap between long hours on the road and ultimate relaxation, designing experiences that match the comfort, luxury, and peace of mind of a premium cruise ship.
                </p>
                <p>
                  Whether it is our modern, GPS-monitored fleet, strict speed regulation protocols, or our network of certified professional chauffeurs, every detail is meticulously tailored for the comfort of our clients. Today, we stand proud as a Ministry of Tourism recognized operator, serving thousands of happy holidaymakers, families, and corporate executives.
                </p>
              </div>
            </div>

            {/* Stats Panel (Right 5 Columns) */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-gold-dark/20 rounded-3xl blur-xl opacity-20 pointer-events-none"></div>
              
              <div className="grid grid-cols-2 gap-4">
                {STATS.map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div 
                      key={stat.label}
                      className="glass-premium p-6 rounded-2xl border border-zinc-200 dark:border-white/5 text-center flex flex-col items-center justify-center space-y-2 bg-white/40 dark:bg-zinc-900/10"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/25">
                        <StatIcon className="w-5 h-5 text-glow-gold" />
                      </div>
                      <span className="text-2xl font-serif font-bold text-zinc-900 dark:text-white text-glow-gold">
                        {stat.value}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-500 font-semibold">
                        {stat.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Core Values Section */}
      <section className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase text-glow-gold">Guiding Principles</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-zinc-900 dark:text-white">
            Driven by our values.
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
            We operate on three core pillars that guarantee premium travel quality and reliability for every reservation.
          </p>
        </div>

        {/* Values cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CORE_VALUES.map((val) => {
            const ValIcon = val.icon;
            return (
              <div 
                key={val.title}
                className="p-8 rounded-3xl glass-premium border border-zinc-200 dark:border-white/5 flex flex-col space-y-4 text-left hover:border-gold/30 hover:scale-[1.01] transition-all bg-white/40 dark:bg-zinc-900/10"
              >
                <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center text-gold border border-gold/30 shadow-lg shadow-gold/5">
                  <ValIcon className="w-6 h-6 text-glow-gold" />
                </div>
                <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white tracking-wide">
                  {val.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                  {val.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Why Choose Us (8 Advantages Grid) */}
      <section className="max-w-7xl mx-auto px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>

        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16 relative z-10">
          <div className="inline-block px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase text-glow-gold">Why Choose Us</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-zinc-900 dark:text-white">
            Eight reasons travellers choose us.
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
            From official government recognition to transparent pricing, we have built a service tailored around customer satisfaction.
          </p>
        </div>

        {/* Grid Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {ADVANTAGES.map((adv, idx) => {
            const AdvIcon = adv.icon;
            return (
              <div 
                key={adv.title}
                className="group relative p-8 rounded-3xl glass-premium hover:border-gold/50 hover:scale-[1.03] hover:-translate-y-2 shadow-2xl hover:shadow-gold/5 transition-all duration-500 bg-white/40 dark:bg-zinc-900/10 text-left flex flex-col justify-between overflow-hidden"
              >
                {/* Accent glow top line on hover */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                {/* Shimmer sweep effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>

                {/* Index Watermark in background */}
                <span className="absolute right-6 top-4 text-6xl font-serif font-extrabold text-gold/[0.03] dark:text-gold/[0.05] group-hover:text-gold/[0.12] transition-colors duration-500 select-none pointer-events-none">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className="space-y-6 relative z-10">
                  {/* Icon Frame */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200/50 dark:from-white/5 dark:to-white/[0.01] flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-zinc-950 group-hover:bg-gradient-to-br group-hover:from-gold group-hover:to-amber-500 border border-zinc-200 dark:border-white/10 group-hover:border-gold/50 group-hover:shadow-lg group-hover:shadow-gold/20 transition-all duration-500">
                    <AdvIcon className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white group-hover:text-gold transition-colors tracking-wide">
                      {adv.title}
                    </h3>
                    
                    {/* Tiny accent line under heading */}
                    <div className="w-8 h-[2px] bg-gold/30 group-hover:w-16 group-hover:bg-gold transition-all duration-500"></div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light font-sans">
                    {adv.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </section>

    </div>
  );
}
