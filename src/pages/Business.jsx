import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2, User, Phone, Mail, MapPin, Briefcase, CheckCircle, Loader2, ChevronDown, CalendarRange,
} from "lucide-react";
import { submitEnquiry } from "../utils/api";
import useDocumentMeta from "../hooks/useDocumentMeta";

const REQUIREMENTS = [
  "Employee transport (daily commute)",
  "Airport transfers for staff & guests",
  "Outstation business travel",
  "Events, conferences & offsites",
  "Monthly / long-term cab rental",
  "Other",
];
const VOLUMES = ["Occasional", "1 – 20 trips / month", "21 – 100 trips / month", "100+ trips / month"];

const inputCls = (hasError) =>
  `w-full bg-zinc-50 dark:bg-white/5 border ${
    hasError ? "border-red-500" : "border-zinc-200 dark:border-white/10"
  } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`;

function Field({ label, icon: Icon, error, optional = false, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
        {label}{" "}
        {optional
          ? <span className="text-zinc-400 normal-case font-normal">(optional)</span>
          : <span className="text-gold">*</span>}
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
 * "Business with Road Cruise" — corporate / B2B travel enquiry. Like the
 * operator form, leads go through the public /api/contact pipeline: the
 * business inbox gets the enquiry, the enquirer gets an acknowledgement.
 */
export default function Business() {
  useDocumentMeta({
    title: "Business with Road Cruise | Corporate Cab Services",
    description:
      "Corporate travel with Road Cruise — employee transport, airport transfers, outstation business trips and event transport across South India. Send us your requirement.",
    canonical: "/business",
  });

  const [form, setForm] = useState({
    company: "", person: "", phone: "", email: "", city: "", requirement: "", volume: "", message: "",
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
    if (!form.company.trim()) e.company = "Company name is required";
    if (!form.person.trim()) e.person = "Contact person's name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\+?[0-9\s-]{10,14}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.requirement) e.requirement = "Select what you need";
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
        subject: `Business enquiry — ${form.company}`,
        message: [
          `Company: ${form.company}`,
          `City: ${form.city}`,
          `Requirement: ${form.requirement}`,
          form.volume ? `Expected volume: ${form.volume}` : "",
          form.message.trim() ? `Details: ${form.message.trim()}` : "",
          "Source: Business with Road Cruise page",
        ].filter(Boolean).join("\n"),
      });
      setStatus("done");
    } catch (err) {
      setApiError(err.message || "Could not send your enquiry. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 bg-zinc-50 dark:bg-bg-dark">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-5">
            <Briefcase className="w-4 h-4 text-gold" />
            <span className="text-[10px] tracking-[0.2em] font-semibold text-gold uppercase">Corporate Travel</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 dark:text-white">
            Business with Road Cruise.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold italic font-normal">
              Travel your team can rely on.
            </span>
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-4 max-w-lg mx-auto leading-relaxed">
            Employee transport, airport pickups, outstation business trips and event transport across
            South India. Tell us what you need, or call{" "}
            <a href="tel:+917338899062" className="text-gold font-semibold hover:underline">+91 73388 99062</a>.
          </p>
        </div>

        <div className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/5">
          {status === "done" ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center border border-gold/30 shadow-lg shadow-gold/10 mb-5">
                <CheckCircle className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white text-glow-gold">Enquiry Received!</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 max-w-md mx-auto leading-relaxed">
                Thank you, <span className="font-semibold text-zinc-900 dark:text-white">{form.person}</span>.
                Our corporate team will review <span className="font-semibold text-zinc-900 dark:text-white">{form.company}</span>'s
                requirement and call you at <span className="font-semibold text-zinc-900 dark:text-white">{form.phone}</span> within
                1 business day. A confirmation email is on its way to you.
              </p>
              <Link to="/" className="inline-block mt-7 px-8 py-3 bg-gold hover:bg-gold-hover text-zinc-950 font-bold text-xs tracking-wider uppercase rounded-xl transition-all">
                Back to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Field label="Company Name" icon={Building2} error={errors.company}>
                <input type="text" name="company" value={form.company} onChange={handleChange}
                  placeholder="Enter your company name" className={inputCls(errors.company)} />
              </Field>
              <Field label="Contact Person's Name" icon={User} error={errors.person}>
                <input type="text" name="person" value={form.person} onChange={handleChange}
                  placeholder="Enter your full name" className={inputCls(errors.person)} />
              </Field>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Phone Number" icon={Phone} error={errors.phone}>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="e.g. +91 98765 43210" className={inputCls(errors.phone)} />
                </Field>
                <Field label="Work Email" icon={Mail} error={errors.email}>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="name@company.com" className={inputCls(errors.email)} />
                </Field>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="City" icon={MapPin} error={errors.city}>
                  <input type="text" name="city" value={form.city} onChange={handleChange}
                    placeholder="e.g. Chennai" className={inputCls(errors.city)} />
                </Field>
                <Field label="Expected Volume" icon={CalendarRange} optional>
                  <select name="volume" value={form.volume} onChange={handleChange}
                    className={`${inputCls(false)} appearance-none cursor-pointer`}>
                    <option value="" className="bg-white dark:bg-zinc-950">Select</option>
                    {VOLUMES.map((v) => <option key={v} value={v} className="bg-white dark:bg-zinc-950">{v}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
                </Field>
              </div>
              <Field label="Requirement" icon={Briefcase} error={errors.requirement}>
                <select name="requirement" value={form.requirement} onChange={handleChange}
                  className={`${inputCls(errors.requirement)} appearance-none cursor-pointer`}>
                  <option value="" disabled className="bg-white dark:bg-zinc-950">Select</option>
                  {REQUIREMENTS.map((r) => <option key={r} value={r} className="bg-white dark:bg-zinc-950">{r}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
              </Field>
              <div>
                <label htmlFor="business-message" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Details <span className="text-zinc-400 normal-case font-normal">(optional)</span>
                </label>
                <textarea id="business-message" name="message" rows="4" value={form.message} onChange={handleChange}
                  placeholder="Routes, timings, vehicle types, number of employees…"
                  className={`${inputCls(false)} pl-4 resize-none`} />
              </div>

              {apiError && (
                <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded-xl p-3">{apiError}</p>
              )}

              <button type="submit" disabled={status === "sending"}
                className="w-full bg-gold hover:bg-gold-hover disabled:opacity-60 text-zinc-950 font-bold py-3.5 rounded-xl text-sm tracking-wider uppercase shadow-md shadow-gold/20 hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2">
                {status === "sending" ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send Enquiry"}
              </button>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
                By submitting, you agree to be contacted by the Road Cruise corporate team.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
