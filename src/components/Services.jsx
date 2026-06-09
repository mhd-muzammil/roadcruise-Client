import React from "react";
import { Milestone, Clock, Palmtree, Users, ArrowRight } from "lucide-react";

const SERVICES_DATA = [
  {
    id: "outstation",
    title: "Outstation Journeys",
    subtitle: "Explore Beyond Boundaries",
    description: "Travel anywhere in South India with certified professional drivers. Safe, sanitized, GPS-tracked premium sedans & SUVs.",
    price: "₹14/km onwards",
    icon: Milestone,
    actionLabel: "Book Rental",
    exploreLink: "#vehicles",
    type: "vehicle",
    presetName: "Sedan (Dzire, Aura, Amaze)"
  },
  {
    id: "local",
    title: "Local City Packages",
    subtitle: "Hourly Flexible Commutes",
    description: "Ideal for weddings, corporate meets, airport drop-offs, or shopping sprees. Choose convenient 4h, 8h, or 12h rental packages.",
    price: "₹1,250 onwards",
    icon: Clock,
    actionLabel: "Book Hourly",
    exploreLink: "#vehicles",
    type: "vehicle",
    presetName: "Sedan (Dzire, Aura, Amaze)"
  },
  {
    id: "tours",
    title: "Curated Holiday Tours",
    subtitle: "All-Inclusive Gateways",
    description: "Bespoke tour packages to Ooty, Kodaikanal, and Kerala backwaters. Includes private transport, 4★ stays, breakfast, and sightseeing.",
    price: "₹4,999/Person onwards",
    icon: Palmtree,
    actionLabel: "Book Package",
    exploreLink: "#packages",
    type: "package",
    presetName: "Kodaikanal Premium Package"
  },
  {
    id: "groups",
    title: "Group Event Fleet",
    subtitle: "Luxury Charters & Coaches",
    description: "Spacious luxury travel. Rent high-end Urbania coaches, spacious Tempo Travellers, or premium buses for corporate and family groups.",
    price: "GPS & AC Enabled",
    icon: Users,
    actionLabel: "Book Coach",
    exploreLink: "#vehicles",
    type: "vehicle",
    presetName: "Urbania 12+1"
  }
];

export default function Services({ onBookNowClick }) {
  return (
    <section id="services" className="py-24 bg-zinc-50 dark:bg-bg-dark relative overflow-hidden transition-colors duration-300">
      
      {/* Background cinematic ambient lighting (pulsing orbs) */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-gold/5 to-amber-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-gold/5 to-amber-400/5 blur-[140px] rounded-full pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 bg-gold/15 border border-gold/30 rounded-full animate-pulse">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase text-glow-gold">What We Offer</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
            Services Crafted for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold-dark italic font-normal text-glow-gold">
              Ultimate Journey
            </span>
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
            From quick city drops to curated luxury escapes, we provide premium vehicles driven by certified professionals to make every trip feel like a cruise.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES_DATA.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between p-8 rounded-3xl glass-premium hover:border-gold/40 hover:scale-[1.03] hover:-translate-y-1 shadow-2xl hover:shadow-gold/5 transition-all duration-500 bg-white/40 dark:bg-zinc-900/10"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Ambient interior card glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500 pointer-events-none"></div>

                {/* Golden top highlight line on hover */}
                <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-gold/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="space-y-6 relative z-10">
                  {/* Icon Wrapper */}
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center border border-zinc-200 dark:border-white/10 group-hover:border-gold/50 group-hover:bg-gold/15 text-zinc-700 dark:text-zinc-300 group-hover:text-gold group-hover:shadow-lg group-hover:shadow-gold/10 transition-all duration-300 shadow-inner">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white group-hover:text-gold transition-colors tracking-wide">
                      {service.title}
                    </h3>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-1 font-semibold">
                      {service.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Price & CTA Action footer */}
                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-white/5 space-y-4 relative z-10">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">Price Rate</span>
                    <span className="text-sm font-serif font-bold text-gold text-glow-gold">{service.price}</span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => onBookNowClick(service.presetName, service.type)}
                      className="w-full py-3 bg-zinc-950 hover:bg-gold dark:bg-white/5 dark:hover:bg-gold text-white hover:text-zinc-950 dark:text-white dark:hover:text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-gold/15 active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-md shadow-black/5 dark:shadow-none"
                    >
                      {service.actionLabel}
                    </button>
                    
                    <a
                      href={service.exploreLink}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-gold dark:hover:text-gold uppercase tracking-wider pl-1.5 transition-colors"
                    >
                      <span>Explore Options</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
