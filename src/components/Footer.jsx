import React from "react";
import { Compass, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-white/5 py-16 text-xs text-zinc-600 dark:text-zinc-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Column 1: Brand details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-gold" />
            <span className="font-serif text-lg font-bold tracking-widest text-zinc-900 dark:text-white">
              ROAD CRUISE
            </span>
          </div>
          <p className="leading-relaxed text-zinc-500 dark:text-zinc-500 font-light pr-4">
            Premium rental vehicles and curated holiday tour packages across South India. Driven by professionals, designed for cruises.
          </p>
          <div className="text-[10px] uppercase text-gold font-bold tracking-widest">
            ISO 9001:2015 Certified
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Explore</h4>
          <ul className="space-y-2">
            <li><a href="#home" className="hover:text-gold transition-colors">Home / Booking</a></li>
            <li><a href="#fleet" className="hover:text-gold transition-colors">Premium Fleet</a></li>
            <li><a href="#destinations" className="hover:text-gold transition-colors">Destinations</a></li>
            <li><a href="#packages" className="hover:text-gold transition-colors">Featured Packages</a></li>
            <li><a href="#stories" className="hover:text-gold transition-colors">Travel Stories</a></li>
          </ul>
        </div>

        {/* Column 3: Legal & Support */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Company</h4>
          <ul className="space-y-2">
            <li><a href="#about" className="hover:text-gold transition-colors">About Us</a></li>
            <li><a href="#home" className="hover:text-gold transition-colors">Terms of Service</a></li>
            <li><a href="#home" className="hover:text-gold transition-colors">Privacy Policy</a></li>
            <li><a href="#home" className="hover:text-gold transition-colors">Refund Policy</a></li>
            <li><a href="#home" className="hover:text-gold transition-colors">FAQs</a></li>
          </ul>
        </div>

        {/* Column 4: Contact details */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Get in Touch</h4>
          <div className="space-y-3">
            <a href="tel:+919800000000" className="flex items-center gap-2.5 hover:text-gold transition-colors w-max">
              <Phone className="w-4 h-4 text-gold" />
              <span>+91 98000 00000</span>
            </a>
            <a href="mailto:hello@roadcruise.in" className="flex items-center gap-2.5 hover:text-gold transition-colors w-max">
              <Mail className="w-4 h-4 text-gold" />
              <span>hello@roadcruise.in</span>
            </a>
            <div className="flex items-start gap-2.5 leading-relaxed text-zinc-500 dark:text-zinc-500">
              <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
              <span>Chennai, Tamil Nadu, India</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Credits */}
      <div className="max-w-7xl mx-auto px-6 border-t border-zinc-200 dark:border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-zinc-500 dark:text-zinc-600 gap-4">
        <p>© {new Date().getFullYear()} Road Cruise. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="hover:text-gold transition-colors cursor-pointer">Facebook</span>
          <span className="hover:text-gold transition-colors cursor-pointer">Instagram</span>
          <span className="hover:text-gold transition-colors cursor-pointer">Twitter</span>
        </div>
      </div>
    </footer>
  );
}
