import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CircleDot, MapPin, Car, Check, X, ShieldCheck, Lock, CheckCircle,
  Loader2, Users, Wallet, CreditCard, AlertCircle,
} from "lucide-react";
import { createBooking } from "../utils/api";
import { payWithCheckout } from "../utils/payment";
import {
  FARE_RULES, tripTypeByKey, hourlyPackageByKey, formatINR, fmtDate, fmtTime, fmtDuration,
} from "../utils/fare";

// Selection saved by the results page. Read once; a direct visit with nothing
// stored is redirected home by the effect below.
const loadSelection = () => {
  try {
    return JSON.parse(sessionStorage.getItem("rc_checkout") || "null");
  } catch {
    return null;
  }
};

const inputCls = (hasError) =>
  `w-full bg-zinc-50 dark:bg-white/5 border ${
    hasError ? "border-red-500" : "border-zinc-200 dark:border-white/10"
  } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-xl py-3 px-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`;

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-500 font-bold">{label}</p>
      <p className="text-sm font-medium text-zinc-900 dark:text-white mt-0.5">{value}</p>
    </div>
  );
}

export default function BookCheckout({ currentUser, onAuthClick, onSessionExpired }) {
  const navigate = useNavigate();
  const [sel] = useState(loadSelection);

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState("inclusions");
  const [plan, setPlan] = useState("advance"); // "advance" | "full" | "arrival"
  const [status, setStatus] = useState("idle"); // idle | paying | success | pending
  const [statusMsg, setStatusMsg] = useState("");
  const [apiError, setApiError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState(null); // { booking }

  // No selection (deep link / expired session storage) -> back to the planner.
  useEffect(() => {
    if (!sel) navigate("/", { replace: true });
  }, [sel, navigate]);

  // Prefill once the user signs in mid-checkout.
  useEffect(() => {
    if (!currentUser) return;
    setForm((f) => ({
      ...f,
      name: f.name || currentUser.name || "",
      phone: f.phone || currentUser.phone || "",
    }));
    setNotice("");
  }, [currentUser]);

  if (!sel) return null;

  const { search, route, days, vehicle, quote } = sel;
  const trip = tripTypeByKey(search.type);
  const pkg = search.type === "hourly" ? hourlyPackageByKey(search.pkg) : null;
  const fare = quote.fare;
  const advance = Math.max(1, Math.round(fare * FARE_RULES.advanceRate));
  const balance = fare - advance;
  const payNow = plan === "advance" ? advance : plan === "full" ? fare : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\+?[0-9\s-]{10,14}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => {
    const autoNotes = [
      pkg ? `Package: ${pkg.label}` : "",
      search.type === "roundtrip" && search.returnTime ? `Return drop time: ${fmtTime(search.returnTime)}` : "",
      route ? `Route estimate: ${route.distanceKm} km · ${fmtDuration(route.durationMin)}` : "",
    ].filter(Boolean);
    return {
      name: form.name,
      phone: form.phone,
      fromDate: search.date,
      toDate: search.type === "roundtrip" ? search.returnDate : search.date,
      tripType: trip?.short || "One-way",
      item: vehicle.name,
      category: "vehicle",
      pickup: search.pickup.label,
      drop: search.drop?.label || "",
      vehicle: `${vehicle.name} — ₹${vehicle.outstationRate}/km`,
      vehicleId: vehicle.id,
      packageName: "",
      passengers: "",
      pickupTime: search.time,
      notes: [form.notes.trim(), ...autoNotes].filter(Boolean).join(" | "),
      fare,
      distanceKm: route?.distanceKm,
      durationMin: route?.durationMin,
      paymentMode: plan === "arrival" ? "arrival" : "online",
      paymentPlan: plan === "advance" ? "advance" : "full",
      paymentMethod: plan === "arrival" ? "Pay on arrival" : plan === "advance" ? "Online (20% advance)" : "Online",
    };
  };

  const handleError = (err) => {
    if (err?.status === 401) {
      onSessionExpired?.();
      setNotice("Your session has expired — please sign in again to continue.");
      onAuthClick?.();
      setStatus("idle");
      return;
    }
    if (err?.status === 409) {
      setApiError("This vehicle just got booked by someone else. Please pick another cab.");
      setStatus("idle");
      return;
    }
    setApiError(err?.message || "Something went wrong. Please try again.");
    setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    // Bookings belong to a signed-in account (server rule). Details entered so
    // far survive the sign-in round-trip.
    if (!currentUser) {
      setNotice("Please sign in to confirm your booking — your trip details are saved.");
      onAuthClick?.();
      return;
    }

    setStatus("paying");
    setStatusMsg(plan === "arrival" ? "Reserving your booking…" : "Creating your booking…");

    let res;
    try {
      res = await createBooking(buildPayload());
    } catch (err) {
      handleError(err);
      return;
    }

    // Pay-on-arrival, or online payment unavailable server-side: reservation
    // saved, pending manual confirmation.
    if (res.payment === "on_arrival" || res.payment !== "required" || !res.checkout) {
      setResult({ booking: res.booking, note: res.warning });
      setStatus("pending");
      sessionStorage.removeItem("rc_checkout");
      return;
    }

    setStatusMsg("Opening secure payment…");
    try {
      await payWithCheckout(res.checkout, {
        name: form.name,
        contact: form.phone,
        email: currentUser?.email || "",
        description: `${vehicle.name} · ${trip?.short}`,
      });
      setResult({ booking: res.booking });
      setStatus("success");
      sessionStorage.removeItem("rc_checkout");
    } catch (err) {
      setApiError(
        `${err.message || "Payment was not completed."} Your booking ${res.booking?.id ? `(${res.booking.id}) ` : ""}is saved — you can finish paying from My Bookings.`
      );
      setStatus("idle");
    }
  };

  // ------------------------------------------------------------- success ----
  if (status === "success" || status === "pending") {
    const paid = status === "success";
    const paidAmount = plan === "advance" ? advance : fare;
    return (
      <section className="min-h-screen pt-32 pb-20 px-4 bg-zinc-50 dark:bg-bg-dark">
        <div className="max-w-lg mx-auto bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-3xl p-8 md:p-10 text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center border border-gold/30 shadow-lg shadow-gold/10 mb-5">
            <CheckCircle className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white text-glow-gold">
            {paid ? "Booking Confirmed!" : "Reservation Received!"}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
            {paid
              ? "Your payment is verified and your cab is booked."
              : result?.note || "Our team will contact you shortly to confirm your reservation."}
          </p>

          <div className="mt-6 bg-zinc-50 dark:bg-white/5 rounded-2xl divide-y divide-zinc-200 dark:divide-white/5 text-left">
            <SummaryLine label="Booking Ref" value={result?.booking?.id} strong />
            <SummaryLine label="Vehicle" value={vehicle.name} />
            <SummaryLine label="Trip" value={`${trip?.short} · ${fmtDate(search.date)} · ${fmtTime(search.time)}`} />
            {paid && <SummaryLine label="Paid Now" value={`₹ ${formatINR(paidAmount)}`} />}
            {paid && plan === "advance" && (
              <SummaryLine label="Balance to Driver" value={`₹ ${formatINR(balance)}`} />
            )}
            {!paid && <SummaryLine label="Total Fare" value={`₹ ${formatINR(fare)}`} />}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <Link
              to="/my-bookings"
              className="flex-1 bg-gold hover:bg-gold-hover text-zinc-950 font-bold py-3 rounded-xl text-xs tracking-wider uppercase transition-all"
            >
              View My Bookings
            </Link>
            <Link
              to="/"
              className="flex-1 border border-zinc-300 dark:border-white/15 hover:border-gold/50 text-zinc-700 dark:text-zinc-300 hover:text-gold font-bold py-3 rounded-xl text-xs tracking-wider uppercase transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ------------------------------------------------------------ checkout ----
  return (
    <section className="min-h-screen pt-24 pb-16 bg-zinc-50 dark:bg-bg-dark">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-[360px_1fr] gap-6 items-start">
        {/* Ride details */}
        <aside className="lg:sticky lg:top-24 bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5">
          <p className="text-[10px] uppercase tracking-wider text-gold font-bold mb-4">Ride Details</p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CircleDot className="w-4 h-4 text-gold shrink-0 mt-1" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Pickup</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white leading-snug">{search.pickup.label}</p>
              </div>
            </div>
            {search.drop && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-1" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Drop</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white leading-snug">{search.drop.label}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-5 pt-5 border-t border-zinc-100 dark:border-white/5">
            <DetailRow label="Date" value={fmtDate(search.date)} />
            <DetailRow label="Time" value={fmtTime(search.time)} />
            {search.type === "roundtrip" && <DetailRow label="Return" value={fmtDate(search.returnDate)} />}
            {search.type === "roundtrip" && search.returnTime && (
              <DetailRow label="Drop Time" value={fmtTime(search.returnTime)} />
            )}
            <DetailRow label="Trip Type" value={trip?.short} />
            <DetailRow label="Vehicle" value={vehicle.name} />
            {pkg && <DetailRow label="Package" value={pkg.label} />}
            {route && <DetailRow label="Distance" value={`${route.distanceKm} km`} />}
            {route && <DetailRow label="Duration" value={fmtDuration(route.durationMin)} />}
            {search.type === "roundtrip" && <DetailRow label="Days" value={String(days)} />}
          </div>

          {vehicle.image && (
            <div className="mt-5 rounded-xl overflow-hidden h-36 bg-zinc-100 dark:bg-white/5">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="flex items-center gap-2 mt-4 text-[11px] text-zinc-500">
            <Users className="w-3.5 h-3.5 text-gold" /> {vehicle.seats} seater · {vehicle.category}
          </p>
        </aside>

        {/* Main column */}
        <div className="space-y-5 min-w-0">
          {/* Traveller */}
          <div className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5">
            <h1 className="text-lg font-serif font-bold text-zinc-900 dark:text-white mb-5">
              Who's travelling on this trip?
            </h1>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="co-name" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-gold">*</span>
                </label>
                <input
                  id="co-name" type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Enter your name" className={inputCls(errors.name)}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="co-phone" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-gold">*</span>
                </label>
                <input
                  id="co-phone" type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="e.g. +91 98765 43210" className={inputCls(errors.phone)}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="co-email" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Email ID
              </label>
              <input
                id="co-email" type="email" value={currentUser?.email || ""} disabled
                placeholder="Sign in to attach your email"
                className={`${inputCls(false)} opacity-70 cursor-not-allowed`}
              />
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                {currentUser
                  ? "Booking confirmation and invoice go to this email."
                  : "You'll sign in before payment — the booking is linked to your account email."}
              </p>
            </div>
            <div className="mt-4">
              <label htmlFor="co-notes" className="sr-only">Additional request</label>
              <textarea
                id="co-notes" name="notes" value={form.notes} onChange={handleChange} rows={3}
                placeholder="Any additional request? We will convey the same to the operator."
                className={`${inputCls(false)} resize-none`}
              />
            </div>
          </div>

          {/* Inclusions / Exclusions */}
          <div className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
            <div className="grid grid-cols-2 border-b border-zinc-100 dark:border-white/5">
              {["inclusions", "exclusions"].map((t) => (
                <button
                  key={t} type="button" onClick={() => setTab(t)}
                  className={`py-3.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    tab === t
                      ? "text-gold border-b-2 border-gold -mb-px"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <ul
              className={`m-4 p-5 space-y-3 rounded-xl border ${
                tab === "inclusions"
                  ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
                  : "border-red-500/30 bg-red-500/5 dark:bg-red-500/10"
              }`}
            >
              {(tab === "inclusions" ? quote.included : quote.excluded).map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {tab === "inclusions" ? (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Amount */}
          <div className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5">
            <div className="flex items-center justify-between">
              <p className="text-sm italic text-zinc-500 dark:text-zinc-400">Amount payable</p>
              <p className="text-xl font-bold text-gold text-glow-gold">₹ {formatINR(fare)}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
              <Link to="/refund" className="text-gold hover:underline">Cancellation charges &amp; other details</Link>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 pt-3 border-t border-zinc-100 dark:border-white/5">
              By proceeding, you agree to Road Cruise{" "}
              <Link to="/terms" className="text-gold hover:underline">Terms &amp; Conditions</Link>
            </p>
          </div>

          {notice && (
            <div className="flex items-start gap-3 bg-gold/10 border border-gold/30 text-zinc-800 dark:text-zinc-100 rounded-2xl p-4 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" /> {notice}
            </div>
          )}
          {apiError && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl p-4 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {apiError}{" "}
                {apiError.includes("My Bookings") && (
                  <Link to="/my-bookings" className="underline font-semibold">Go to My Bookings</Link>
                )}
                {apiError.includes("another") && (
                  <button onClick={() => navigate(-1)} className="underline font-semibold cursor-pointer">
                    Back to cabs
                  </button>
                )}
              </span>
            </div>
          )}

          {/* Payment options */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5">
            <div className="space-y-3">
              <PayOption
                checked={plan === "advance"} onChange={() => setPlan("advance")} icon={Wallet}
                title={<>Pay <strong>₹ {formatINR(advance)}</strong> (20%) now</>}
                sub={`Pay the remaining ₹ ${formatINR(balance)} to the driver`}
              />
              <PayOption
                checked={plan === "full"} onChange={() => setPlan("full")} icon={CreditCard}
                title={<>Pay <strong>₹ {formatINR(fare)}</strong> (100%) now</>}
                sub="Nothing to pay during the trip"
              />
              <PayOption
                checked={plan === "arrival"} onChange={() => setPlan("arrival")} icon={Car}
                title={<>Reserve now, <strong>pay on arrival</strong></>}
                sub="Our team confirms your reservation shortly"
              />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 mt-6">
              <button
                type="submit"
                disabled={status === "paying"}
                className="w-full md:w-auto md:min-w-55 bg-gold hover:bg-gold-hover disabled:opacity-60 text-zinc-950 font-bold py-3.5 px-8 rounded-xl text-sm tracking-wider uppercase shadow-md shadow-gold/20 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {status === "paying" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {statusMsg}
                  </>
                ) : plan === "arrival" ? (
                  "Reserve Now"
                ) : (
                  `Pay ₹ ${formatINR(payNow)}`
                )}
              </button>
              <p className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                <Lock className="w-3.5 h-3.5 text-gold" />
                Secured by Razorpay · UPI · Cards · Netbanking
              </p>
            </div>
            <p className="flex items-center gap-2 mt-4 text-[11px] text-zinc-400 dark:text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              Your booking is confirmed only after the payment is verified on our servers.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function PayOption({ checked, onChange, icon: Icon, title, sub }) {
  return (
    <label
      className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
        checked
          ? "border-gold/60 bg-gold/10 shadow-md shadow-gold/5"
          : "border-zinc-200 dark:border-white/10 hover:border-gold/30"
      }`}
    >
      <input type="radio" name="payplan" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          checked ? "border-gold" : "border-zinc-300 dark:border-zinc-600"
        }`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-gold" />}
      </span>
      <Icon className={`w-5 h-5 shrink-0 ${checked ? "text-gold" : "text-zinc-400"}`} />
      <span className="min-w-0">
        <span className="block text-sm text-zinc-900 dark:text-white">{title}</span>
        <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{sub}</span>
      </span>
    </label>
  );
}

function SummaryLine({ label, value, strong }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{label}</span>
      <span className={`text-sm ${strong ? "font-bold text-gold" : "font-medium text-zinc-900 dark:text-white"}`}>
        {value}
      </span>
    </div>
  );
}
