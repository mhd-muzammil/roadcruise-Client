import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { verifyEmail, resendVerification } from "../utils/api";
import useDocumentMeta from "../hooks/useDocumentMeta";

export default function VerifyEmail({ onAuthClick }) {
  useDocumentMeta({ title: "Verify Email | Road Cruise", noindex: true });
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get("email") || "";
  const token = params.get("token") || "";
  const linkValid = Boolean(email && token);

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [error, setError] = useState("");
  const [resend, setResend] = useState("idle"); // idle | sending | sent

  // The token is single-use (the server clears it on any attempt), so verify
  // exactly once — the ref also guards StrictMode's dev double-effect.
  const fired = useRef(false);
  useEffect(() => {
    if (!linkValid || fired.current) return;
    fired.current = true;
    (async () => {
      try {
        await verifyEmail({ email, token });
        setStatus("success");
      } catch (err) {
        setError(err.message);
        setStatus("error");
      }
    })();
  }, [linkValid, email, token]);

  const handleResend = async () => {
    setResend("sending");
    try {
      await resendVerification(email);
    } catch {
      // Generic acknowledgement either way — never reveal account state.
    }
    setResend("sent");
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
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Invalid verification link</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This verification link is incomplete or malformed. Please open the most recent email we sent you.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block w-full bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all"
            >
              Back to Home
            </Link>
          </div>
        ) : status === "verifying" ? (
          /* Verifying */
          <div className="text-center py-4" role="status" aria-live="polite">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Verifying your email…</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Confirming <span className="font-semibold text-zinc-700 dark:text-zinc-200">{email}</span>. This only takes a moment.
            </p>
          </div>
        ) : status === "success" ? (
          /* Success */
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Email verified</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">{email}</span> is now verified. You're all set to book your next journey.
            </p>
            <button
              type="button"
              onClick={() => {
                navigate("/", { replace: true });
                onAuthClick?.();
              }}
              className="mt-6 w-full bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer"
            >
              Continue to Sign In
            </button>
          </div>
        ) : (
          /* Error (invalid / expired / already-used token) */
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Verification failed</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {error || "This verification link is invalid or has expired."} If your email is already verified, you can simply sign in.
            </p>
            {resend === "sent" ? (
              <p className="mt-6 p-3 bg-gold/10 border border-gold/20 rounded-xl text-gold text-xs font-semibold leading-relaxed">
                If an account with this email needs verification, a fresh link is on its way.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resend === "sending"}
                className="mt-6 w-full bg-gradient-to-r from-gold via-gold-hover to-gold hover:opacity-90 text-zinc-950 font-bold py-3 rounded-xl text-sm tracking-wider uppercase shadow-lg shadow-gold/15 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {resend === "sending" ? "Sending…" : "Resend Verification Email"}
              </button>
            )}
            <div className="mt-5">
              <Link to="/" className="text-xs font-semibold text-gold hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
