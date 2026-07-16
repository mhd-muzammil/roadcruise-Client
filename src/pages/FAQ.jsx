import React, { useState } from "react";
import { ChevronDown, MessageCircle, Phone } from "lucide-react";
import useDocumentMeta from "../hooks/useDocumentMeta";

const FAQS = [
  {
    q: "How do I book a vehicle or tour package?",
    a: "Browse our Vehicles or Tours & Travels pages and click “Book Now”. Fill in your trip details — pickup/drop, dates, passengers — and choose to pay securely online or reserve and pay on arrival. You'll get an instant confirmation by email.",
  },
  {
    q: "Is the fare shown final?",
    a: "The price shown is an indicative estimate. The final fare depends on distance, duration, tolls, permits and your specific requirements. Our team confirms the exact fare before your trip.",
  },
  {
    q: "What is included and excluded in the fare?",
    a: "Rates include the vehicle and a professional driver. Toll gate fees, parking, state entry taxes/permits, hill-station charges and driver night allowance (₹200–₹500 for 10 PM–5 AM driving) are charged separately unless a package states otherwise.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept cards, UPI and net banking through our secure payment gateway, plus pay-on-arrival for eligible bookings. We never store your card details.",
  },
  {
    q: "Can I cancel or reschedule my booking?",
    a: "Yes. Cancellations are refunded based on how early you cancel (see our Refund Policy). To reschedule, contact us as early as possible and we'll accommodate you subject to availability.",
  },
  {
    q: "Do you provide outstation and multi-day trips?",
    a: "Absolutely. We offer local (hourly), one-way drops, round trips, outstation journeys and multi-day tour packages across South India, with a range of vehicles from sedans to mini buses.",
  },
  {
    q: "Are your drivers verified?",
    a: "Yes. All our drivers are experienced, background-verified professionals, and our GPS-enabled vehicles are regularly cleaned and maintained.",
  },
  {
    q: "How will I receive my booking confirmation?",
    a: "You'll receive an email confirmation with your booking reference (e.g. RDZ001) as soon as your booking is placed, and another once payment is verified. Our team may also reach you on WhatsApp.",
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/5 overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
        aria-expanded={isOpen}
      >
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">{item.q}</h2>
        <ChevronDown className={`w-4 h-4 text-gold flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-light">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  useDocumentMeta({
    title: "FAQs – Booking, Fares & Cancellations | Road Cruise",
    description:
      "Answers on booking vehicles and tours, fare inclusions, tolls and permits, payments, cancellations and driver verification at Road Cruise.",
    canonical: "/faqs",
  });
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Header */}
      <div className="py-14 border-b border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase">Help Centre</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm max-w-xl mx-auto text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
            Everything you need to know about booking, fares, payments and travelling with Road Cruise.
          </p>
        </div>
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-3">
        {FAQS.map((item, i) => (
          <FaqItem key={i} item={item} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}

        {/* Still need help */}
        <div className="mt-10 p-6 rounded-2xl bg-gold/5 border border-gold/20 text-center space-y-3">
          <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">Still have questions?</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light">Our team is available 24/7 to help you plan the perfect trip.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a href="tel:+918886767467" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-gold-hover transition-all">
              <Phone className="w-3.5 h-3.5" /> Call Us
            </a>
            <a href="https://wa.me/918886767467" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider hover:border-gold hover:text-gold transition-all">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
