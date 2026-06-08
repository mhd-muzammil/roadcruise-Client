import React, { useState } from "react";
import { Star } from "lucide-react";

const REVIEWS = [
  {
    name: "Arvind Kumar",
    role: "Corporate Executive",
    stars: 5,
    text: "The Mercedes E-Class was impeccable. The driver was extremely professional, knew the routes perfectly, and made our executive business tour in Chennai completely hassle-free."
  },
  {
    name: "Priya Menon",
    role: "Family Traveller",
    stars: 5,
    text: "Booked Kodaikanal package for family. Transparent pricing, excellent hotels, and hassle-free transit. The booking process was very smooth and transparent."
  },
  {
    name: "Rakesh Iyer",
    role: "Regular Tourist",
    stars: 5,
    text: "Extremely clean Innova Crysta. Very neat driver with proper uniform and tracking setup. Road Cruise definitely makes every journey feel like a true cruise."
  },
  {
    name: "Divya Shankar",
    role: "Business Owner",
    stars: 5,
    text: "Amazing support desk. We needed to extend our Ooty tour by a day at midnight, and it was handled in minutes. The customer support is top-notch."
  }
];

export default function Reviews() {
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  return (
    <section className="py-24 relative overflow-hidden bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-1 bg-gold/10 border border-gold/30 px-4 py-1.5 rounded-full">
            <span className="text-[10px] font-bold tracking-widest text-gold uppercase">Google Reviews</span>
            <span className="text-[10px] text-zinc-400">·</span>
            <div className="flex items-center text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-current" />
              ))}
            </div>
            <span className="text-[10px] font-bold text-white ml-1">4.9 ★ Rating</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
            Heard from our travellers.
          </h2>
        </div>

        {/* Sliding reviews wrapper */}
        <div className="mt-12 relative overflow-hidden p-8 rounded-2xl glass border border-white/5">
          <div className="space-y-6 text-center">
            <p className="text-base md:text-lg italic font-light text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              "{REVIEWS[activeReviewIndex].text}"
            </p>
            
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">
                {REVIEWS[activeReviewIndex].name}
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                {REVIEWS[activeReviewIndex].role}
              </p>
            </div>
          </div>

          {/* Slider Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {REVIEWS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveReviewIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  activeReviewIndex === idx ? "bg-gold scale-110" : "bg-white/10 hover:bg-white/30"
                }`}
                aria-label={`Go to review slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
