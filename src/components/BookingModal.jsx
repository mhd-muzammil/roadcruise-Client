import React, { useState, useEffect } from "react";
import { X, Calendar, Phone, User, Compass, CheckCircle } from "lucide-react";

export default function BookingModal({ isOpen, onClose, selectedItem }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    tripType: "Round-trip",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setFormData({
        name: "",
        phone: "",
        date: "",
        tripType: selectedItem?.type === "package" ? "Tour Package" : "Round-trip",
        notes: ""
      });
      setErrors({});
    }
  }, [isOpen, selectedItem]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{10,14}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid phone number (min 10 digits)";
    }
    if (!formData.date) newErrors.date = "Preferred date is required";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 dark:bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-gold/30 shadow-2xl shadow-gold/5 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-150 dark:border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-serif text-zinc-900 dark:text-white tracking-wide">
              {isSubmitted ? "Booking Confirmed" : "Book Your Journey"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {selectedItem ? `Selected: ${selectedItem.name}` : "Premium Travel Service"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-gold hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-all"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30 animate-pulse">
                <CheckCircle className="w-10 h-10 text-gold" />
              </div>
              <h4 className="text-2xl font-serif text-zinc-900 dark:text-white">Request Received!</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
                Thank you, <span className="text-zinc-900 dark:text-white font-medium">{formData.name}</span>. 
                Our luxury travel concierge has received your request for <strong>{selectedItem?.name}</strong>.
              </p>
              <div className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-xl p-4 text-left text-xs text-zinc-600 dark:text-zinc-400 space-y-2 max-w-md">
                <div><span className="font-semibold text-zinc-700 dark:text-zinc-300">Date:</span> {formData.date}</div>
                <div><span className="font-semibold text-zinc-700 dark:text-zinc-300">Phone:</span> {formData.phone}</div>
                <div><span className="font-semibold text-zinc-700 dark:text-zinc-300">Service:</span> {formData.tripType}</div>
              </div>
              <p className="text-xs text-gold/85 italic animate-bounce mt-4 font-semibold">
                We will contact you within 15 minutes to confirm the booking!
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-gold hover:bg-gold-hover text-zinc-950 font-semibold rounded-full text-sm transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                      errors.name ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                    } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                      errors.phone ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                    } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>
                )}
              </div>

              {/* Preferred Date */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Preferred Travel Date
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                      errors.date ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                    } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] transition-all`}
                  />
                </div>
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.date}</p>
                )}
              </div>

              {/* Service/Trip Type */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Trip Service Type
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                    <Compass className="w-4 h-4" />
                  </span>
                  <select
                    name="tripType"
                    value={formData.tripType}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 focus:border-gold/60 focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white appearance-none cursor-pointer transition-all"
                  >
                    <option value="Round-trip">Round-trip Rental</option>
                    <option value="One-way">One-way Drop</option>
                    <option value="Tour Package">Tour Package Deal</option>
                  </select>
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Special Requirements (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="e.g. child seat, specific driver request, language preferences..."
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-gold/60 focus:outline-none rounded-lg p-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 resize-none transition-all"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-full text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer"
              >
                Confirm Luxury Reservation
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
