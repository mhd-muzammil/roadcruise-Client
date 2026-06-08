import React, { useState } from "react";
import Packages from "../components/Packages";
import Destinations from "../components/Destinations";

export default function ToursTravels({ onBookNowClick }) {
  const [activeTab, setActiveTab] = useState("packages"); // "packages" | "destinations"

  return (
    <div className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Page Header */}
      <div className="py-12 border-b border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
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
