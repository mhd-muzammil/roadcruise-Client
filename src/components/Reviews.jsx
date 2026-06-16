import React, { useState, useEffect } from "react";
import { Star, Quote, Check } from "lucide-react";

const REVIEWS = [
  {
    name: "Arvind Kumar",
    role: "Corporate Executive",
    stars: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    text: "The Mercedes E-Class was impeccable. The driver was extremely professional, knew the routes perfectly, and made our executive business tour in Chennai completely hassle-free."
  },
  {
    name: "Priya Menon",
    role: "Family Traveller",
    stars: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    text: "Booked Kodaikanal package for family. Transparent pricing, excellent hotels, and hassle-free transit. The booking process was very smooth and transparent."
  },
  {
    name: "Rakesh Iyer",
    role: "Regular Tourist",
    stars: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    text: "Extremely clean Innova Crysta. Very neat driver with proper uniform and tracking setup. Road Cruise definitely makes every journey feel like a true cruise."
  },
  {
    name: "Divya Shankar",
    role: "Business Owner",
    stars: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    text: "Amazing support desk. We needed to extend our Ooty tour by a day at midnight, and it was handled in minutes. The customer support is top-notch."
  }
];

export default function Reviews() {
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Auto-play interval
  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => {
    setIsFading(true);
    setTimeout(() => {
      setActiveReviewIndex((prev) => (prev + 1) % REVIEWS.length);
      setIsFading(false);
    }, 300);
  };

  const handleDotClick = (idx) => {
    setIsFading(true);
    setTimeout(() => {
      setActiveReviewIndex(idx);
      setIsFading(false);
    }, 300);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Decorative Blur Background Element */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-5 max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 px-4 py-1.5 rounded-full">
            {/* Google Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span className="text-[10px] font-bold tracking-widest text-gold uppercase">Google Reviews</span>
            <span className="text-[10px] text-zinc-400">·</span>
            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">4.9 ★ Rating</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
            Heard from our <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold italic font-normal text-glow-gold">travellers.</span>
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-md mx-auto">
            Read stories of comfort, luxury, and reliability shared by our premium clients.
          </p>
        </div>

        {/* Sliding reviews Card */}
        <div className="relative overflow-hidden p-8 md:p-12 rounded-3xl bg-white dark:bg-zinc-900/35 border border-zinc-200 dark:border-white/5 shadow-xl backdrop-blur-md max-w-4xl mx-auto">
          {/* Quote Accent Icon */}
          <Quote className="absolute top-6 left-6 w-16 h-16 text-gold/5 dark:text-gold/10 transform rotate-180 pointer-events-none" />

          {/* Slide Content with transition */}
          <div className={`transition-all duration-300 ease-in-out ${isFading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            <div className="space-y-8 text-center flex flex-col items-center">
              
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-gold">
                {[...Array(REVIEWS[activeReviewIndex].stars)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current text-glow-gold" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-lg md:text-xl italic font-light text-zinc-800 dark:text-zinc-200 leading-relaxed max-w-3xl font-serif">
                "{REVIEWS[activeReviewIndex].text}"
              </p>
              
              {/* Reviewer Details */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <img 
                    src={REVIEWS[activeReviewIndex].avatar} 
                    alt={REVIEWS[activeReviewIndex].name} 
                    className="w-14 h-14 rounded-full border-2 border-gold/30 object-cover shadow-md"
                  />
                  {/* Verified Check Badge */}
                  <span className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border border-white dark:border-zinc-900">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>

                <div className="text-center">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white tracking-wide">
                    {REVIEWS[activeReviewIndex].name}
                  </h4>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {REVIEWS[activeReviewIndex].role}
                    </p>
                    <span className="text-[10px] text-zinc-300 dark:text-zinc-600">•</span>
                    <span className="text-[10px] font-semibold text-gold tracking-wider uppercase">Verified Customer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Dots */}
          <div className="flex items-center justify-center gap-2.5 mt-10">
            {REVIEWS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`transition-all duration-300 cursor-pointer rounded-full ${
                  activeReviewIndex === idx 
                    ? "w-8 h-2.5 bg-gold" 
                    : "w-2.5 h-2.5 bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/30"
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
