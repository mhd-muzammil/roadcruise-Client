import React, { useEffect, useState } from "react";
import { BadgePercent, ChevronRight, Sparkles } from "lucide-react";
import motLogo from "../assets/ministry-of-tourism.svg";
import incredibleIndiaLogo from "../assets/incredible-india.png";
import { getOffers, getPackages } from "../utils/api";

// Fewer offers than this and the panel is topped up with active tour packages
// so it never looks empty; at or above it the list scrolls.
const MIN_ITEMS = 3;

const toItem = (src, kind) => ({
  id: `${kind}-${src.id}`,
  title: src.title || src.name,
  tagline: src.tagline || "",
  duration: src.duration || "",
  price: src.price || "",
  createdAt: src.createdAt,
  kind,
  src,
});

/** "SEP" / "10" date badge from an ISO timestamp (blank when missing). */
function dateParts(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { month: "NEW", day: "" };
  return {
    month: d.toLocaleString("en-IN", { month: "short" }).toUpperCase(),
    day: String(d.getDate()),
  };
}

function OfferRow({ item, onBook, hidden = false }) {
  const { month, day } = dateParts(item.createdAt);
  return (
    <li>
      <button
        type="button"
        onClick={() => onBook(item)}
        tabIndex={hidden ? -1 : 0}
        className="w-full flex items-start gap-4 py-3.5 text-left border-b border-zinc-200 dark:border-white/10 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset rounded-lg"
      >
        <span className="shrink-0 w-14 overflow-hidden rounded-md border border-gold/40 text-center shadow-sm" aria-hidden="true">
          <span className="block bg-gold text-zinc-950 text-[10px] font-extrabold tracking-wider py-0.5">{month}</span>
          <span className="block bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-lg font-bold leading-7">{day}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-gold transition-colors leading-snug">
            {item.title}
            {item.tagline && <span className="font-normal text-zinc-500 dark:text-zinc-400"> — {item.tagline}</span>}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            {item.duration && <span>{item.duration}</span>}
            {item.price && (
              <span className="font-bold text-gold">
                ₹{item.price} <span className="font-normal text-zinc-400">+ GST</span>
              </span>
            )}
            <span className="inline-flex items-center gap-0.5 font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-gold">
              Book now <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}

// Government recognitions (left, stacked vertically) beside a "What's New"
// panel (right) that continuously scrolls the current offers — admin-published
// promotions, topped up with active tour packages. The logo artwork is
// black-on-white, so each sits on a white card to stay legible in both themes.
export default function Recognition({ onBookNowClick }) {
  const [items, setItems] = useState(null); // null = loading

  useEffect(() => {
    let active = true;
    Promise.allSettled([getOffers(), getPackages()]).then(([o, p]) => {
      if (!active) return;
      const offers = o.status === "fulfilled" && Array.isArray(o.value) ? o.value.map((x) => toItem(x, "promo")) : [];
      const packages = p.status === "fulfilled" && Array.isArray(p.value) ? p.value.map((x) => toItem(x, "package")) : [];
      setItems(offers.length >= MIN_ITEMS ? offers : [...offers, ...packages]);
    });
    return () => {
      active = false;
    };
  }, []);

  const book = (item) =>
    onBookNowClick?.({
      name: item.title,
      type: "package",
      // A real tour package carries its admin payment rule; a promotion is
      // booked like the promo popup does.
      pkg: item.kind === "package" ? item.src : { name: item.title, price: item.price, duration: item.duration },
    });

  const scrolls = items && items.length >= MIN_ITEMS;

  return (
    <section
      aria-label="Government recognitions and latest offers"
      className="pt-12 pb-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-6 md:grid-cols-[280px_1fr] items-stretch">
        {/* Recognitions — one logo per row */}
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 flex flex-col">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-4">
            Recognized By
          </p>
          <div className="flex flex-col gap-4 flex-1 justify-center">
            <div className="flex-1 flex min-h-24 items-center justify-center bg-white rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm px-4">
              <img src={motLogo} alt="Ministry of Tourism, Government of India" className="h-12 sm:h-14 w-auto" loading="lazy" />
            </div>
            <div className="flex-1 flex min-h-24 items-center justify-center bg-white rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm px-4">
              <img src={incredibleIndiaLogo} alt="Incredible India" className="h-9 sm:h-11 w-auto" loading="lazy" />
            </div>
          </div>
        </div>

        {/* What's New — scrolling offers */}
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              <BadgePercent className="w-5 h-5 text-gold" /> What's New
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/30 rounded-full px-2.5 py-1">
              <Sparkles className="w-3 h-3" /> Offers
            </span>
          </div>

          {items === null ? (
            <div className="space-y-3 pt-2" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-zinc-200/70 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 py-6 text-center">New offers are coming soon — check back shortly.</p>
          ) : (
            <div
              className="offers-ticker relative h-64 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
              role="region"
              aria-label="Latest offers"
            >
              <div
                className={scrolls ? "animate-offers-scroll" : ""}
                style={scrolls ? { "--offers-duration": `${Math.max(8, items.length * 2.5)}s` } : undefined}
              >
                <ul>
                  {items.map((it) => <OfferRow key={it.id} item={it} onBook={book} />)}
                </ul>
                {/* Second copy makes the upward loop seamless; hidden from AT. */}
                {scrolls && (
                  <ul aria-hidden="true">
                    {items.map((it) => <OfferRow key={`dup-${it.id}`} item={it} onBook={book} hidden />)}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
