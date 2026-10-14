import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Lock, Loader2, CheckCircle, AlertCircle, Phone, Mail, User, Building2, BadgeCheck, CalendarCheck, ChevronRight,
} from "lucide-react";
import { fetchProfile, updateProfile } from "../utils/api";
import { GSTIN_RE } from "../utils/fare";

const inputCls = (hasError) =>
  `w-full bg-zinc-50 dark:bg-white/5 border ${
    hasError ? "border-red-500" : "border-zinc-200 dark:border-white/10"
  } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-xl py-3 px-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed`;

const isPhoneAccount = (u) => /@phone\.invalid$/.test(u?.email || "");

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {error ? <p className="text-red-500 text-xs mt-1">{error}</p> : hint && <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">{hint}</p>}
    </div>
  );
}

/**
 * My Profile — name, contact email and (for business customers) the GST
 * details printed on invoices. Built mainly for accounts that signed in with a
 * mobile number: they have no email on file until they add one here.
 */
export default function Profile({ currentUser, onAuthClick, onSessionExpired, onProfileUpdate }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", contactEmail: "", companyName: "", gstin: "", address: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { ok, text }

  useEffect(() => {
    if (!currentUser) return;
    let alive = true;
    fetchProfile()
      .then((u) => {
        if (!alive) return;
        setProfile(u);
        setForm({
          name: u.name || "",
          contactEmail: u.contactEmail || "",
          companyName: u.billing?.companyName || "",
          gstin: u.billing?.gstin || "",
          address: u.billing?.address || "",
        });
      })
      .catch((err) => {
        if (err.status === 401) onSessionExpired?.();
        else setMessage({ ok: false, text: err.message });
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [currentUser, onSessionExpired]);

  if (!currentUser) {
    return (
      <div className="pt-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-6">
        <div className="text-center space-y-5 max-w-sm">
          <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30 mx-auto">
            <Lock className="w-7 h-7 text-gold" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white">Sign in to view your profile</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your details and GST information for invoices.</p>
          <button
            onClick={onAuthClick}
            className="px-6 py-2.5 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-full text-xs uppercase tracking-wider transition-all shadow-md"
          >
            Sign In / Up
          </button>
        </div>
      </div>
    );
  }

  const u = profile || currentUser;
  const phoneAccount = isPhoneAccount(u);
  const set = (k) => (e) => {
    const value = k === "gstin" ? e.target.value.toUpperCase().replace(/\s/g, "") : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
    setMessage(null);
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Enter your name";
    if (phoneAccount && form.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
      e.contactEmail = "Enter a valid email address";
    }
    const anyGst = form.companyName.trim() || form.gstin.trim() || form.address.trim();
    if (anyGst) {
      if (!form.companyName.trim()) e.companyName = "Enter the registered company name";
      if (!GSTIN_RE.test(form.gstin.trim())) e.gstin = "Enter a valid 15-character GSTIN";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setMessage(null);
    try {
      const anyGst = form.companyName.trim() || form.gstin.trim() || form.address.trim();
      const updated = await updateProfile({
        name: form.name.trim(),
        ...(phoneAccount ? { contactEmail: form.contactEmail.trim() } : {}),
        billing: anyGst ? { companyName: form.companyName, gstin: form.gstin, address: form.address } : null,
      });
      setProfile(updated);
      onProfileUpdate?.({ name: updated.name });
      setMessage({ ok: true, text: "Your profile has been saved." });
    } catch (err) {
      if (err.status === 401) onSessionExpired?.();
      setMessage({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const clearGst = () => {
    setForm((f) => ({ ...f, companyName: "", gstin: "", address: "" }));
    setErrors((p) => ({ ...p, companyName: "", gstin: "" }));
    setMessage(null);
  };

  const memberSince = u.createdAt
    ? new Date(u.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="pt-24 pb-16 min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* Identity card */}
        <div className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold text-zinc-950 flex items-center justify-center font-serif font-bold text-2xl shrink-0 shadow-md shadow-gold/20">
            {(u.name?.[0] || "?").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-serif font-bold text-zinc-900 dark:text-white truncate">{u.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {u.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gold" /> +91 {u.phone}
                  {u.phoneVerified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" aria-label="Verified" />}
                </span>
              )}
              {!phoneAccount && (
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-gold shrink-0" /> <span className="truncate">{u.email}</span>
                </span>
              )}
              {memberSince && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-gold" /> Member since {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>

        {loading && !profile ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
        ) : (
          <form onSubmit={save} className="space-y-5">
            {/* Personal details */}
            <section className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-5">
                <User className="w-4 h-4 text-gold" /> Personal details
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Field id="pf-name" label="Full name" error={errors.name}>
                  <input id="pf-name" value={form.name} onChange={set("name")} className={inputCls(errors.name)} />
                </Field>
                <Field id="pf-phone" label="Mobile number" hint={phoneAccount ? "Used to sign in — can't be changed here." : ""}>
                  <input id="pf-phone" value={u.phone ? `+91 ${u.phone}` : ""} placeholder="Not added" disabled className={inputCls(false)} />
                </Field>
                <div className="md:col-span-2">
                  {phoneAccount ? (
                    <Field id="pf-email" label="Email (optional)" error={errors.contactEmail}
                      hint="We'll send booking confirmations and invoices here.">
                      <input id="pf-email" type="email" value={form.contactEmail} onChange={set("contactEmail")}
                        placeholder="you@example.com" className={inputCls(errors.contactEmail)} />
                    </Field>
                  ) : (
                    <Field id="pf-email" label="Email" hint="Your sign-in email — can't be changed here.">
                      <input id="pf-email" value={u.email} disabled className={inputCls(false)} />
                    </Field>
                  )}
                </div>
              </div>
            </section>

            {/* GST details */}
            <section className="bg-white dark:bg-bg-card border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    <Building2 className="w-4 h-4 text-gold" /> Business / GST details
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    For corporate travel. Printed on your invoices so you can claim GST input credit.
                  </p>
                </div>
                {(form.companyName || form.gstin || form.address) && (
                  <button type="button" onClick={clearGst} className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-red-500 shrink-0">
                    Remove
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field id="pf-company" label="Company name" error={errors.companyName}>
                  <input id="pf-company" value={form.companyName} onChange={set("companyName")}
                    placeholder="Registered company name" className={inputCls(errors.companyName)} />
                </Field>
                <Field id="pf-gstin" label="GSTIN" error={errors.gstin}>
                  <input id="pf-gstin" value={form.gstin} onChange={set("gstin")} maxLength={15}
                    placeholder="e.g. 33ABCDE1234F1Z5" className={`${inputCls(errors.gstin)} uppercase tracking-wider`} />
                </Field>
                <div className="md:col-span-2">
                  <Field id="pf-address" label="Billing address">
                    <textarea id="pf-address" rows={2} value={form.address} onChange={set("address")}
                      placeholder="Registered address (as on the GST certificate)" className={`${inputCls(false)} resize-none`} />
                  </Field>
                </div>
              </div>
            </section>

            {message && (
              <div className={`flex items-start gap-3 rounded-2xl p-4 text-sm animate-fade-in border ${
                message.ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-500"
              }`}>
                {message.ok ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                {message.text}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
              <Link to="/my-bookings" className="inline-flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-gold py-3">
                My Bookings <ChevronRight className="w-4 h-4" />
              </Link>
              <button
                type="submit" disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gold hover:bg-gold-hover disabled:opacity-60 text-zinc-950 font-bold rounded-xl text-xs tracking-wider uppercase shadow-md shadow-gold/20 transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
