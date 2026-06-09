import React, { useState } from "react";
import { Award, User, Phone, Calendar, Compass, CheckCircle } from "lucide-react";

export default function Hero({ onBookNowClick }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    service: "Sedan (Dzire, Aura, Amaze)"
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone required";
    } else if (!/^\+?[0-9\s-]{10,14}$/.test(formData.phone.trim())) {
      newErrors.phone = "Invalid number";
    }
    if (!formData.date) newErrors.date = "Date required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitted(true);
    }
  };

  return (
    <section id="home" className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-zinc-100/70 via-zinc-50/95 to-white dark:from-zinc-900/30 dark:via-zinc-950/95 dark:to-zinc-950 z-10 transition-colors duration-300"></div>
      
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 cinematic-vignette z-15 pointer-events-none opacity-30 dark:opacity-90"></div>

      {/* Background Video with Poster Fallback */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920"
          className="w-full h-full object-cover opacity-15 dark:opacity-100 transition-opacity duration-500"
        >
          <source 
            src="https://www.pexels.com/download/video/16268996/" 
            type="video/mp4" 
          />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-6 text-center space-y-8 mt-8">
        
        {/* Govt Recognition Badge */}
        <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 animate-pulse">
          <Award className="w-4 h-4 text-gold text-glow-gold" />
          <span className="text-[10px] tracking-[0.2em] font-semibold text-gold uppercase">
            Ministry of Tourism · Government of India
          </span>
        </div>

        {/* Main Tagline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
          Where every journey <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold italic font-normal text-glow-gold">
            feels like a cruise.
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
          Premium rental vehicles and curated tour packages across South India — driven by certified professionals, meticulously designed for the ultimate comfort of a true cruise.
        </p>

        {/* Premium Quick Booking Widget */}
        <div className="w-full max-w-4xl mx-auto mt-6 relative group/booking">
          {/* Animated glow border underneath card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-gold/30 to-gold-dark/30 rounded-3xl blur-xl opacity-20 group-hover/booking:opacity-45 transition duration-500 pointer-events-none"></div>

          <div className="glass-premium p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden bg-white/40 dark:bg-zinc-900/35">
            {/* Ambient shimmer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-white/5 pointer-events-none"></div>

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center text-center py-6 space-y-3 animate-fade-in relative z-10">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30 shadow-lg shadow-gold/10">
                  <CheckCircle className="w-6 h-6 text-gold animate-pulse" />
                </div>
                <h4 className="text-xl font-serif text-zinc-900 dark:text-white font-bold text-glow-gold">Reservation Request Received!</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
                  Thank you, <span className="text-zinc-900 dark:text-white font-semibold">{formData.name}</span>. 
                  Our luxury travel concierge has received your request for <strong>{formData.service}</strong> on <strong>{formData.date}</strong>. 
                  We will contact you at <span className="text-zinc-900 dark:text-white font-semibold">{formData.phone}</span> within 15 minutes!
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      phone: "",
                      date: "",
                      service: "Sedan (Dzire, Aura, Amaze)"
                    });
                  }}
                  className="mt-2 px-5 py-2 bg-gold hover:bg-gold-hover text-zinc-950 font-bold text-[10px] tracking-wider uppercase rounded-full transition-all cursor-pointer shadow-md shadow-gold/10 hover:shadow-lg"
                >
                  Book Another Journey
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  
                  {/* Name Input */}
                  <div className="md:col-span-3 text-left">
                    <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 pl-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 dark:text-zinc-500">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        className={`w-full bg-white/70 dark:bg-zinc-900/60 border ${
                          errors.name ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                        } focus:border-gold/60 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none rounded-xl py-3 pl-9 pr-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-[10px] mt-1 pl-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone Input */}
                  <div className="md:col-span-3 text-left">
                    <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 pl-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 dark:text-zinc-500">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 98765 43210"
                        className={`w-full bg-white/70 dark:bg-zinc-900/60 border ${
                          errors.phone ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                        } focus:border-gold/60 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none rounded-xl py-3 pl-9 pr-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-[10px] mt-1 pl-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Date Input */}
                  <div className="md:col-span-2 text-left">
                    <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 pl-1">
                      Travel Date
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 dark:text-zinc-500">
                        <Calendar className="w-4 h-4" />
                      </span>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className={`w-full bg-white/70 dark:bg-zinc-900/60 border ${
                          errors.date ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                        } focus:border-gold/60 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none rounded-xl py-3 pl-9 pr-3 text-xs text-zinc-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] transition-all`}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-red-500 text-[10px] mt-1 pl-1">{errors.date}</p>
                    )}
                  </div>

                  {/* Vehicle/Package Selector */}
                  <div className="md:col-span-2 text-left">
                    <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 pl-1">
                      Vehicle/Package
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 dark:text-zinc-500">
                        <Compass className="w-4 h-4" />
                      </span>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        className="w-full bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 focus:border-gold/60 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none rounded-xl py-3 pl-9 pr-4 text-xs text-zinc-900 dark:text-white appearance-none cursor-pointer transition-all"
                      >
                        <optgroup label="Premium Fleet" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
                          <option value="Sedan (Dzire, Aura, Amaze)">Sedan (Dzire, Aura, Amaze)</option>
                          <option value="Kia Carens">Kia Carens (SUV)</option>
                          <option value="Innova Crysta">Innova Crysta (SUV)</option>
                          <option value="Innova Hycross">Innova Hycross (SUV)</option>
                          <option value="Urbania 12+1">Urbania 12+1 (Luxury Van)</option>
                          <option value="Tempo Traveller 12 A/C">Tempo Traveller 12 A/C</option>
                          <option value="Tempo Traveller 18 A/C">Tempo Traveller 18 A/C</option>
                          <option value="Mini Bus 21 Seater">Mini Bus 21 Seater</option>
                          <option value="Mini Bus 32 Seater">Mini Bus 32 Seater</option>
                        </optgroup>
                        <optgroup label="Luxury Tour Packages" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
                          <option value="Kodaikanal Premium Package">Kodaikanal Premium Package</option>
                          <option value="Ooty Weekend Ride">Ooty Weekend Ride</option>
                          <option value="Kerala Backwaters Cruise">Kerala Backwaters Cruise</option>
                        </optgroup>
                      </select>
                      {/* Custom indicator arrow for select */}
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400 dark:text-zinc-500">
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="md:col-span-2 md:pt-[22px]">
                    <button
                      type="submit"
                      className="w-full bg-gold hover:bg-gold-hover text-zinc-950 font-bold h-[42px] rounded-xl text-xs tracking-wider uppercase shadow-md shadow-gold/15 hover:shadow-lg hover:shadow-gold/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center text-glow-gold"
                    >
                      Reserve Now
                    </button>
                  </div>

                </div>
              </form>
            )}
          </div>
        </div>

        {/* Alternative Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          <span className="hidden sm:inline">Or explore more:</span>
          <a href="#fleet" className="hover:text-gold transition-colors">View Fleet</a>
          <span className="text-zinc-300 dark:text-white/10">•</span>
          <a href="#packages" className="hover:text-gold transition-colors">Tour Packages</a>
          <span className="text-zinc-300 dark:text-white/10">•</span>
          <a href="#contact" className="hover:text-gold transition-colors">Contact Support</a>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-16 border-t border-zinc-200 dark:border-white/5">
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif font-bold text-gold text-glow-gold">Govt. Recognized</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 uppercase tracking-widest">Tourism Approved</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif font-bold text-gold text-glow-gold">ISO 9001:2015</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 uppercase tracking-widest">Certified Quality</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif font-bold text-gold text-glow-gold">Trusted by 10K+</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 uppercase tracking-widest">Happy Customers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-serif font-bold text-gold text-glow-gold">24/7 Support</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 uppercase tracking-widest">Always Available</span>
          </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent"></div>
    </section>
  );
}

