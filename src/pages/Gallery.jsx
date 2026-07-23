import React, { useState, useEffect } from "react";
import { X, Loader2, ImageOff, Film } from "lucide-react";
import { getGallery, mediaUrl } from "../utils/api";
import useDocumentMeta from "../hooks/useDocumentMeta";

export default function Gallery() {
  useDocumentMeta({
    title: "Gallery | Road Cruise",
    description: "Photos and videos from Road Cruise journeys, tours and our chauffeur-driven fleet across South India.",
    canonical: "/gallery",
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null); // lightbox item

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getGallery();
        if (alive) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setError(e?.message || "Could not load the gallery.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Close the lightbox on Escape.
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => { if (e.key === "Escape") setActive(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">Moments on the Road</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 dark:text-white">Gallery</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light">
            Snapshots and clips from our journeys, tours and premium fleet across South India.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
            <p className="text-sm mt-3">Loading the gallery…</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-sm text-zinc-500 dark:text-zinc-400">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-14 h-14 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <ImageOff className="w-7 h-7 text-zinc-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">No photos yet</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Check back soon — new journey highlights are added regularly.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {items.map((m) => (
              <button
                key={m.id}
                onClick={() => setActive(m)}
                className="group relative block w-full break-inside-avoid rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900 cursor-zoom-in"
              >
                {m.type === "video" ? (
                  <>
                    <video src={mediaUrl(m.url)} className="w-full h-auto object-cover" muted playsInline preload="metadata" />
                    <span className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      <Film className="w-3 h-3" /> Video
                    </span>
                  </>
                ) : (
                  <img src={mediaUrl(m.url)} alt={m.caption || "Road Cruise gallery"} loading="lazy" className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                )}
                {m.caption && (
                  <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-white text-[11px] p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {m.caption}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setActive(null)}
        >
          <button
            onClick={() => setActive(null)}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[85vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {active.type === "video" ? (
              <video src={mediaUrl(active.url)} className="max-h-[80vh] w-auto rounded-xl" controls autoPlay />
            ) : (
              <img src={mediaUrl(active.url)} alt={active.caption || "Road Cruise gallery"} className="max-h-[80vh] w-auto rounded-xl object-contain" />
            )}
            {active.caption && <p className="text-white/80 text-sm mt-4 text-center">{active.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
