import React, { useState, useEffect } from "react";
import { Compass, Phone, Menu, X, Sun, Moon } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar({ onBookNowClick, isDarkMode, onThemeToggle, currentUser, onAuthClick, onLogout }) {
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
        scrolled 
          ? "bg-white/80 dark:bg-zinc-950/75 backdrop-blur-md border-b border-zinc-200 dark:border-white/5 py-4" 
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center bg-gold/5 group-hover:border-gold transition-all duration-300">
            <Compass className="w-5 h-5 text-gold group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-widest text-zinc-900 dark:text-white group-hover:text-gold transition-colors duration-300">
              ROAD CRUISE
            </span>
            <span className="block text-[8px] tracking-[0.25em] text-zinc-500 dark:text-zinc-400 -mt-1 uppercase">
              Premium Journeys
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={({ isActive }) => `text-sm font-medium tracking-wide cursor-pointer transition-colors ${isActive ? "text-gold font-semibold" : "text-zinc-600 dark:text-zinc-300 hover:text-gold"}`} end>Home</NavLink>
          <NavLink to="/about" className={({ isActive }) => `text-sm font-medium tracking-wide cursor-pointer transition-colors ${isActive ? "text-gold font-semibold" : "text-zinc-600 dark:text-zinc-300 hover:text-gold"}`}>About</NavLink>
          <NavLink to="/vehicles" className={({ isActive }) => `text-sm font-medium tracking-wide cursor-pointer transition-colors ${isActive ? "text-gold font-semibold" : "text-zinc-600 dark:text-zinc-300 hover:text-gold"}`}>Vehicles</NavLink>
          <NavLink to="/tours-travels" className={({ isActive }) => `text-sm font-medium tracking-wide cursor-pointer transition-colors ${isActive ? "text-gold font-semibold" : "text-zinc-600 dark:text-zinc-300 hover:text-gold"}`}>Tours & Travels</NavLink>
          <NavLink to="/blog" className={({ isActive }) => `text-sm font-medium tracking-wide cursor-pointer transition-colors ${isActive ? "text-gold font-semibold" : "text-zinc-600 dark:text-zinc-300 hover:text-gold"}`}>Blog</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `text-sm font-medium tracking-wide cursor-pointer transition-colors ${isActive ? "text-gold font-semibold" : "text-zinc-600 dark:text-zinc-300 hover:text-gold"}`}>Contact</NavLink>
        </nav>

        {/* Action controls */}
        <div className="hidden md:flex items-center gap-4">
          <a 
            href="tel:+917338899062"
            className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-gold text-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>+91 73388 99062</span>
          </a>
          
          {currentUser ? (
            <div className="relative group/user font-sans">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-xs font-semibold hover:border-gold transition-all cursor-pointer">
                <div className="w-5 h-5 rounded-full bg-gold text-zinc-950 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name[0].toUpperCase()}
                </div>
                <span className="text-zinc-900 dark:text-white max-w-[80px] truncate">{currentUser.name}</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 shadow-2xl p-1.5 hidden group-hover/user:block hover:block animate-fade-in z-50">
                <div className="px-3 py-1.5 border-b border-zinc-150 dark:border-white/5 mb-1">
                  <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Account</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-200 truncate mt-0.5">{currentUser.email}</p>
                </div>
                <Link
                  to="/my-bookings"
                  className="w-full block text-left px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-gold/10 hover:text-gold rounded-lg transition-colors"
                >
                  My Bookings
                </Link>
                {(currentUser.role === "admin" || currentUser.email === "admin@roadcruise.com") && (
                  <Link
                    to="/admin"
                    className="w-full block text-left px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10 rounded-lg transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-gold hover:border-gold border border-zinc-200 dark:border-white/10 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => onBookNowClick("General Query", "general")}
            className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-transparent border border-gold text-gold hover:bg-gold hover:text-zinc-950 active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            Book Now
          </button>
        </div>

        {/* Mobile Menu Trigger & Theme switch */}
        <div className="flex md:hidden items-center gap-2">
          {/* Theme Switcher for Mobile (On Hold)
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-full border border-zinc-200 dark:border-white/10 hover:border-gold/50 text-zinc-600 dark:text-zinc-400 hover:text-gold bg-zinc-100 dark:bg-white/5 active:scale-95 transition-all"
            aria-label="Toggle theme mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          */}
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-gold transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[73px] bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200 dark:border-white/5 backdrop-blur-xl py-6 px-6 animate-fade-in flex flex-col gap-5 shadow-2xl">
          <NavLink 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `text-lg font-medium transition-colors cursor-pointer ${isActive ? "text-gold font-bold" : "text-zinc-700 dark:text-zinc-300 hover:text-gold"}`}
            end
          >
            Home
          </NavLink>
          <NavLink 
            to="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `text-lg font-medium transition-colors cursor-pointer ${isActive ? "text-gold font-bold" : "text-zinc-700 dark:text-zinc-300 hover:text-gold"}`}
          >
            About
          </NavLink>
          <NavLink 
            to="/vehicles" 
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `text-lg font-medium transition-colors cursor-pointer ${isActive ? "text-gold font-bold" : "text-zinc-700 dark:text-zinc-300 hover:text-gold"}`}
          >
            Vehicles
          </NavLink>
          <NavLink 
            to="/tours-travels" 
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `text-lg font-medium transition-colors cursor-pointer ${isActive ? "text-gold font-bold" : "text-zinc-700 dark:text-zinc-300 hover:text-gold"}`}
          >
            Tours & Travels
          </NavLink>
          <NavLink 
            to="/blog" 
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `text-lg font-medium transition-colors cursor-pointer ${isActive ? "text-gold font-bold" : "text-zinc-700 dark:text-zinc-300 hover:text-gold"}`}
          >
            Blog
          </NavLink>
          <NavLink 
            to="/contact" 
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `text-lg font-medium transition-colors cursor-pointer ${isActive ? "text-gold font-bold" : "text-zinc-700 dark:text-zinc-300 hover:text-gold"}`}
          >
            Contact
          </NavLink>
          <div className="h-[1px] bg-zinc-200 dark:bg-white/5 my-2"></div>
          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-white/5 rounded-xl text-left">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gold text-zinc-950 flex items-center justify-center font-bold text-xs">
                    {currentUser.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{currentUser.name}</p>
                    <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold transition-all"
                >
                  Logout
                </button>
              </div>
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-2 bg-zinc-100 dark:bg-white/5 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 rounded-xl text-xs font-bold hover:border-gold hover:text-gold transition-all uppercase tracking-wider"
              >
                My Bookings
              </Link>
              {(currentUser.role === "admin" || currentUser.email === "admin@roadcruise.com") && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-2 bg-gold/15 text-gold border border-gold/30 rounded-xl text-xs font-bold hover:bg-gold hover:text-zinc-950 transition-all uppercase tracking-wider"
                >
                  Go to Admin Panel
                </Link>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onAuthClick();
              }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-white/5 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 active:scale-95 transition-all text-center"
            >
              Sign In / Sign Up
            </button>
          )}

          <div className="flex items-center justify-between">
            <a 
              href="tel:+917338899062"
              className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-gold text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>+91 73388 99062</span>
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
