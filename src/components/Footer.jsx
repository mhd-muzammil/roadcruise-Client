import React from "react";
import { Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer id="contact" className="bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-white/5 py-16 text-xs text-zinc-600 dark:text-zinc-400 transition-colors duration-300">
      {/* Four link sections: Explore | Company | Partner With Us | Get in Touch */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">

        {/* Section 1: Navigation Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Explore</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
            <li><Link to="/vehicles" className="hover:text-gold transition-colors">Premium Vehicles</Link></li>
            <li><Link to="/tours-travels" className="hover:text-gold transition-colors">Tours & Travels</Link></li>
            <li><Link to="/gallery" className="hover:text-gold transition-colors">Gallery</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Section 2: Legal & Support */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Company</h4>
          <ul className="space-y-2">
            <li><Link to="/blog" className="hover:text-gold transition-colors">Travel Blog & Guides</Link></li>
            <li><Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
            <li><Link to="/refund" className="hover:text-gold transition-colors">Refund Policy</Link></li>
            <li><Link to="/faqs" className="hover:text-gold transition-colors">FAQs</Link></li>
          </ul>
        </div>

        {/* Section 3: Partner call-to-actions (emphasized, Taxida-style) */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Partner With Us</h4>
          <ul className="space-y-4">
            <li>
              <Link
                to="/become-operator"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white hover:text-gold dark:hover:text-gold transition-colors border-b border-gold/50 pb-0.5"
              >
                Become an Operator
                <ChevronRight className="w-4 h-4 text-gold group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </li>
            <li>
              <Link
                to="/business"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white hover:text-gold dark:hover:text-gold transition-colors border-b border-gold/50 pb-0.5"
              >
                Business with Road Cruise
                <ChevronRight className="w-4 h-4 text-gold group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </li>
          </ul>
          <p className="leading-relaxed text-zinc-500 dark:text-zinc-500 font-light pr-4">
            Attach your cab or fleet, or set up corporate travel for your company — send us an enquiry.
          </p>
        </div>

        {/* Section 4: Contact details */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold font-serif text-zinc-900 dark:text-white tracking-wide">Get in Touch</h4>
          <div className="space-y-3">
            <a href="tel:+917338899062" className="flex items-center gap-2.5 hover:text-gold transition-colors w-max">
              <Phone className="w-4 h-4 text-gold" />
              <span>+91 73388 99062</span>
            </a>
            <a href="tel:+917338899063" className="flex items-center gap-2.5 hover:text-gold transition-colors w-max">
              <Phone className="w-4 h-4 text-gold" />
              <span>+91 73388 99063</span>
            </a>
            <a href="tel:+914435510154" className="flex items-center gap-2.5 hover:text-gold transition-colors w-max">
              <Phone className="w-4 h-4 text-gold" />
              <span>Connect Your Cab With Us: 044-35510154</span>
            </a>
            <a href="mailto:info@roadcruise.in" className="flex items-center gap-2.5 hover:text-gold transition-colors w-max">
              <Mail className="w-4 h-4 text-gold" />
              <span>info@roadcruise.in</span>
            </a>
            <div className="flex items-start gap-2.5 leading-relaxed text-zinc-500 dark:text-zinc-500">
              <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              <span>Chennai, Tamil Nadu, India</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar: brand + copyright + socials (Taxida-style logo row) */}
      <div className="max-w-7xl mx-auto px-6 border-t border-zinc-200 dark:border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand: logo + company name, with the certification under the name. */}
        <Link to="/" aria-label="Road Cruise — home" className="group flex items-center gap-3">
          <img
            src="/logo-nav.webp"
            alt=""
            width="380"
            height="165"
            loading="lazy"
            className="h-12 w-auto object-contain rounded-lg shadow-sm"
          />
          <span className="flex flex-col gap-1">
            <span className="font-serif text-lg font-bold tracking-widest text-zinc-900 dark:text-white group-hover:text-gold transition-colors">
              ROAD CRUISE
            </span>
            <span className="text-[10px] uppercase text-gold font-bold tracking-widest">
              ISO 9001:2015 Certified
            </span>
          </span>
        </Link>
        <p className="text-zinc-500 dark:text-zinc-600 text-center">
          © {new Date().getFullYear()} Road Cruise. All rights reserved.
        </p>
        <div className="flex gap-4 text-zinc-500 dark:text-zinc-600">
          <span className="hover:text-gold transition-colors cursor-pointer">Facebook</span>
          <span className="hover:text-gold transition-colors cursor-pointer">Instagram</span>
          <span className="hover:text-gold transition-colors cursor-pointer">Twitter</span>
        </div>
      </div>
    </footer>
  );
}
