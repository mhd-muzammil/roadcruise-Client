import React, { useEffect, useRef, useState } from "react";
import { getGoogleConfig, getAuthNonce, googleLoginUser } from "../../utils/api";

/**
 * Continue-with-Google button (additive). Uses Google Identity Services to
 * obtain an ID token, sends it (with a one-time nonce) to the backend, and
 * hands the resulting ERP user to onAuthSuccess — the SAME callback the existing
 * email/password flow uses, so nothing downstream changes.
 *
 * States: "loading" | "ready" (GIS button rendered) | "unconfigured" (no
 * GOOGLE_CLIENT_ID on the server → mock/dev) | "error". The existing login is
 * never affected by any of these.
 */
const GSI_SRC = "https://accounts.google.com/gsi/client";

function loadGsi() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function GoogleSignInButton({ onAuthSuccess, onError, onClose }) {
  const [mode, setMode] = useState("loading");
  const btnRef = useRef(null);
  const nonceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await getGoogleConfig();
        if (cancelled) return;
        if (!cfg.enabled || !cfg.clientId) {
          setMode("unconfigured");
          return;
        }
        await loadGsi();
        if (cancelled) return;
        const { nonce } = await getAuthNonce();
        if (cancelled) return;
        nonceRef.current = nonce;
        window.google.accounts.id.initialize({
          client_id: cfg.clientId,
          nonce,
          ux_mode: "popup",
          callback: async (resp) => {
            try {
              const user = await googleLoginUser(resp.credential, nonceRef.current);
              onAuthSuccess?.(user);
              onClose?.();
            } catch (e) {
              onError?.(e.message || "Google sign-in failed");
            }
          },
        });
        setMode("ready");
      } catch {
        if (!cancelled) setMode("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onAuthSuccess, onError, onClose]);

  // The GIS target <div> only mounts once mode is "ready", so the button must
  // be rendered AFTER that commit. Calling renderButton inside the init effect
  // finds btnRef.current still null and silently renders nothing (the empty
  // "OR" slot) — it only ever worked when a re-render re-ran the effect.
  useEffect(() => {
    if (mode !== "ready" || !btnRef.current) return;
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: "filled_black",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: 320,
    });
  }, [mode]);

  return (
    <div className="mt-4">
      {/* Divider, matching the modal's muted style */}
      <div className="flex items-center gap-3 mb-4">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
        <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">or</span>
        <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
      </div>

      {mode === "ready" && <div ref={btnRef} className="flex justify-center" />}

      {mode === "loading" && (
        <div className="w-full py-3 rounded-xl border border-zinc-200 dark:border-white/10 text-center text-xs text-zinc-400">
          Loading Google sign-in…
        </div>
      )}

      {(mode === "unconfigured" || mode === "error") && (
        <button
          type="button"
          onClick={() =>
            onError?.(
              mode === "error"
                ? "Could not load Google sign-in. Check your connection."
                : "Google sign-in is not configured on the server yet."
            )
          }
          className="w-full py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-200 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-white/10 transition-all cursor-pointer"
          title={mode === "unconfigured" ? "Set GOOGLE_CLIENT_ID on the server to enable" : ""}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          Continue with Google
        </button>
      )}
    </div>
  );
}
