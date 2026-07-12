import { useEffect } from "react";

const DEFAULT_TITLE = "Road Cruise — Where Every Journey Feels Like A Cruise";
const DEFAULT_DESCRIPTION =
  "Chauffeur-driven car rentals from ₹14/km and curated tour packages across South India. GPS-tracked fleet, verified drivers, 24/7 support. Book online.";

// Per-route <head> management without a dependency. The SPA serves every
// route from the same document, so title/description/robots are swapped on
// mount and restored to the site defaults on unmount.
export default function useDocumentMeta({ title, description, noindex = false } = {}) {
  useEffect(() => {
    document.title = title || DEFAULT_TITLE;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description || DEFAULT_DESCRIPTION;

    let robots = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.appendChild(robots);
      }
      robots.content = "noindex, nofollow";
    } else if (robots) {
      robots.remove();
    }

    return () => {
      document.title = DEFAULT_TITLE;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.content = DEFAULT_DESCRIPTION;
      const rob = document.querySelector('meta[name="robots"]');
      if (rob) rob.remove();
    };
  }, [title, description, noindex]);
}
