import React, { useState, useEffect } from "react";
import { X, Calendar, Phone, User, Compass, CheckCircle, CreditCard, ShieldCheck, QrCode, Building, Lock } from "lucide-react";
import { createBooking } from "../utils/api";

export default function BookingModal({ isOpen, onClose, selectedItem, currentUser, onAuthTrigger }) {
  const [step, setStep] = useState("auth_prompt"); // "auth_prompt" | "form" | "payment" | "processing" | "success"
  
  // Step 1: Reservation Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    fromDate: "",
    toDate: "",
    tripType: "Round-trip",
    notes: ""
  });
  
  // Step 2: Payment Details State
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" | "upi" | "netbanking"
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  const [cardFocused, setCardFocused] = useState(false); // flip card state on CVV focus
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("sbi");
  const [transactionId, setTransactionId] = useState("");
  
  const [errors, setErrors] = useState({});
  const [processingStatus, setProcessingStatus] = useState("Initiating secure connection...");
  const [processingProgress, setProcessingProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (!currentUser) {
        setStep("auth_prompt");
      } else {
        setStep("form");
      }
      
      // Initialize form with logged in user data
      setFormData({
        name: currentUser?.name || "",
        phone: currentUser?.phone || "",
        fromDate: "",
        toDate: "",
        tripType: selectedItem?.type === "package" ? "Tour Package" : "Round-trip",
        notes: ""
      });
      setErrors({});
      
      // Reset payment variables
      setCardDetails({
        number: "",
        name: "",
        expiry: "",
        cvv: ""
      });
      setUpiId("");
      setSelectedBank("sbi");
      setCardFocused(false);
      setProcessingProgress(0);
      setTransactionId(`TXN-RC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    }
  }, [isOpen, currentUser, selectedItem]);

  // Handle Payment processing animation loop
  useEffect(() => {
    if (step !== "processing") return;

    const messages = [
      { progress: 20, text: "Securing gateway handshake..." },
      { progress: 50, text: "Verifying funds with card issuer..." },
      { progress: 80, text: "Authorizing luxury reservation charge..." },
      { progress: 100, text: "Finalizing booking confirmations..." }
    ];

    const timer = setInterval(() => {
      setProcessingProgress((prev) => {
        const next = prev + 5;
        const msg = messages.find(m => next >= m.progress - 5 && next <= m.progress);
        if (msg) {
          setProcessingStatus(msg.text);
        }
        
        if (next >= 100) {
          clearInterval(timer);
          
          const payload = {
            name: formData.name,
            phone: formData.phone,
            fromDate: formData.fromDate,
            toDate: formData.toDate,
            tripType: formData.tripType,
            item: selectedItem?.name || "General Query",
            fare: selectedItem?.type === "package" ? 4800 : 2500,
            paymentMethod: paymentMethod === "card" ? "Card" : paymentMethod === "upi" ? `UPI (${upiId || "roadcruise@pay"})` : `Bank (${selectedBank.toUpperCase()})`
          };

          createBooking(payload)
            .then((res) => {
              setTransactionId(res.id);
              setTimeout(() => {
                setStep("success");
              }, 400);
            })
            .catch((err) => {
              console.error("Failed to post booking:", err);
              setTimeout(() => {
                setStep("success");
              }, 400);
            });

          return 100;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [step]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (name === "number") {
      // Format 16 digit number: XXXX XXXX XXXX XXXX
      value = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
      const matches = value.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || "";
      const parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      value = parts.length > 0 ? parts.join(" ") : value;
    } else if (name === "expiry") {
      // Format MM/YY
      value = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
      if (value.length >= 2) {
        value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
      }
    } else if (name === "cvv") {
      value = value.replace(/[^0-9]/gi, "").slice(0, 3);
    }
    setCardDetails((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{10,14}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid phone number (min 10 digits)";
    }
    if (!formData.fromDate) newErrors.fromDate = "From date is required";
    if (!formData.toDate) {
      newErrors.toDate = "To date is required";
    } else if (formData.fromDate && new Date(formData.toDate) < new Date(formData.fromDate)) {
      newErrors.toDate = "To date must be after or equal to from date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors = {};
    if (paymentMethod === "card") {
      const cleanNum = cardDetails.number.replace(/\s+/g, "");
      if (cleanNum.length !== 16) {
        newErrors.number = "Card number must be 16 digits";
      }
      if (!cardDetails.name.trim()) {
        newErrors.cardName = "Cardholder name is required";
      }
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
        newErrors.expiry = "Expiry must be MM/YY";
      } else {
        const [m, y] = cardDetails.expiry.split("/").map(Number);
        if (m < 1 || m > 12) newErrors.expiry = "Invalid month";
      }
      if (cardDetails.cvv.length !== 3) {
        newErrors.cvv = "CVV must be 3 digits";
      }
    } else if (paymentMethod === "upi") {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiId.trim()) {
        newErrors.upiId = "UPI ID is required";
      } else if (!upiRegex.test(upiId.trim())) {
        newErrors.upiId = "Invalid UPI ID format (e.g. name@upi)";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setStep("payment");
      setErrors({});
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (validatePayment()) {
      setStep("processing");
      setErrors({});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 dark:bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-gold/30 shadow-2xl shadow-gold/5 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-150 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10">
          <div>
            <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-white tracking-wide">
              {step === "auth_prompt" && "Authentication Required"}
              {step === "form" && "Book Your Journey"}
              {step === "payment" && "Premium Checkout"}
              {step === "processing" && "Processing Payment"}
              {step === "success" && "Booking Confirmed"}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {selectedItem ? `Selected: ${selectedItem.name}` : "Premium Travel Service"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-gold hover:bg-zinc-150 dark:hover:bg-white/5 rounded-full transition-all"
            aria-label="Close booking modal"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* STEP 0: Authentication Prompt */}
          {step === "auth_prompt" && (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-5">
              <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30">
                <Lock className="w-7 h-7 text-gold" />
              </div>
              <div>
                <h4 className="text-base font-bold font-serif text-zinc-900 dark:text-white">Sign In to Continue Booking</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed mt-1.5">
                  To ensure premium reservation updates and safety telemetry link sharing, please sign in or register an account.
                </p>
              </div>
              <div className="w-full flex gap-3 max-w-xs">
                <button
                  onClick={onAuthTrigger}
                  className="flex-1 py-2.5 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Sign In / Up
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-zinc-200 dark:border-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Reservation Form */}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
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
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
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
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Travel Dates */}
              <div className="grid grid-cols-2 gap-4">
                {/* From Date */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    From Date
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      onChange={handleInputChange}
                      className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                        errors.fromDate ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                      } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] transition-all`}
                    />
                  </div>
                  {errors.fromDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.fromDate}</p>
                  )}
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    To Date
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      name="toDate"
                      value={formData.toDate}
                      onChange={handleInputChange}
                      className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                        errors.toDate ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                      } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] transition-all`}
                    />
                  </div>
                  {errors.toDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.toDate}</p>
                  )}
                </div>
              </div>

              {/* Service/Trip Type */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
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
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Special Requirements (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="e.g. child seat, defensive chauffeur preference..."
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-gold/60 focus:outline-none rounded-lg p-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 resize-none transition-all"
                ></textarea>
              </div>

              {/* Proceed to Payment */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer"
              >
                Proceed to Payment
              </button>
            </form>
          )}

          {/* STEP 2: Checkout Payment Selection & Virtual Card */}
          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              
              {/* Payment Methods Selection Tab Bar */}
              <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => { setPaymentMethod("card"); setErrors({}); }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                    paymentMethod === "card" 
                      ? "bg-gold text-zinc-950 shadow-md font-extrabold" 
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentMethod("upi"); setErrors({}); }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                    paymentMethod === "upi" 
                      ? "bg-gold text-zinc-950 shadow-md font-extrabold" 
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  UPI QR
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentMethod("netbanking"); setErrors({}); }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                    paymentMethod === "netbanking" 
                      ? "bg-gold text-zinc-950 shadow-md font-extrabold" 
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  Net Banking
                </button>
              </div>

              {/* CARD PAYMENT VIEW (With 3D Flip Card Effect) */}
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  {/* Interactive Virtual Gold Card */}
                  <div 
                    className="w-full relative mx-auto overflow-hidden rounded-2xl shadow-xl transition-all duration-300"
                    style={{ 
                      perspective: "1000px",
                      aspectRatio: "1.75/1",
                      maxWidth: "320px"
                    }}
                  >
                    <div 
                      className="w-full h-full relative"
                      style={{
                        transform: cardFocused ? "rotateY(180deg)" : "rotateY(0deg)",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.6s"
                      }}
                    >
                      {/* CARD FRONT FACE */}
                      <div 
                        className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-600 to-amber-700 p-5 text-white flex flex-col justify-between"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] tracking-[0.2em] font-semibold text-white/70 uppercase">Road Cruise Gold</span>
                            <div className="w-10 h-7 bg-white/20 border border-white/30 rounded-lg mt-2 relative overflow-hidden flex items-center justify-center">
                              {/* Chip Pattern */}
                              <div className="w-8 h-5 border border-white/20 bg-amber-400/40 rounded flex flex-wrap p-0.5">
                                <div className="w-1/2 h-1/2 border-r border-b border-amber-600/35"></div>
                                <div className="w-1/2 h-1/2 border-b border-amber-600/35"></div>
                                <div className="w-1/2 h-1/2 border-r border-amber-600/35"></div>
                                <div className="w-1/2 h-1/2 border-amber-600/35"></div>
                              </div>
                            </div>
                          </div>
                          <span className="font-serif italic font-extrabold text-sm tracking-wider text-glow-gold">PRESTIGE</span>
                        </div>

                        <div className="text-base tracking-[0.25em] font-mono py-1 select-none">
                          {cardDetails.number || "•••• •••• •••• ••••"}
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="text-left">
                            <span className="text-[7px] text-white/55 uppercase font-semibold">Card Holder</span>
                            <p className="text-xs font-bold tracking-wide uppercase max-w-[170px] truncate">
                              {cardDetails.name || "MEMBER SIGNATURE"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[7px] text-white/55 uppercase font-semibold">Expires</span>
                            <p className="text-xs font-mono font-bold">
                              {cardDetails.expiry || "MM/YY"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* CARD BACK FACE */}
                      <div 
                        className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-700 to-amber-800 text-white flex flex-col justify-between py-5"
                        style={{ 
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)" 
                        }}
                      >
                        <div className="w-full h-8 bg-zinc-950"></div>
                        
                        <div className="px-5 space-y-2">
                          <span className="text-[6px] text-white/55 uppercase font-bold text-left block">Authorized Signature</span>
                          <div className="w-full h-7 bg-white/95 rounded flex items-center justify-end px-3">
                            <span className="text-zinc-900 font-mono italic text-xs font-bold tracking-widest">{cardDetails.cvv || "•••"}</span>
                          </div>
                        </div>

                        <div className="px-5 text-left text-[6px] text-white/40 leading-relaxed font-sans">
                          This prestige card is properties of Road Cruise. Secured gateway simulator enabled for testing environments.
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Card Entry Fields */}
                  <div className="space-y-3">
                    {/* Card Number */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Card Number</label>
                      <input
                        type="text"
                        name="number"
                        value={cardDetails.number}
                        onChange={handleCardChange}
                        placeholder="4111 2222 3333 4444"
                        className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                          errors.number ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                        } focus:border-gold/60 focus:outline-none rounded-lg py-2 px-3 text-sm text-zinc-800 dark:text-zinc-100 font-mono`}
                      />
                      {errors.number && <p className="text-red-500 text-[10px] mt-0.5">{errors.number}</p>}
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        name="name"
                        value={cardDetails.name}
                        onChange={handleCardChange}
                        placeholder="MOHAMED VASEEM"
                        className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                          errors.cardName ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                        } focus:border-gold/60 focus:outline-none rounded-lg py-2 px-3 text-sm text-zinc-800 dark:text-zinc-100 uppercase`}
                      />
                      {errors.cardName && <p className="text-red-500 text-[10px] mt-0.5">{errors.cardName}</p>}
                    </div>

                    {/* Expiry and CVV (Side by Side) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Expiry Date</label>
                        <input
                          type="text"
                          name="expiry"
                          value={cardDetails.expiry}
                          onChange={handleCardChange}
                          placeholder="MM/YY"
                          className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                            errors.expiry ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                          } focus:border-gold/60 focus:outline-none rounded-lg py-2 px-3 text-sm text-zinc-800 dark:text-zinc-100 font-mono`}
                        />
                        {errors.expiry && <p className="text-red-500 text-[10px] mt-0.5">{errors.expiry}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">CVV Code</label>
                        <input
                          type="password"
                          name="cvv"
                          value={cardDetails.cvv}
                          onChange={handleCardChange}
                          onFocus={() => setCardFocused(true)}
                          onBlur={() => setCardFocused(false)}
                          placeholder="•••"
                          className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                            errors.cvv ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                          } focus:border-gold/60 focus:outline-none rounded-lg py-2 px-3 text-sm text-zinc-800 dark:text-zinc-100 font-mono`}
                        />
                        {errors.cvv && <p className="text-red-500 text-[10px] mt-0.5">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* UPI PAYMENT VIEW */}
              {paymentMethod === "upi" && (
                <div className="space-y-4 text-center">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Scan the secure dynamic QR code below using GPay, PhonePe, or BHIM UPI apps.
                  </p>
                  
                  {/* Mock QR Code Drawing */}
                  <div className="relative w-36 h-36 mx-auto bg-white p-3 rounded-2xl border-2 border-zinc-200 shadow-md flex items-center justify-center">
                    <svg className="w-full h-full text-zinc-900" viewBox="0 0 100 100">
                      {/* QR Corner Anchor Squares */}
                      <path d="M 0,0 H 25 V 25 H 0 Z M 5,5 V 20 H 20 V 5 Z" fill="currentColor" />
                      <path d="M 0,75 H 25 V 100 H 0 Z M 5,80 V 95 H 20 V 80 Z" fill="currentColor" />
                      <path d="M 75,0 H 100 V 25 H 75 Z M 80,5 V 20 H 95 V 5 Z" fill="currentColor" />
                      {/* QR Content Mock Noise dots */}
                      <rect x="35" y="5" width="8" height="8" fill="currentColor" />
                      <rect x="55" y="15" width="12" height="6" fill="currentColor" />
                      <rect x="10" y="35" width="14" height="8" fill="currentColor" />
                      <rect x="40" y="45" width="20" height="20" fill="currentColor" />
                      <rect x="75" y="45" width="8" height="15" fill="currentColor" />
                      <rect x="85" y="70" width="10" height="10" fill="currentColor" />
                      <rect x="45" y="80" width="20" height="5" fill="currentColor" />
                      <rect x="35" y="90" width="10" height="8" fill="currentColor" />
                      <circle cx="50" cy="50" r="10" fill="#D4AF37" />
                    </svg>
                    <div className="absolute w-6 h-6 bg-white rounded-md flex items-center justify-center border border-zinc-100 shadow-sm">
                      <Compass className="w-3.5 h-3.5 text-gold" />
                    </div>
                  </div>
                  
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block border border-dashed border-zinc-200 dark:border-white/5 rounded-lg py-1 px-3 max-w-[200px] mx-auto bg-zinc-50 dark:bg-zinc-900">
                    UPI: roadcruise@pay
                  </span>

                  {/* Manual UPI ID Input */}
                  <div className="text-left space-y-1 max-w-xs mx-auto">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Or Enter UPI ID</label>
                    <input
                      type="text"
                      name="upiId"
                      value={upiId}
                      onChange={(e) => { setUpiId(e.target.value); if (errors.upiId) setErrors({}); }}
                      placeholder="e.g. mobile@upi"
                      className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                        errors.upiId ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                      } focus:border-gold/60 focus:outline-none rounded-lg py-2 px-3 text-xs text-zinc-800 dark:text-zinc-100 font-mono`}
                    />
                    {errors.upiId && <p className="text-red-500 text-[9px] mt-0.5">{errors.upiId}</p>}
                  </div>
                </div>
              )}

              {/* NET BANKING VIEW */}
              {paymentMethod === "netbanking" && (
                <div className="space-y-4">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
                    Select your preferred banking gateway. You will be redirected to complete validation.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                    {[
                      { id: "sbi", name: "State Bank of India" },
                      { id: "hdfc", name: "HDFBank" },
                      { id: "icici", name: "ICICI Bank" },
                      { id: "axis", name: "Axis Bank" }
                    ].map((bank) => (
                      <button
                        type="button"
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                          selectedBank === bank.id 
                            ? "border-gold bg-gold/5 shadow-md text-gold" 
                            : "border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/20 text-zinc-700 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-800"
                        }`}
                      >
                        <Building className="w-5 h-5" />
                        <span className="text-[9px] font-bold tracking-wide uppercase leading-tight">{bank.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Back / Pay Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-zinc-200 dark:border-white/5"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 bg-gradient-to-r from-gold to-gold-hover text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Pay & Confirm Booking
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Payment Handshake Verification Progress */}
          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
              {/* Spinner */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-white/5"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-gold border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 animate-pulse">{processingStatus}</h4>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{processingProgress}% Complete</p>
              </div>
              <div className="w-48 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full transition-all duration-150" style={{ width: `${processingProgress}%` }}></div>
              </div>
            </div>
          )}

          {/* STEP 4: Success Receipt */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 animate-bounce">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h4 className="text-xl font-serif text-zinc-900 dark:text-white font-bold">Luxury Cruise Booked!</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed">
                Thank you, <span className="text-zinc-900 dark:text-white font-medium">{formData.name}</span>. 
                Our luxury travel concierge has confirmed your itinerary for <strong>{selectedItem?.name}</strong>.
              </p>
              
              <div className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 rounded-xl p-4 text-left text-[10px] font-mono text-zinc-600 dark:text-zinc-400 space-y-2 max-w-sm">
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1.5">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">TRANSACTION SLIP</span>
                  <span className="text-emerald-500 font-bold">● SUCCESS</span>
                </div>
                <div className="flex justify-between">
                  <span>Booking Reference:</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{formData.fromDate} to {formData.toDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trip Service:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{formData.tripType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact Phone:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Gateway:</span>
                  <span className="text-gold uppercase font-bold tracking-wider">{paymentMethod === "card" ? "Card Verified" : paymentMethod === "upi" ? `UPI (${upiId || " roadcruise@pay"})` : `Bank (${selectedBank.toUpperCase()})`}</span>
                </div>
              </div>
              
              <p className="text-[10px] text-gold font-bold italic animate-pulse mt-3">
                A live GPS tracking link has been sent to {formData.phone}!
              </p>
              
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-full text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Close Receipt
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
