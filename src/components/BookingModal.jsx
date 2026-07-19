import React, { useState, useEffect } from "react";
import {
  X, Calendar, Phone, User, Compass, CheckCircle, ShieldCheck, Lock, Clock,
  CreditCard, Banknote, MapPin, Users, Car, Package as PackageIcon,
} from "lucide-react";
import { createBooking, verifyPayment, simulateMockCheckout } from "../utils/api";
import {
  VEHICLE_OPTIONS, NO_PREFERENCE, vehicleOptionText, findVehicleByName, findVehicleByValue,
} from "../data/vehicles";

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

// Pull a positive integer rupee amount out of a display price like "4,999".
const parsePrice = (p) => {
  const n = Number(String(p ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

// "2026-08-14" -> "14 Aug 2026" (falls back to the raw value if unparseable).
const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// Initial dropdown value: a fleet-card booking preselects that vehicle (as its
// price-labeled option); general/package bookings start at "No preference".
const defaultVehiclePref = (mode, itemName) => {
  if (mode === "vehicle") {
    const match = findVehicleByName(itemName);
    if (match) return vehicleOptionText(match);
    if (itemName) return itemName; // unknown fleet name — keep it verbatim
  }
  return NO_PREFERENCE;
};

// One label/value line on the confirmation summary. Renders nothing when the
// value is empty so optional fields (notes, pickup time…) simply disappear.
function SummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500 pt-0.5 whitespace-nowrap">{label}</span>
      <span className="text-sm font-medium text-zinc-900 text-right wrap-break-word min-w-0">{value}</span>
    </div>
  );
}

// Small presentational field wrapper (label + optional leading icon + error).
function Field({ label, error, icon: Icon, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
            <Icon className="w-4 h-4" />
          </span>
        )}
        {children}
      </div>
      {hint && !error && <p className="text-zinc-400 dark:text-zinc-500 text-[11px] mt-1">{hint}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const fieldCls = (hasError, withIcon = true) =>
  `w-full bg-zinc-50 dark:bg-white/5 border ${
    hasError ? "border-red-500" : "border-zinc-200 dark:border-white/10"
  } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 ${
    withIcon ? "pl-10" : "pl-4"
  } pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`;

const selectCls =
  "w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 focus:border-gold/60 focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white appearance-none cursor-pointer transition-all";

export default function BookingModal({ isOpen, onClose, selectedItem, currentUser, onAuthTrigger, onSessionExpired }) {
  // "auth_prompt" | "form" | "confirm" | "pay" | "mock_pay" | "processing" | "success" | "pending"
  const [step, setStep] = useState("auth_prompt");
  // Holds the mock order details while the simulated (preview) checkout is open.
  const [mockCheckout, setMockCheckout] = useState(null); // { orderId, booking }

  // Booking context: general (header), vehicle (fleet), or package (tours).
  const mode = selectedItem?.type === "package" ? "package"
    : selectedItem?.type === "vehicle" ? "vehicle"
    : "general";
  const vehicleMeta = selectedItem?.vehicle || null;
  const packageMeta = selectedItem?.pkg || null;

  const [formData, setFormData] = useState({
    name: "", phone: "", pickup: "", drop: "",
    fromDate: "", toDate: "", tripType: "Round-trip",
    passengers: "", pickupTime: "", vehiclePreference: defaultVehiclePref(mode, selectedItem?.name), notes: "",
  });

  // The vehicle currently chosen in the dropdown (null for "No preference" or
  // an unknown verbatim name).
  const selectedVehicle = findVehicleByValue(formData.vehiclePreference);

  // Indicative fare — the team confirms the final amount. Packages keep the
  // listed package price; otherwise the chosen vehicle's 8h local-package rate
  // is the estimate, falling back to the fleet card's rate or a flat base.
  const fare =
    mode === "package"
      ? parsePrice(packageMeta?.price) || 4800
      : selectedVehicle?.eightHours ||
        parsePrice(vehicleMeta?.localPricing?.eightHours) ||
        2500;
  const [errors, setErrors] = useState({});
  const [processingStatus, setProcessingStatus] = useState("Opening secure payment…");
  const [result, setResult] = useState(null); // { booking, mode }
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setStep(currentUser ? "form" : "auth_prompt");
    setFormData({
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
      pickup: "",
      drop: "",
      fromDate: "",
      toDate: "",
      tripType: mode === "package" ? "Tour Package" : "Round-trip",
      passengers: "",
      pickupTime: "",
      vehiclePreference: defaultVehiclePref(mode, selectedItem?.name),
      notes: "",
    });
    setErrors({});
    setResult(null);
    setApiError("");
    setMockCheckout(null);
  }, [isOpen, currentUser, selectedItem, mode]);

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
    if (!formData.pickup.trim()) newErrors.pickup = "Pickup location is required";
    // "Drop" only applies to point-to-point trips (general + vehicle), not to a
    // package (its destination is the package itself).
    if (mode !== "package" && !formData.drop.trim()) newErrors.drop = "Drop location is required";
    if (!formData.fromDate) newErrors.fromDate = "From date is required";
    if (!formData.toDate) {
      newErrors.toDate = "To date is required";
    } else if (formData.fromDate && new Date(formData.toDate) < new Date(formData.fromDate)) {
      newErrors.toDate = "To date must be after or equal to from date";
    }
    if (formData.passengers && !/^\d{1,3}$/.test(String(formData.passengers).trim())) {
      newErrors.passengers = "Enter a valid number of passengers";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setApiError("");
      setStep("confirm"); // review everything before choosing how to pay
    }
  };

  // A 401 means the stored session is missing/expired/invalid. Clear it and send
  // the user to sign in again instead of dead-ending at the payment step.
  const handleBookingError = (err) => {
    if (err?.status === 401) {
      onSessionExpired?.();          // clears currentUser + localStorage in App
      setApiError("Your session has expired. Please sign in again to continue.");
      setStep("auth_prompt");
      return;
    }
    setApiError(err?.message || "Could not create booking");
    setStep("pay");
  };

  // Common booking payload built from the form + booking context.
  const buildPayload = (paymentMode) => ({
    name: formData.name,
    phone: formData.phone,
    fromDate: formData.fromDate,
    toDate: formData.toDate,
    tripType: formData.tripType,
    item: selectedItem?.name || "General Enquiry",
    category: mode,
    pickup: formData.pickup,
    drop: mode === "package" ? "" : formData.drop,
    // The vehicle chosen in the dropdown, WITH its price label (e.g.
    // "Sedan (Dzire, Aura, Amaze) — ₹14/km"), for every booking mode — the
    // server persists it verbatim and the notification emails render it.
    vehicle: formData.vehiclePreference || "",
    packageName: mode === "package" ? selectedItem?.name || "" : "",
    passengers: formData.passengers,
    pickupTime: formData.pickupTime,
    notes: formData.notes,
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
      handleBookingError(err);
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
      handleBookingError(err);
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

    // Mock provider (no real gateway configured yet): open the simulated
    // test-payment dialog so the client can preview the full flow. Switching to
    // real Razorpay is purely an env change (PAYMENT_PROVIDER + keys) — this
    // branch simply stops running once a real gateway returns provider:razorpay.
    if (co.provider !== "razorpay") {
      setMockCheckout({ orderId: co.orderId, booking: res.booking });
      setStep("mock_pay");
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

  // --- Simulated (preview) checkout, used only while the mock gateway is active ---
  const handleMockSuccess = async () => {
    if (!mockCheckout) return;
    setApiError("");
    setProcessingStatus("Verifying your payment…");
    setStep("processing");
    try {
      const sig = await simulateMockCheckout(mockCheckout.orderId);
      await verifyPayment({ orderId: sig.orderId, paymentId: sig.paymentId, signature: sig.signature });
      setResult({ booking: { ...mockCheckout.booking, status: "Approved" }, mode: "paid" });
      setStep("success");
    } catch (err) {
      setApiError(err.message || "Test payment could not be verified.");
      setStep("mock_pay");
    }
  };

  const handleMockFailure = () => {
    setResult({
      booking: mockCheckout?.booking,
      mode: "pending_payment",
      note: "Test payment was cancelled. Your booking is held as awaiting payment.",
    });
    setStep("pending");
  };

  const headerTitle = {
    auth_prompt: "Authentication Required",
    form: mode === "package" ? "Book Your Package" : mode === "vehicle" ? "Book This Vehicle" : "Book Your Journey",
    confirm: "Review Your Trip",
    pay: "Choose Payment",
    mock_pay: "Secure Payment (Test Mode)",
    processing: "Please Wait",
    success: "Booking Confirmed",
    pending: "Booking Received",
  }[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 dark:bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-gold/30 shadow-2xl shadow-gold/5 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-5 border-b border-zinc-150 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10">
          <div>
            <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-white tracking-wide">
              {headerTitle}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {selectedItem?.name && mode !== "general"
                ? `${mode === "package" ? "Package" : "Vehicle"}: ${selectedItem.name}`
                : "Premium Travel Service"}
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

          {/* STEP 1: Reservation Form (context-aware) */}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">

              {/* Selected vehicle / package summary card */}
              {mode !== "general" && selectedItem?.name && (
                <div className="flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 p-3.5">
                  <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                    {mode === "package" ? <PackageIcon className="w-5 h-5 text-gold" /> : <Car className="w-5 h-5 text-gold" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {mode === "package" ? "Selected Package" : "Selected Vehicle"}
                    </p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{selectedItem.name}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {mode === "package"
                        ? [packageMeta?.duration, packageMeta?.price && `₹${packageMeta.price}`].filter(Boolean).join(" · ")
                        : [vehicleMeta?.seats && `${vehicleMeta.seats} seats`, vehicleMeta?.category].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <Field label="Full Name" error={errors.name} icon={User}>
                <input
                  type="text" name="name" value={formData.name} onChange={handleInputChange}
                  placeholder="Enter your full name" className={fieldCls(errors.name)}
                />
              </Field>

              {/* Phone Number */}
              <Field label="Phone Number" error={errors.phone} icon={Phone}>
                <input
                  type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  placeholder="e.g. +91 98765 43210" className={fieldCls(errors.phone)}
                />
              </Field>

              {/* Pickup + Drop locations (Drop hidden for packages) */}
              <div className={mode === "package" ? "" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                <Field label={mode === "package" ? "Pickup Location" : "From (Pickup)"} error={errors.pickup} icon={MapPin}>
                  <input
                    type="text" name="pickup" value={formData.pickup} onChange={handleInputChange}
                    placeholder="e.g. Chennai Airport" className={fieldCls(errors.pickup)}
                  />
                </Field>
                {mode !== "package" && (
                  <Field label="To (Drop)" error={errors.drop} icon={MapPin}>
                    <input
                      type="text" name="drop" value={formData.drop} onChange={handleInputChange}
                      placeholder="e.g. Kodaikanal" className={fieldCls(errors.drop)}
                    />
                  </Field>
                )}
              </div>

              {/* Travel Dates */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="From Date" error={errors.fromDate} icon={Calendar}>
                  <input
                    type="date" name="fromDate" value={formData.fromDate} onChange={handleInputChange}
                    className={`${fieldCls(errors.fromDate)} [color-scheme:light] dark:[color-scheme:dark]`}
                  />
                </Field>
                <Field label="To Date" error={errors.toDate} icon={Calendar}>
                  <input
                    type="date" name="toDate" value={formData.toDate} onChange={handleInputChange}
                    className={`${fieldCls(errors.toDate)} [color-scheme:light] dark:[color-scheme:dark]`}
                  />
                </Field>
              </div>

              {/* Vehicle choice (all modes) — every option carries its rate.
                  Fleet-card bookings arrive preselected; general/package modes
                  also offer "No preference". */}
              <Field
                label={mode === "vehicle" ? "Vehicle" : "Preferred Vehicle"}
                icon={Car}
                hint={
                  mode !== "package" && selectedVehicle
                    ? `Local 8h / 80km package approx ₹${selectedVehicle.eightHours.toLocaleString("en-IN")} — final fare confirmed by our team`
                    : undefined
                }
              >
                <select name="vehiclePreference" value={formData.vehiclePreference} onChange={handleInputChange} className={selectCls}>
                  {mode !== "vehicle" && <option value={NO_PREFERENCE}>{NO_PREFERENCE}</option>}
                  {/* Unknown fleet name (no pricing match) — keep it selectable verbatim. */}
                  {mode === "vehicle" &&
                    formData.vehiclePreference &&
                    formData.vehiclePreference !== NO_PREFERENCE &&
                    !findVehicleByValue(formData.vehiclePreference) && (
                      <option value={formData.vehiclePreference}>{formData.vehiclePreference}</option>
                    )}
                  {VEHICLE_OPTIONS.map((v) => (
                    <option key={v.id} value={vehicleOptionText(v)}>{vehicleOptionText(v)}</option>
                  ))}
                </select>
              </Field>

              {/* Trip type + Passengers */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Trip Service Type" icon={Compass}>
                  <select name="tripType" value={formData.tripType} onChange={handleInputChange} className={selectCls}>
                    <option value="Round-trip">Round-trip Rental</option>
                    <option value="One-way">One-way Drop</option>
                    <option value="Local">Local (Hourly)</option>
                    <option value="Outstation">Outstation</option>
                    <option value="Tour Package">Tour Package</option>
                  </select>
                </Field>
                <Field label="Passengers" error={errors.passengers} icon={Users}>
                  <input
                    type="number" min="1" name="passengers" value={formData.passengers} onChange={handleInputChange}
                    placeholder="e.g. 4" className={fieldCls(errors.passengers)}
                  />
                </Field>
              </div>

              {/* Pickup time */}
              <Field label="Preferred Pickup Time (Optional)" icon={Clock}>
                <input
                  type="time" name="pickupTime" value={formData.pickupTime} onChange={handleInputChange}
                  className={`${fieldCls(false)} [color-scheme:light] dark:[color-scheme:dark]`}
                />
              </Field>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Special Requirements (Optional)
                </label>
                <textarea
                  name="notes" value={formData.notes} onChange={handleInputChange} rows="2"
                  placeholder="e.g. child seat, extra luggage, chauffeur preference…"
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-gold/60 focus:outline-none rounded-lg p-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 resize-none transition-all"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer"
              >
                Review Booking
              </button>
            </form>
          )}

          {/* STEP 1b: Confirmation — full trip summary before payment */}
          {step === "confirm" && (
            <div className="space-y-5">

              {/* Route + dates banner */}
              <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {mode === "package" ? "Package Trip" : "Route"}
                </p>
                <p className="text-base font-bold font-serif text-zinc-900 flex items-center gap-2 flex-wrap">
                  <span>{formData.pickup}</span>
                  {mode !== "package" && formData.drop && (
                    <>
                      <span className="text-gold">→</span>
                      <span>{formData.drop}</span>
                    </>
                  )}
                  {mode === "package" && selectedItem?.name && (
                    <>
                      <span className="text-gold">→</span>
                      <span>{selectedItem.name}</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-zinc-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold" />
                  <span>
                    {fmtDate(formData.fromDate)} – {fmtDate(formData.toDate)}
                    {formData.pickupTime && ` · Pickup at ${formData.pickupTime}`}
                  </span>
                </p>
              </div>

              {/* Trip details */}
              <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden">
                <SummaryRow label="Traveller" value={formData.name} />
                <SummaryRow label="Phone" value={formData.phone} />
                <SummaryRow label="Trip Type" value={formData.tripType} />
                <SummaryRow label="Passengers" value={formData.passengers} />
                {mode === "package" && <SummaryRow label="Package" value={selectedItem?.name} />}
                <SummaryRow label="Vehicle" value={formData.vehiclePreference} />
                <SummaryRow label="Notes" value={formData.notes} />
              </div>

              {/* Indicative fare */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500">Estimated Fare</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {mode === "package" ? "Package price" : "Based on the 8h local package rate"}
                  </p>
                </div>
                <span className="text-xl font-bold font-serif text-gold">₹{fare.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[11px] text-zinc-400 -mt-2">
                Indicative estimate. Our team confirms the final fare based on distance, tolls and your requirements.
              </p>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-zinc-200"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => { setApiError(""); setStep("pay"); }}
                  className="py-3 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold/15 active:scale-[0.98]"
                >
                  Confirm &amp; Continue
                </button>
              </div>
            </div>
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
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 -mt-2">
                Indicative estimate. Our team confirms the final fare based on distance, tolls and your requirements.
              </p>

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
                onClick={() => setStep("confirm")}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-zinc-200 dark:border-white/5"
              >
                Back
              </button>
            </div>
          )}

          {/* STEP 2b: Simulated payment (preview only — mock gateway) */}
          {step === "mock_pay" && (
            <div className="space-y-5">
              {/* Test-mode banner */}
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2">
                <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  Test mode — no real money is charged. This is a preview of the secure payment step.
                </p>
              </div>

              {/* Mock gateway card */}
              <div className="rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Road Cruise</span>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">Sandbox</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Amount payable</span>
                    <span className="text-xl font-bold font-serif text-zinc-900 dark:text-white">₹{fare.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-white/10 p-3 opacity-70">
                    <CreditCard className="w-5 h-5 text-zinc-400" />
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tracking-wider">4111 1111 1111 1111 — TEST CARD</span>
                  </div>
                </div>
              </div>

              {apiError && (
                <p className="text-red-500 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">{apiError}</p>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleMockSuccess}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
                >
                  <CheckCircle className="w-4 h-4" />
                  Simulate Successful Payment
                </button>
                <button
                  onClick={handleMockFailure}
                  className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Cancel / Simulate Failure
                </button>
              </div>
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
