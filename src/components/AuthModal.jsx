import React, { useState, useEffect, useCallback } from "react";
import { X, Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { loginUser, registerUser, requestPasswordReset, requestPhoneOtp, verifyPhoneOtp } from "../utils/api";
import GoogleSignInButton from "./common/GoogleSignInButton";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState("signin"); // "signin" | "signup" | "forgot" | "phone" | "otp"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Set after a successful "forgot password" request — swaps the form for a
  // neutral confirmation (the server never reveals whether the account exists).
  const [resetSent, setResetSent] = useState(false);

  // Switch between signin/signup/forgot, resetting transient UI state.
  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setResetSent(false);
    // A half-typed code left behind a tab switch is how you get "wrong code"
    // on a number the user already changed.
    if (tab !== "otp") setOtpCode("");
    if (tab !== "otp" && tab !== "phone") { setOtpPhone(""); setOtpName(""); setResendIn(0); }
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab("signin");
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: ""
      });
      setErrors({});
      setShowPassword(false);
      setSubmitting(false);
      setResetSent(false);
      setOtpPhone("");
      setOtpCode("");
      setOtpName("");
      setOtpIsNewUser(false);
      setResendIn(0);
    }
  }, [isOpen]);

  // Stable identity: passed to GoogleSignInButton, whose init effect depends on
  // it. An inline arrow here would change every render (i.e. every keystroke),
  // re-running that effect and re-rendering the Google iframe — which makes the
  // whole modal jitter while typing.
  const handleGoogleError = useCallback((msg) => setErrors({ general: msg }), []);

  // ---- Phone (SMS) OTP login ------------------------------------------------
  // Kept in its own state rather than folded into formData: the OTP screens
  // share no fields with the email/password form, and mixing them made "what
  // should clear on a tab switch" ambiguous.
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpName, setOtpName] = useState("");
  const [otpIsNewUser, setOtpIsNewUser] = useState(false);
  // Seconds until another code may be requested. Mirrors the server's per-number
  // cooldown; the server re-checks it, this only keeps the UI honest.
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setInterval(() => setResendIn((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  // Digits only, capped at 10 — matches the server's normalizePhone, so a number
  // that types cleanly here cannot come back rejected as malformed.
  const handlePhoneInput = (e) => {
    setOtpPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
    if (errors.otpPhone || errors.general) setErrors({});
  };

  const handleCodeInput = (e) => {
    setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
    if (errors.otpCode || errors.general) setErrors({});
  };

  const sendOtp = async (e) => {
    e?.preventDefault();
    if (!/^[6-9]\d{9}$/.test(otpPhone)) {
      setErrors({ otpPhone: "Enter a valid 10-digit mobile number" });
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      const info = await requestPhoneOtp(otpPhone);
      setOtpIsNewUser(!!info.isNewUser);
      setResendIn(info.resendInSec || 60);
      setOtpCode("");
      setActiveTab("otp");
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setErrors({ otpCode: "Enter the 6-digit code" });
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      const payload = await verifyPhoneOtp({
        phone: otpPhone,
        code: otpCode,
        name: otpIsNewUser ? otpName.trim() || undefined : undefined,
      });
      onAuthSuccess(payload);
      onClose();
    } catch (err) {
      setErrors({ general: err.message });
      setOtpCode("");
    } finally {
      setSubmitting(false);
    }
  };

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Invalid email format";
    }

    // Forgot-password only needs a valid email — skip the password checks.
    if (activeTab === "forgot") {
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // Password policy — MUST mirror the backend (min 8, upper, lower, number,
    // special). Enforced on sign-up; sign-in only checks presence (the server is
    // the source of truth for an existing password).
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (activeTab === "signup") {
      const p = formData.password;
      if (p.length < 8) newErrors.password = "At least 8 characters";
      else if (!/[A-Z]/.test(p)) newErrors.password = "Add an uppercase letter";
      else if (!/[a-z]/.test(p)) newErrors.password = "Add a lowercase letter";
      else if (!/[0-9]/.test(p)) newErrors.password = "Add a number";
      else if (!/[^A-Za-z0-9]/.test(p)) newErrors.password = "Add a special character (e.g. @ # !)";
    }

    if (activeTab === "signup") {
      if (!formData.name.trim()) {
        newErrors.name = "Full name is required";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\+?[0-9\s-]{10,14}$/.test(formData.phone.trim())) {
        newErrors.phone = "Enter a valid phone number (min 10 digits)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (activeTab === "forgot") {
        await requestPasswordReset(formData.email.trim());
        setResetSent(true);
        return;
      }
      let userPayload;
      if (activeTab === "signin") {
        userPayload = await loginUser(formData.email, formData.password);
      } else {
        userPayload = await registerUser(formData.name, formData.email, formData.phone, formData.password);
      }
      onAuthSuccess(userPayload);
      onClose();
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 dark:bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-gold/30 shadow-2xl shadow-gold/5 flex flex-col max-h-[90vh]">
        
        {/* Header — tabs for sign in / sign up, or a titled bar for forgot-password */}
        <div className="flex border-b border-zinc-100 dark:border-white/5 relative">
          {activeTab === "forgot" || activeTab === "phone" || activeTab === "otp" ? (
            <div className="flex-1 flex items-center gap-2 py-4 pl-4 pr-12">
              <button
                type="button"
                onClick={() => switchTab(activeTab === "otp" ? "phone" : "signin")}
                className="p-1 -ml-1 text-zinc-400 hover:text-gold rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold tracking-wider uppercase text-gold">
                {activeTab === "forgot" ? "Reset Password" : activeTab === "phone" ? "Sign in with Mobile" : "Verify Your Number"}
              </span>
            </div>
          ) : (
            <>
              <button
                onClick={() => switchTab("signin")}
                className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors ${
                  activeTab === "signin"
                    ? "text-gold border-b-2 border-gold font-bold"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchTab("signup")}
                className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors ${
                  activeTab === "signup"
                    ? "text-gold border-b-2 border-gold font-bold"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                }`}
              >
                Sign Up
              </button>
            </>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-1.5 text-zinc-400 hover:text-gold hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-all"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 overflow-y-auto">
          {resetSent ? (
            /* Neutral confirmation — never reveals whether the account exists. */
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Check your email</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                If an account exists for <span className="font-semibold text-zinc-700 dark:text-zinc-200">{formData.email.trim()}</span>,
                we've sent a link to reset your password. It expires in 30 minutes.
              </p>
              <button
                type="button"
                onClick={() => switchTab("signin")}
                className="mt-6 w-full bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : activeTab === "phone" ? (
            /* ---- Step 1: enter the mobile number ---- */
            <form onSubmit={sendOtp} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold text-center leading-relaxed">
                  {errors.general}
                </div>
              )}
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                We&apos;ll text you a 6-digit code. No password needed — if this is your
                first time, your account is created automatically.
              </p>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">+91</span>
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    autoFocus
                    value={otpPhone}
                    onChange={handlePhoneInput}
                    placeholder="98765 43210"
                    className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                      errors.otpPhone ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                    } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-[4.5rem] pr-4 text-sm tracking-wider text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                  />
                </div>
                {errors.otpPhone && <p className="text-red-500 text-xs mt-1">{errors.otpPhone}</p>}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {submitting ? "Sending…" : "Send Code"}
              </button>
              <button
                type="button"
                onClick={() => switchTab("signin")}
                className="w-full text-xs font-semibold text-zinc-400 hover:text-gold transition-colors"
              >
                Use email and password instead
              </button>
            </form>
          ) : activeTab === "otp" ? (
            /* ---- Step 2: enter the code ---- */
            <form onSubmit={confirmOtp} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold text-center leading-relaxed">
                  {errors.general}
                </div>
              )}
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">+91 {otpPhone}</span>.
                It expires in 5 minutes.
              </p>

              {/* First-time users can name the account here. Optional by design: a
                  blank field must never block someone from signing in. */}
              {otpIsNewUser && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Your Name <span className="normal-case font-normal text-zinc-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={otpName}
                      onChange={(e) => setOtpName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  value={otpCode}
                  onChange={handleCodeInput}
                  placeholder="------"
                  className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                    errors.otpCode ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                  } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-3 px-4 text-center text-2xl font-bold tracking-[0.5em] text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-600 transition-all`}
                />
                {errors.otpCode && <p className="text-red-500 text-xs mt-1">{errors.otpCode}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting || otpCode.length !== 6}
                className="w-full mt-2 bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {submitting ? "Verifying…" : "Verify & Sign In"}
              </button>

              <div className="text-center">
                {resendIn > 0 ? (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Resend code in {resendIn}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={submitting}
                    className="text-xs font-semibold text-gold hover:underline disabled:opacity-60"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </form>
          ) : (
          <>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold text-center leading-relaxed">
                {errors.general}
              </div>
            )}

            {/* Forgot-password intro */}
            {activeTab === "forgot" && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Enter the email associated with your account and we'll send you a link to reset your password.
              </p>
            )}

            {/* Sign Up Exclusive: Full Name */}
            {activeTab === "signup" && (
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
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. name@example.com"
                  className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                    errors.email ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                  } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Sign Up Exclusive: Phone Number */}
            {activeTab === "signup" && (
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
            )}

            {/* Password (hidden in forgot-password mode) */}
            {activeTab !== "forgot" && (
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                    errors.password ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                  } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-10 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-gold"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              {activeTab === "signup" && !errors.password && (
                <p className="text-zinc-400 dark:text-zinc-500 text-[11px] mt-1">
                  Min 8 characters with an uppercase, lowercase, number & special character.
                </p>
              )}
            </div>
            )}

            {/* Forgot password link (sign-in only) */}
            {activeTab === "signin" && (
              <div className="text-right -mt-1">
                <button
                  type="button"
                  onClick={() => switchTab("forgot")}
                  className="text-xs font-semibold text-gold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {submitting
                ? "Please wait…"
                : activeTab === "signin"
                ? "Sign In to Cruise"
                : activeTab === "forgot"
                ? "Send Reset Link"
                : "Create Luxury Account"}
            </button>
          </form>

          {/* Mobile OTP sign-in — the path for customers who never set a
              password. Hidden during password recovery. */}
          {activeTab !== "forgot" && (
            <button
              type="button"
              onClick={() => switchTab("phone")}
              className="mt-3 w-full flex items-center justify-center gap-2 border border-zinc-200 dark:border-white/10 hover:border-gold/60 text-zinc-700 dark:text-zinc-200 font-semibold py-3 rounded-xl text-sm transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              Continue with Mobile Number
            </button>
          )}

          {/* Continue with Google — hidden during password recovery */}
          {activeTab !== "forgot" && (
            <GoogleSignInButton
              onAuthSuccess={onAuthSuccess}
              onClose={onClose}
              onError={handleGoogleError}
            />
          )}

          {/* Secure-account notice */}
          <div className="mt-4 text-center">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 italic block">
              Your account is secured with encrypted authentication.
            </span>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
