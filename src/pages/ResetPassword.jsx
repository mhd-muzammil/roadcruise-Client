import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { resetPassword } from "../utils/api";
import useDocumentMeta from "../hooks/useDocumentMeta";

// Mirror the backend password policy (min 8, upper, lower, number, special).
// The server is the source of truth; this only gives fast inline feedback.
const validatePolicy = (p) => {
  if (!p) return "Password is required";
  if (p.length < 8) return "At least 8 characters";
  if (!/[A-Z]/.test(p)) return "Add an uppercase letter";
  if (!/[a-z]/.test(p)) return "Add a lowercase letter";
  if (!/[0-9]/.test(p)) return "Add a number";
  if (!/[^A-Za-z0-9]/.test(p)) return "Add a special character (e.g. @ # !)";
  return "";
};

export default function ResetPassword({ onAuthClick }) {
  useDocumentMeta({ title: "Reset Password | Road Cruise", noindex: true });
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get("email") || "";
  const token = params.get("token") || "";
  const linkValid = Boolean(email && token);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    const policyErr = validatePolicy(password);
    if (policyErr) next.password = policyErr;
    if (confirm !== password) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("submitting");
    try {
      await resetPassword({ email, token, newPassword: password });
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      setErrors({ general: err.message });
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-gold/30 shadow-2xl shadow-gold/5 p-6 sm:p-8">
        {/* Invalid / missing link */}
        {!linkValid ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Invalid reset link</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This password reset link is incomplete or malformed. Please request a new one from the sign-in screen.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block w-full bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all"
            >
              Back to Home
            </Link>
          </div>
        ) : status === "success" ? (
          /* Success */
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Password updated</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Your password has been reset and all existing sessions were signed out. You can now sign in with your new password.
            </p>
            <button
              type="button"
              onClick={() => {
                // Leave the consumed link behind (replace) and open the sign-in modal.
                navigate("/", { replace: true });
                onAuthClick?.();
              }}
              className="mt-6 w-full bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer"
            >
              Continue to Sign In
            </button>
          </div>
        ) : (
          /* Reset form */
          <>
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Reset your password</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
                Choose a new password for <span className="font-semibold text-zinc-700 dark:text-zinc-200">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold text-center leading-relaxed">
                  {errors.general}
                </div>
              )}

              {/* New password */}
              <div>
                <label htmlFor="reset-new-password" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: "" }));
                    }}
                    placeholder="••••••••"
                    className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                      errors.password ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                    } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-10 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-gold"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                ) : (
                  <p className="text-zinc-400 dark:text-zinc-500 text-[11px] mt-1">
                    Min 8 characters with an uppercase, lowercase, number & special character.
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="reset-confirm-password" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="reset-confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      if (errors.confirm) setErrors((p) => ({ ...p, confirm: "" }));
                    }}
                    placeholder="••••••••"
                    className={`w-full bg-zinc-50 dark:bg-white/5 border ${
                      errors.confirm ? "border-red-500" : "border-zinc-200 dark:border-white/10"
                    } focus:border-gold/60 focus:bg-white dark:focus:bg-transparent focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all`}
                  />
                </div>
                {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full mt-2 bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {status === "submitting" ? "Updating…" : "Update Password"}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link to="/" className="text-xs font-semibold text-gold hover:underline">
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
