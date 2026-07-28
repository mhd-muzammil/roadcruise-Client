import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X, Clock, CheckCircle, Sparkles, ArrowRight, MapPin } from "lucide-react";
import { getActivePromo, mediaUrl } from "../utils/api";

// Routes where a marketing popup would be intrusive or unprofessional.
const SUPPRESSED_ROUTES = ["/admin", "/reset-password", "/verify-email"];

// Shown once per browser session PER PROMO — publishing a new package makes
// the popup appear again even for visitors who dismissed an older one.
const SEEN_KEY = "rc_promo_seen";

const OPEN_DELAY_MS = 1600;

export default function PromoPopup({ onBookNow }) {
  const location = useLocation();
  const [promo, setPromo] = useState(null);
  const [open, setOpen] = useState(false);

  const suppressed = SUPPRESSED_ROUTES.some((r) => location.pathname.startsWith(r));

  // Fetch the active promo once on mount; open after a short delay so the
  // popup never competes with first paint of the page itself.
  useEffect(() => {
    let cancelled = false;
    let timer;
    (async () => {
      try {
        const p = await getActivePromo();
        if (cancelled || !p || sessionStorage.getItem(SEEN_KEY) === p.id) return;
        setPromo(p);
        timer = setTimeout(() => {
          sessionStorage.setItem(SEEN_KEY, p.id);
          setOpen(true);
        }, OPEN_DELAY_MS);
      } catch {
        /* promos are decorative — never surface an error for them */
      }
    })();
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  // Escape closes; body scroll locks while the popup is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!promo || !open || suppressed) return null;

  const image = mediaUrl(promo.imageUrl);

  const book = () => {
    setOpen(false);
    onBookNow({
      name: promo.title,
      type: "package",
      pkg: { name: promo.title, price: promo.price, duration: promo.duration },
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-label="Featured travel package">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm animate-promo-fade" onClick={() => setOpen(false)} />

      {/* Card */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-gold/25 shadow-2xl shadow-black/40 animate-promo-pop grid md:grid-cols-2">
        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Visual side */}
        <div className="relative h-52 md:h-full min-h-[13rem] bg-zinc-200 dark:bg-zinc-800">
          {image ? (
            <img src={image} alt={promo.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-gold/60">
              <MapPin className="w-14 h-14" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {promo.duration && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold tracking-wide">
              <Clock className="w-3.5 h-3.5 text-gold" /> {promo.duration}
            </span>
          )}
        </div>

        {/* Content side */}
        <div className="p-6 md:p-8 flex flex-col text-left">
          <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Featured Package
          </span>

          <h3 className="mt-3 text-2xl md:text-[1.7rem] leading-tight font-bold font-serif text-zinc-900 dark:text-white">
            {promo.title}
          </h3>
          {promo.tagline && (
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{promo.tagline}</p>
          )}

          {promo.highlights?.length > 0 && (
            <ul className="mt-4 space-y-2">
              {promo.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <CheckCircle className="w-3.5 h-3.5 text-gold mt-0.5 flex-shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto pt-5">
            {promo.price && (
              <div className="mb-4">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Starting from</span>
                <p className="text-2xl font-serif font-bold text-gold text-glow-gold">
                  ₹{promo.price}
                  <span className="ml-1 text-xs font-sans font-medium text-zinc-400">onwards</span>
                </p>
              </div>
            )}
            <button
              onClick={book}
              className="w-full py-3 bg-gold hover:bg-gold-hover text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
            >
              Book This Package <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-full mt-2 py-2 text-[11px] font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
