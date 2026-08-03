import React, { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { searchPlaces } from "../../utils/api";

/**
 * Location input with live suggestions (server-proxied OpenStreetMap search).
 * A "place" is only considered chosen when the user picks a suggestion — free
 * text has no coordinates, so the fare engine can't quote it.
 *
 * Props:
 *   value      — the chosen place ({ name, label, lat, lon }) or null
 *   onSelect   — (place|null) => void; null = cleared/being retyped
 *   placeholder, error (bool), inputId
 */
export default function PlaceAutocomplete({ value, onSelect, placeholder = "Enter a Location", error, inputId }) {
  const [text, setText] = useState(value?.label || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef(null);
  const debounceRef = useRef(null);
  const requestSeq = useRef(0);

  // Keep the text in sync when the parent swaps/sets the place (e.g. the
  // pickup<->drop swap button, or arriving with a pre-filled search).
  useEffect(() => {
    setText(value?.label || "");
  }, [value]);

  // Close on outside click/tap.
  useEffect(() => {
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const runSearch = (q) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    searchPlaces(q)
      .then((list) => {
        if (seq !== requestSeq.current) return; // stale response — ignore
        setResults(Array.isArray(list) ? list : []);
        setOpen(true);
        setHighlight(-1);
      })
      .catch(() => {
        if (seq !== requestSeq.current) return;
        setResults([]);
      })
      .finally(() => {
        if (seq === requestSeq.current) setLoading(false);
      });
  };

  const handleChange = (e) => {
    const q = e.target.value;
    setText(q);
    if (value) onSelect(null); // typing again invalidates the previous choice
    clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(q.trim()), 300);
  };

  const choose = (place) => {
    onSelect(place);
    setText(place.label);
    setOpen(false);
    setResults([]);
  };

  const clear = () => {
    onSelect(null);
    setText("");
    setResults([]);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? results.length - 1 : h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[highlight >= 0 ? highlight : 0]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          className={`w-full bg-transparent border-0 focus:outline-none focus:ring-0 p-0 pr-6 text-sm font-medium ${
            error ? "placeholder-red-400/70" : "placeholder-zinc-400 dark:placeholder-zinc-500"
          } text-zinc-900 dark:text-white truncate`}
        />
        <span className="absolute inset-y-0 right-0 flex items-center">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 text-gold animate-spin" />
          ) : text ? (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear location"
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </span>
      </div>

      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 md:right-auto md:min-w-[360px] top-full mt-3 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl shadow-black/20 overflow-hidden animate-fade-in"
        >
          {results.map((r, i) => (
            <li key={r.id} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // keep input focus
                onClick={() => choose(r)}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                  i === highlight ? "bg-gold/10" : "hover:bg-zinc-50 dark:hover:bg-white/5"
                } ${i > 0 ? "border-t border-zinc-100 dark:border-white/5" : ""}`}
              >
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span className="min-w-0">
                  <span className="flex items-baseline gap-2 min-w-0">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {r.name}
                    </span>
                    {/* Many places share a name — the town of Vandalur and its
                        railway station are both just "Vandalur" in OSM — so the
                        kind is what tells them apart. */}
                    {r.kind && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-gold/10 text-gold border border-gold/20">
                        {r.kind}
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                    {r.label}
                  </span>
                </span>
              </button>
            </li>
          ))}
          <li className="px-4 py-1.5 text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-white/5">
            Search by OpenStreetMap
          </li>
        </ul>
      )}
    </div>
  );
}
