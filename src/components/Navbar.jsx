import React, { useState, useEffect } from "react";
import { Compass, Phone, Menu, X } from "lucide-react";

export default function Navbar({ onBookNowClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "glass border-b border-white/5 py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center bg-gold/5 group-hover:border-gold transition-all duration-300">
            <Compass className="w-5 h-5 text-gold group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-widest text-white group-hover:text-gold transition-colors duration-300">
              ROAD CRUISE
            </span>
            <span className="block text-[8px] tracking-[0.25em] text-zinc-400 -mt-1 uppercase">
              Premium Journeys
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          <a href="#fleet" className="text-zinc-300 hover:text-gold transition-colors">Fleet</a>
          <a href="#destinations" className="text-zinc-300 hover:text-gold transition-colors">Destinations</a>
          <a href="#packages" className="text-zinc-300 hover:text-gold transition-colors">Packages</a>
          <a href="#stories" className="text-zinc-300 hover:text-gold transition-colors">Stories</a>
          <a href="#about" className="text-zinc-300 hover:text-gold transition-colors">About</a>
        </nav>

        {/* Book Now Button */}
        <div className="hidden md:flex items-center gap-4">
          <a 
            href="tel:+919800000000" 
            className="flex items-center gap-2 text-zinc-400 hover:text-gold text-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>+91 98000 00000</span>
          </a>
          <button
            onClick={() => onBookNowClick("General Query", "general")}
            className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-transparent border border-gold text-gold hover:bg-gold hover:text-zinc-950 active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            Book Now
          </button>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-300 hover:text-gold transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[73px] bg-zinc-950/95 border-b border-white/5 backdrop-blur-xl py-6 px-6 animate-fade-in flex flex-col gap-5 shadow-2xl">
          <a 
            href="#fleet" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium text-zinc-300 hover:text-gold transition-colors"
          >
            Fleet
          </a>
          <a 
            href="#destinations" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium text-zinc-300 hover:text-gold transition-colors"
          >
            Destinations
          </a>
          <a 
            href="#packages" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium text-zinc-300 hover:text-gold transition-colors"
          >
            Packages
          </a>
          <a 
            href="#stories" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium text-zinc-300 hover:text-gold transition-colors"
          >
            Stories
          </a>
          <a 
            href="#about" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium text-zinc-300 hover:text-gold transition-colors"
          >
            About
          </a>
          <div className="h-[1px] bg-white/5 my-2"></div>
          <div className="flex items-center justify-between">
            <a 
              href="tel:+919800000000" 
              className="flex items-center gap-2 text-zinc-400 hover:text-gold text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>+91 98000 00000</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookNowClick("General Query", "general");
              }}
              className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gold text-zinc-950 hover:bg-gold-hover transition-all"
            >
              Book Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
