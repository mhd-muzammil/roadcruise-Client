import React, { useState } from "react";
import Packages from "../components/Packages";
import Destinations from "../components/Destinations";
import useDocumentMeta from "../hooks/useDocumentMeta";

export default function ToursTravels({ onBookNowClick }) {
  const [activeTab, setActiveTab] = useState("packages"); // "packages" | "destinations"

  useDocumentMeta({
    title: "South India Tour Packages – Ooty, Kodaikanal | Road Cruise",
    description:
      "Holiday packages from ₹4,999 — Ooty, Kodaikanal, Coorg, Munnar & Kerala backwaters with private transport, 4-star stays, breakfast and sightseeing.",
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Page Header with Video Background */}
      <div className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden border-b border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-950">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-zinc-100/85 via-zinc-100/95 to-zinc-50 dark:from-zinc-950/80 dark:via-zinc-950/90 dark:to-zinc-950 z-10 transition-colors duration-300"></div>

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 cinematic-vignette z-15 pointer-events-none opacity-30 dark:opacity-90"></div>

        {/* Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-15 dark:opacity-100 transition-opacity duration-500"
          >
            <source 
              src="https://www.pexels.com/download/video/29626345/" 
              type="video/mp4" 
            />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 text-center space-y-6 w-full">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1 mb-2">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase">
              Tours & Travels
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold text-zinc-900 dark:text-white leading-tight tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            Crafting <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold italic font-normal text-glow-gold ml-0 sm:ml-2">
              Extraordinary Journeys
            </span>
          </h1>
          <p className="text-base md:text-lg max-w-3xl mx-auto text-zinc-700 dark:text-zinc-100 font-normal leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            Explore our curated holiday packages or select beautiful travel destinations for your next premium getaway.
          </p>

          {/* Sleek Tab Menu */}
          <div className="flex items-center justify-center mt-8">
            <div className="p-1.5 rounded-full bg-zinc-200/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-300/50 dark:border-white/10 flex gap-1 shadow-lg">
              <button
                onClick={() => setActiveTab("packages")}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === "packages"
                    ? "bg-gold text-zinc-950 font-bold shadow-md"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Packages
              </button>
              <button
                onClick={() => setActiveTab("destinations")}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === "destinations"
                    ? "bg-gold text-zinc-950 font-bold shadow-md"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Destinations
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Both tabs stay mounted so their content is always in the DOM for
          crawlers; the inactive one is hidden via CSS instead of unmounted. */}
      <div className="transition-all duration-500 ease-in-out">
        <div className={activeTab === "packages" ? "animate-fade-in" : "hidden"}>
          <Packages onBookNowClick={onBookNowClick} />
        </div>
        <div className={activeTab === "destinations" ? "animate-fade-in" : "hidden"}>
          <Destinations />
        </div>
      </div>
    </div>
  );
}
