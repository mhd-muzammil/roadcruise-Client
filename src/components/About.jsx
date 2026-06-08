import React from "react";

const ADVANTAGES = [
  {
    title: "Premium Rental Services",
    desc: "A handpicked selection of top-tier vehicles tailored for corporate, family, and luxury travel."
  },
  {
    title: "Safe & Verified Vehicles",
    desc: "GPS tracking, speed limiters, speed governors, and verified professional chauffeurs."
  },
  {
    title: "Wide Destination Coverage",
    desc: "Curated packages across South India's premium hills, beaches, and heritage locations."
  },
  {
    title: "Affordable Pricing",
    desc: "Transparent rates per kilometer with no hidden fees, dynamic surcharges, or surprises."
  },
  {
    title: "Trusted Customer Reviews",
    desc: "Over 10,000+ satisfied travellers scoring us consistently at 4.9 out of 5 stars."
  },
  {
    title: "Government Recognized",
    desc: "Officially recognized by the Ministry of Tourism, Government of India."
  },
  {
    title: "24/7 Customer Support",
    desc: "Dedicated travel support desk available round-the-clock for route changes and emergencies."
  },
  {
    title: "Instant Invoice Download",
    desc: "Fast, automated corporate and personal invoicing generated right after journey closure."
  }
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-zinc-100/50 dark:bg-zinc-950/60 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">Why Road Cruise</h2>
          <p className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 dark:text-white">
            Eight reasons travellers choose us.
          </p>
        </div>

        {/* Grid Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {ADVANTAGES.map((adv, idx) => (
            <div 
              key={adv.title}
              className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 hover:border-gold/20 transition-all hover:scale-[1.01] flex flex-col justify-between shadow-sm dark:shadow-none"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-sm font-serif font-bold text-gold">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white tracking-wide">
                  {adv.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                  {adv.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
