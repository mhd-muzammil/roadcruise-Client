import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, MessageCircle, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { submitEnquiry } from "../utils/api";

const SUBJECTS = [
  "General Enquiry",
  "Vehicle Booking",
  "Tour Package Enquiry",
  "Corporate Booking",
  "Feedback",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "General Enquiry", message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Please tell us your name";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(formData.email.trim())) next.email = "Enter a valid email address";
    if (formData.phone && !/^\+?[0-9\s-]{10,14}$/.test(formData.phone.trim())) {
      next.phone = "Enter a valid phone number";
    }
    if (!formData.message.trim()) next.message = "Please enter your message";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setStatus("sending");
    try {
      await submitEnquiry(formData);
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "General Enquiry", message: "" });
      setTimeout(() => setStatus("idle"), 8000);
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again or call us.");
      setStatus("error");
    }
  };

  const inputCls = (hasError) =>
    `w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border ${
      hasError ? "border-red-500" : "border-zinc-200 dark:border-white/5"
    } text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold transition-all`;

  const CONTACT_CARDS = [
    {
      icon: Phone, label: "Phone", value: "+91 73388 99062", href: "tel:+917338899062",
      sub: "Also +91 73388 99063 · 24/7 helpline",
    },
    {
      icon: Mail, label: "Email", value: "info@roadcruise.in", href: "mailto:info@roadcruise.in",
      sub: "Enquiries & support",
    },
    {
      icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: "https://wa.me/917338899062",
      sub: "Fastest response",
    },
    {
      icon: MapPin, label: "Address", value: "Chennai, Tamil Nadu", href: null,
      sub: "Main hub & vehicle yard",
    },
  ];

  return (
    <div className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">

      {/* Header */}
      <div className="py-14 border-b border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase">Contact Us</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
            We'd Love to Hear From You
          </h1>
          <p className="text-sm max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
            Questions about our fleet or tour packages, or need a custom quote? Reach out to our concierge team — we typically reply within a few hours.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left: contact details */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white">Get in Touch</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
              Our travel specialists are standing by. Choose the most convenient way to reach us.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CONTACT_CARDS.map(({ icon: Icon, label, value, href, sub }) => {
              const inner = (
                <>
                  <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 text-gold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</h3>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-gold transition-colors truncate">{value}</p>
                    <p className="text-[11px] text-zinc-500">{sub}</p>
                  </div>
                </>
              );
              return href ? (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                   className="group p-5 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 hover:border-gold/40 flex gap-4 transition-all">
                  {inner}
                </a>
              ) : (
                <div key={label} className="group p-5 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex gap-4">
                  {inner}
                </div>
              );
            })}
          </div>

          {/* Business hours strip */}
          <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 text-gold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Business Hours</h3>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">Always Open — 24 / 7 / 365</p>
              <p className="text-[11px] text-zinc-500">Including holidays & weekends</p>
            </div>
          </div>

          {/* Map */}
          <div className="h-56 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/5 relative bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
            <div className="relative text-center space-y-2 max-w-xs">
              <MapPin className="w-8 h-8 text-gold mx-auto" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Road Cruise Central Hub</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Chennai, Tamil Nadu, India. Serving clients throughout South India.</p>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white">Send a Message</h2>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-gold" /> We never share your details
              </span>
            </div>

            {status === "success" && (
              <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 flex items-center gap-3 animate-fade-in">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">Message sent!</h3>
                  <p className="text-xs font-light">Thanks for reaching out — we've emailed you a confirmation and our team will respond shortly.</p>
                </div>
              </div>
            )}

            {status === "error" && serverError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-medium">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Your Name *</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                    className={inputCls(errors.name)} placeholder="Enter your name" />
                  {errors.name && <p className="text-red-500 text-[11px]">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Your Email *</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                    className={inputCls(errors.email)} placeholder="Enter your email" />
                  {errors.email && <p className="text-red-500 text-[11px]">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Your Phone</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                    className={inputCls(errors.phone)} placeholder="e.g. +91 98765 43210" />
                  {errors.phone && <p className="text-red-500 text-[11px]">{errors.phone}</p>}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Subject</label>
                  <select id="subject" name="subject" value={formData.subject} onChange={handleChange}
                    className={`${inputCls(false)} cursor-pointer`}>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Your Message *</label>
                <textarea id="message" name="message" rows="4" value={formData.message} onChange={handleChange}
                  className={`${inputCls(errors.message)} resize-none`} placeholder="Tell us about your trip, dates, group size, or any questions…" />
                {errors.message && <p className="text-red-500 text-[11px]">{errors.message}</p>}
              </div>

              <button type="submit" disabled={status === "sending"}
                className="w-full py-3.5 bg-gold text-zinc-950 hover:bg-gold-hover disabled:opacity-60 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-gold/15 active:scale-[0.99]">
                {status === "sending" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending…</span></>
                ) : (
                  <><Send className="w-3.5 h-3.5" /><span>Submit Message</span></>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
