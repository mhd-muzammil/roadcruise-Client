import React, { useState } from "react";
import Packages from "../components/Packages";
import Destinations from "../components/Destinations";

export default function ToursTravels({ onBookNowClick }) {
  const [activeTab, setActiveTab] = useState("packages"); // "packages" | "destinations"

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Page Header with Video Background */}
      <div className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden border-b border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-950">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-zinc-100/70 via-zinc-50/95 to-white dark:from-zinc-900/30 dark:via-zinc-950/95 dark:to-zinc-950 z-10 transition-colors duration-300"></div>

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
              src="https://www.pexels.com/download/video/33193321/" 
              type="video/mp4" 
            />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 text-center space-y-4 w-full">
          <h1 className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">Tours & Travels</h1>
          <p className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
            Crafting Extraordinary Journeys
          </p>
          <p className="text-sm max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
            Explore our curated holiday packages or select beautiful travel destinations for your next premium getaway.
          </p>

          {/* Sleek Tab Menu */}
          <div className="flex items-center justify-center mt-8">
            <div className="p-1.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex gap-1 shadow-inner">
              <button
                onClick={() => setActiveTab("packages")}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === "packages"
                    ? "bg-gold text-zinc-950 font-bold shadow-md"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Packages
              </button>
              <button
                onClick={() => setActiveTab("destinations")}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === "destinations"
                    ? "bg-gold text-zinc-950 font-bold shadow-md"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Destinations
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render Component based on Active Tab */}
      <div className="transition-all duration-500 ease-in-out">
        {activeTab === "packages" && (
          <div className="animate-fade-in">
            <Packages onBookNowClick={onBookNowClick} />
          </div>
        )}
        {activeTab === "destinations" && (
          <div className="animate-fade-in">
            <Destinations />
          </div>
        )}
      </div>
    </div>
  );
}
