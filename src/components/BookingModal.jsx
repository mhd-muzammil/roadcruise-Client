import React, { useState, useEffect } from "react";
import { X, Calendar, Phone, User, Compass, CheckCircle, ShieldCheck, Lock, Clock, CreditCard, Banknote } from "lucide-react";
import { createBooking, verifyPayment } from "../utils/api";

// Dynamically load Razorpay's hosted checkout (only when needed). The hosted
// widget handles card/UPI/netbanking securely — no raw card data ever touches
// this site.
const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = RAZORPAY_SRC;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function BookingModal({ isOpen, onClose, selectedItem, currentUser, onAuthTrigger }) {
  // "auth_prompt" | "form" | "pay" | "processing" | "success" | "pending"
  const [step, setStep] = useState("auth_prompt");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    fromDate: "",
    toDate: "",
    tripType: "Round-trip",
    notes: ""
  });
  const [errors, setErrors] = useState({});
  const [processingStatus, setProcessingStatus] = useState("Opening secure payment…");
  const [result, setResult] = useState(null); // { booking, mode }
  const [apiError, setApiError] = useState("");

  const fare = selectedItem?.type === "package" ? 4800 : 2500;

  useEffect(() => {
    if (!isOpen) return;
    setStep(currentUser ? "form" : "auth_prompt");
    setFormData({
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
      fromDate: "",
      toDate: "",
      tripType: selectedItem?.type === "package" ? "Tour Package" : "Round-trip",
      notes: ""
    });
    setErrors({});
    setResult(null);
    setApiError("");
  }, [isOpen, currentUser, selectedItem]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setApiError("");
      setStep("pay");
    }
  };

  // Common booking payload built from the form.
  const buildPayload = (paymentMode) => ({
    name: formData.name,
    phone: formData.phone,
    fromDate: formData.fromDate,
    toDate: formData.toDate,
    tripType: formData.tripType,
    item: selectedItem?.name || "General Query",
    fare,
    paymentMode,
    paymentMethod: paymentMode === "arrival" ? "Pay on arrival" : "Online",
  });

  // Reserve now, pay cash/UPI on arrival — booking is created as Pending for the
  // admin to confirm. No money is collected here.
  const handlePayOnArrival = async () => {
    setApiError("");
    setProcessingStatus("Reserving your booking…");
    setStep("processing");
    try {
      const res = await createBooking(buildPayload("arrival"));
      setResult({ booking: res.booking, mode: "arrival" });
      setStep("pending");
    } catch (err) {
      setApiError(err.message || "Could not create booking");
      setStep("pay");
    }
  };

  // Pay securely online: create the booking + a payment order, then open the
  // Razorpay hosted checkout. The booking is only confirmed AFTER the server
  // verifies the payment signature (verifyPayment).
  const handlePayOnline = async () => {
    setApiError("");
    setProcessingStatus("Creating your booking…");
    setStep("processing");

    let res;
    try {
      res = await createBooking(buildPayload("online"));
    } catch (err) {
      setApiError(err.message || "Could not create booking");
      setStep("pay");
      return;
    }

    // Server couldn't set up online payment (e.g. gateway not configured yet):
    // the booking was saved as Pending for manual confirmation.
    if (res.payment !== "required" || !res.checkout) {
      setResult({ booking: res.booking, mode: "arrival", note: res.warning });
      setStep("pending");
      return;
    }

    const co = res.checkout;

    // Dev/mock provider has no browser widget — the booking stays PendingPayment
    // until a real (Razorpay) payment is verified server-side.
    if (co.provider !== "razorpay") {
      setResult({
        booking: res.booking,
        mode: "pending_payment",
        note: "Online payments run in test mode on this environment. Your booking is saved and awaiting payment confirmation."
      });
      setStep("pending");
      return;
    }

    setProcessingStatus("Opening secure payment…");
    const ok = await loadRazorpay();
    if (!ok) {
      setApiError("Could not load the secure payment window. Please check your connection and try again.");
      setStep("pay");
      return;
    }

    const rzp = new window.Razorpay({
      key: co.keyId,
      order_id: co.orderId,
      amount: co.amount,
      currency: co.currency,
      name: "Road Cruise",
      description: selectedItem?.name || "Booking",
      prefill: { name: formData.name, contact: formData.phone, email: currentUser?.email || "" },
      theme: { color: "#D4AF37" },
      handler: async (response) => {
        setProcessingStatus("Verifying your payment…");
        setStep("processing");
        try {
          await verifyPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature
          });
          setResult({ booking: { ...res.booking, status: "Approved" }, mode: "paid" });
          setStep("success");
        } catch (err) {
          setApiError(err.message || "We couldn't verify your payment. If you were charged, contact support with your booking reference.");
          setStep("pay");
        }
      },
      modal: {
        ondismiss: () => {
          // User closed the widget without paying — booking stays PendingPayment.
          setResult({ booking: res.booking, mode: "pending_payment", note: "Payment was not completed. Your booking is held as awaiting payment." });
          setStep("pending");
        }
      }
    });
    rzp.open();
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
              {step === "pay" && "Choose Payment"}
              {step === "processing" && "Please Wait"}
              {step === "success" && "Booking Confirmed"}
              {step === "pending" && "Booking Received"}
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
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Travel Dates */}
              <div className="grid grid-cols-2 gap-4">
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
                  {errors.fromDate && <p className="text-red-500 text-xs mt-1">{errors.fromDate}</p>}
                </div>

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
                  {errors.toDate && <p className="text-red-500 text-xs mt-1">{errors.toDate}</p>}
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

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer"
              >
                Continue to Payment
              </button>
            </form>
          )}

          {/* STEP 2: Payment choice (real) */}
          {step === "pay" && (
            <div className="space-y-5">
              {/* Fare summary */}
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500">Estimated Fare</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{selectedItem?.name || "Booking"}</p>
                </div>
                <span className="text-xl font-bold font-serif text-gold">₹{fare.toLocaleString("en-IN")}</span>
              </div>

              {apiError && (
                <p className="text-red-500 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">{apiError}</p>
              )}

              <div className="space-y-3">
                {/* Pay Online */}
                <button
                  onClick={handlePayOnline}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-gold/40 bg-gold/5 hover:bg-gold/10 text-left transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">Pay Securely Online</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Card / UPI / Net Banking via encrypted gateway. Confirms instantly.</p>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-gold" />
                </button>

                {/* Pay on Arrival */}
                <button
                  onClick={handlePayOnArrival}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-left transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">Reserve &amp; Pay on Arrival</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">We hold your booking; our team confirms it and you pay in person.</p>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep("form")}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-zinc-200 dark:border-white/5"
              >
                Back
              </button>
            </div>
          )}

          {/* STEP 3: Processing */}
          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-white/5"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-gold border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              </div>
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 animate-pulse">{processingStatus}</h4>
            </div>
          )}

          {/* STEP 4: Success (paid + confirmed) */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 animate-bounce">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h4 className="text-xl font-serif text-zinc-900 dark:text-white font-bold">Payment Confirmed!</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed">
                Thank you, <span className="text-zinc-900 dark:text-white font-medium">{formData.name}</span>. Your payment was verified and your booking for <strong>{selectedItem?.name}</strong> is confirmed.
              </p>
              <div className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 rounded-xl p-4 text-left text-[10px] font-mono text-zinc-600 dark:text-zinc-400 space-y-2 max-w-sm">
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1.5">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">CONFIRMATION</span>
                  <span className="text-emerald-500 font-bold">● PAID</span>
                </div>
                <div className="flex justify-between"><span>Booking Reference:</span><span className="text-zinc-900 dark:text-zinc-100 font-semibold">{result?.booking?.id}</span></div>
                <div className="flex justify-between"><span>Duration:</span><span className="text-zinc-900 dark:text-zinc-100">{formData.fromDate} to {formData.toDate}</span></div>
                <div className="flex justify-between"><span>Amount Paid:</span><span className="text-zinc-900 dark:text-zinc-100">₹{fare.toLocaleString("en-IN")}</span></div>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-full text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Close
              </button>
            </div>
          )}

          {/* STEP 5: Pending (reserved / awaiting payment / awaiting admin) */}
          {step === "pending" && (
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="text-xl font-serif text-zinc-900 dark:text-white font-bold">Booking Received</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed">
                {result?.note ||
                  "Your request is saved. Our team will confirm your booking shortly — you'll get an update by SMS/email."}
              </p>
              <div className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 rounded-xl p-4 text-left text-[10px] font-mono text-zinc-600 dark:text-zinc-400 space-y-2 max-w-sm">
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1.5">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">RESERVATION</span>
                  <span className="text-amber-500 font-bold">● {result?.mode === "pending_payment" ? "AWAITING PAYMENT" : "PENDING"}</span>
                </div>
                <div className="flex justify-between"><span>Booking Reference:</span><span className="text-zinc-900 dark:text-zinc-100 font-semibold">{result?.booking?.id}</span></div>
                <div className="flex justify-between"><span>Duration:</span><span className="text-zinc-900 dark:text-zinc-100">{formData.fromDate} to {formData.toDate}</span></div>
                <div className="flex justify-between"><span>Estimated Fare:</span><span className="text-zinc-900 dark:text-zinc-100">₹{fare.toLocaleString("en-IN")}</span></div>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-full text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
