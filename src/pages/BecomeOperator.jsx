import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2, User, Phone, Mail, MapPin, Car, CheckCircle, Loader2, Handshake, ChevronDown,
} from "lucide-react";
import { submitEnquiry } from "../utils/api";
import useDocumentMeta from "../hooks/useDocumentMeta";

const OPERATING_AREAS = [
  "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Pondicherry",
  "Bengaluru", "Hyderabad", "Kochi", "Other (South India)",
];
const FLEET_SIZES = ["1 vehicle", "2 – 5 vehicles", "6 – 15 vehicles", "16+ vehicles"];

const inputCls = (hasError) =>
  `w-full bg-zinc-50 dark:bg-white/5 border ${
    hasError ? "border-red-500" : "border-zinc-200 dark:border-white/10"
  } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`;

function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
        {label} <span className="text-gold">*</span>
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500 pointer-events-none">
          <Icon className="w-4 h-4" />
        </span>
        {children}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

/**
 * Operator (fleet-partner) registration. Leads are delivered through the
 * existing public /api/contact pipeline — business inbox gets the application,
 * the applicant gets an acknowledgement email. No new server surface.
 */
export default function BecomeOperator() {
  useDocumentMeta({
    title: "Become an Operator | Attach Your Cab — Road Cruise",
    description:
      "Own a cab or a fleet in South India? Partner with Road Cruise and get steady bookings — airport transfers, outstation trips and tour packages.",
    canonical: "/become-operator",
  });

  const [form, setForm] = useState({
    company: "", person: "", phone: "", email: "", area: "", fleet: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.company.trim()) e.company = "Company / fleet name is required";
    if (!form.person.trim()) e.person = "Contact person's name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\+?[0-9\s-]{10,14}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.area) e.area = "Select your operating area";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setStatus("sending");
    try {
      await submitEnquiry({
        name: form.person,
        email: form.email,
        phone: form.phone,
        subject: `Operator application — ${form.company}`,
        message: [
          `Company / fleet: ${form.company}`,
          `Operating area: ${form.area}`,
          form.fleet ? `Fleet size: ${form.fleet}` : "",
          "Source: Become an Operator page",
        ].filter(Boolean).join("\n"),
      });
      setStatus("done");
    } catch (err) {
      setApiError(err.message || "Could not submit your application. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 bg-zinc-50 dark:bg-bg-dark">
      <div className="max-w-2xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-5">
            <Handshake className="w-4 h-4 text-gold" />
            <span className="text-[10px] tracking-[0.2em] font-semibold text-gold uppercase">
              Fleet Partner Program
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 dark:text-white">
            At Road Cruise we care for your growth.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold italic font-normal">
              Join our family today.
            </span>
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-4 max-w-lg mx-auto leading-relaxed">
            Attach your cab or fleet and get steady bookings — airport transfers, outstation
            trips and tour packages across South India. Or call us directly:{" "}
            <a href="tel:+914435510154" className="text-gold font-semibold hover:underline">044-35510154</a>
          </p>
        </div>

        {/* Form / success */}
        <div className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/5">
          {status === "done" ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center border border-gold/30 shadow-lg shadow-gold/10 mb-5">
                <CheckCircle className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white text-glow-gold">
                Application Received!
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 max-w-md mx-auto leading-relaxed">
                Thank you, <span className="font-semibold text-zinc-900 dark:text-white">{form.person}</span>.
                Our partnerships team will review <span className="font-semibold text-zinc-900 dark:text-white">{form.company}</span>'s
                details and call you at <span className="font-semibold text-zinc-900 dark:text-white">{form.phone}</span> within
                1–2 business days. A confirmation email is on its way to you.
              </p>
              <Link
                to="/"
                className="inline-block mt-7 px-8 py-3 bg-gold hover:bg-gold-hover text-zinc-950 font-bold text-xs tracking-wider uppercase rounded-xl transition-all"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Company Name" icon={Building2} error={errors.company}>
                <input
                  type="text" name="company" value={form.company} onChange={handleChange}
                  placeholder="Enter your company / fleet name" className={inputCls(errors.company)}
                />
              </Field>
              <Field label="Contact Person's Name" icon={User} error={errors.person}>
                <input
                  type="text" name="person" value={form.person} onChange={handleChange}
                  placeholder="Enter your full name" className={inputCls(errors.person)}
                />
              </Field>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Phone Number" icon={Phone} error={errors.phone}>
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="e.g. +91 98765 43210" className={inputCls(errors.phone)}
                  />
                </Field>
                <Field label="Email ID" icon={Mail} error={errors.email}>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="Enter your email id" className={inputCls(errors.email)}
                  />
                </Field>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Operating Area" icon={MapPin} error={errors.area}>
                  <select
                    name="area" value={form.area} onChange={handleChange}
                    className={`${inputCls(errors.area)} appearance-none cursor-pointer`}
                  >
                    <option value="" disabled className="bg-white dark:bg-zinc-950">Select</option>
                    {OPERATING_AREAS.map((a) => (
                      <option key={a} value={a} className="bg-white dark:bg-zinc-950">{a}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
                </Field>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Fleet Size <span className="text-zinc-400 normal-case font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500 pointer-events-none">
                      <Car className="w-4 h-4" />
                    </span>
                    <select
                      name="fleet" value={form.fleet} onChange={handleChange}
                      className={`${inputCls(false)} appearance-none cursor-pointer`}
                    >
                      <option value="" className="bg-white dark:bg-zinc-950">Select</option>
                      {FLEET_SIZES.map((f) => (
                        <option key={f} value={f} className="bg-white dark:bg-zinc-950">{f}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
                  </div>
                </div>
              </div>

              {apiError && (
                <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  {apiError}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-gold hover:bg-gold-hover disabled:opacity-60 text-zinc-950 font-bold py-3.5 rounded-xl text-sm tracking-wider uppercase shadow-md shadow-gold/20 hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  "Register"
                )}
              </button>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
                By registering, you agree to be contacted by the Road Cruise partnerships team.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
