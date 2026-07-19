// Canonical production origin — the custom domain this app is served from.
// Canonical <link> tags and public/sitemap.xml must use the same origin.
// The old https://roadcruise-client.vercel.app deployment should 301/308 to
// this domain (configured in the Vercel dashboard once the domain is primary).
export const SITE_ORIGIN = "https://roadcruise.in";

// Build an absolute canonical URL from a route path (e.g. "/vehicles").
export const canonicalUrl = (path = "/") =>
  `${SITE_ORIGIN}${path === "/" ? "/" : path.replace(/\/$/, "")}`;
