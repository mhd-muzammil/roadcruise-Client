import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Enquiry",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all required fields.");
      return;
    }
    // Simulate API request
    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "General Enquiry",
      message: ""
    });
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Header */}
      <div className="py-12 border-b border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <h1 className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">Contact Us</h1>
          <p className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
            We'd Love to Hear From You
          </p>
          <p className="text-sm max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
            Have questions about our rental packages or need a custom quote? Reach out to our 24/7 concierge team today.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Contact Details & Info (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white">Our Offices</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
              Our travel specialists are standing by. Choose the most convenient way to reach us or drop by our main office.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            
            {/* Phone */}
            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 text-gold">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Phone</h3>
                <a href="tel:+919800000000" className="block text-base font-bold text-zinc-900 dark:text-white hover:text-gold transition-colors">
                  +91 98000 00000
                </a>
                <p className="text-[11px] text-zinc-500">Toll-free 24/7 client helpline</p>
              </div>
            </div>

            {/* Email */}
            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 text-gold">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Email</h3>
                <a href="mailto:hello@roadcruise.in" className="block text-base font-bold text-zinc-900 dark:text-white hover:text-gold transition-colors">
                  hello@roadcruise.in
                </a>
                <p className="text-[11px] text-zinc-500">Corporate enquiries & support</p>
              </div>
            </div>

            {/* Address */}
            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 text-gold">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Address</h3>
                <p className="text-sm font-medium text-zinc-900 dark:text-white leading-relaxed">
                  Chennai, Tamil Nadu, India
                </p>
                <p className="text-[11px] text-zinc-500">Main hub & vehicle yard</p>
              </div>
            </div>

            {/* Hours */}
            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 text-gold">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Business Hours</h3>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  Always Open (24/7/365)
                </p>
                <p className="text-[11px] text-zinc-500">Including holidays & weekends</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Contact Form & Map (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Submission Form */}
          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none space-y-6">
            <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white">Send Message</h2>
            
            {submitted ? (
              <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 flex items-center gap-3 animate-fade-in">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">Thank You!</h3>
                  <p className="text-xs font-light">Your enquiry was submitted successfully. Our team will contact you shortly.</p>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Your Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Your Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold transition-all cursor-pointer"
                  >
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Vehicle Booking">Vehicle Booking</option>
                    <option value="Tour Package Enquiry">Tour Package Enquiry</option>
                    <option value="Corporate Booking">Corporate Booking</option>
                    <option value="Feedback">Feedback</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Your Message *</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold transition-all resize-none"
                  placeholder="Enter message description..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gold text-zinc-950 hover:bg-gold-hover text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-gold/15 active:scale-[0.99]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Message</span>
              </button>
            </form>
          </div>

          {/* Google Maps Embed Mock / Representation */}
          <div className="h-64 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/5 relative bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
            <div className="relative text-center space-y-2 max-w-xs">
              <MapPin className="w-8 h-8 text-gold mx-auto" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Road Cruise Central Hub</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Chennai, Tamil Nadu, India. Serving clients throughout South India.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
