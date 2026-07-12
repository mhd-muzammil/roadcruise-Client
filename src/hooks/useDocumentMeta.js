import { useEffect } from "react";
import { SITE_ORIGIN, canonicalUrl } from "../config/site";

const DEFAULT_TITLE = "Road Cruise — Where Every Journey Feels Like A Cruise";
const DEFAULT_DESCRIPTION =
  "Chauffeur-driven car rentals from ₹14/km and curated tour packages across South India. GPS-tracked fleet, verified drivers, 24/7 support. Book online.";
const DEFAULT_CANONICAL = `${SITE_ORIGIN}/`;

function setCanonical(href) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

// Per-route <head> management without a dependency. The SPA serves every
// route from the same document, so title/description/canonical/robots are
// swapped on mount and restored to the site defaults on unmount.
//
// `canonical` is a route path (e.g. "/vehicles"); it is resolved against the
// production origin so each indexable route advertises its own canonical URL.
export default function useDocumentMeta({
  title,
  description,
  canonical,
  noindex = false,
} = {}) {
  useEffect(() => {
    document.title = title || DEFAULT_TITLE;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description || DEFAULT_DESCRIPTION;

    setCanonical(canonical ? canonicalUrl(canonical) : DEFAULT_CANONICAL);

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
      setCanonical(DEFAULT_CANONICAL);
      const rob = document.querySelector('meta[name="robots"]');
      if (rob) rob.remove();
    };
  }, [title, description, canonical, noindex]);
}
