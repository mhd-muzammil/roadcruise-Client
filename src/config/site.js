// Canonical production origin — the origin this app is currently deployed and
// served from. Canonical <link> tags and public/sitemap.xml must use the same
// origin. When a custom domain (e.g. https://roadcruise.in) is connected and
// actually serving this app, update this single value (or wire it to a
// VITE_SITE_URL env var) and every route canonical follows automatically.
export const SITE_ORIGIN = "https://roadcruise-client.vercel.app";

// Build an absolute canonical URL from a route path (e.g. "/vehicles").
export const canonicalUrl = (path = "/") =>
  `${SITE_ORIGIN}${path === "/" ? "/" : path.replace(/\/$/, "")}`;
