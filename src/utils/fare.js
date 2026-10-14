// Trip-planner helpers (hero widget -> results -> checkout). Prices are NOT
// computed here: POST /api/bookings/quote prices every vehicle server-side and
// the booking is re-priced by the same code, so the browser only displays the
// server's breakdown (see components/booking/FareBreakdown.jsx).

export const TRIP_TYPES = [
  { key: "airport", label: "Airport Transfers", short: "Airport Transfer" },
  { key: "oneway", label: "Outstation One-Way", short: "Outstation One-Way" },
  { key: "roundtrip", label: "Outstation Round-Trip", short: "Outstation Round-Trip" },
  { key: "hourly", label: "Hourly Rentals", short: "Hourly Rental" },
];

export const tripTypeByKey = (key) => TRIP_TYPES.find((t) => t.key === key) || null;

// Hourly package choices for the planner's select. The server prices each from
// the vehicle's localPricing and stores the chosen duration on the booking.
export const HOURLY_PACKAGES = [
  { key: "4h40", label: "4 hrs 40 kms", hours: 4, kms: 40 },
  { key: "8h80", label: "8 hrs 80 kms", hours: 8, kms: 80 },
  { key: "12h120", label: "12 hrs 120 kms", hours: 12, kms: 120 },
];

export const hourlyPackageByKey = (key) =>
  HOURLY_PACKAGES.find((p) => p.key === key) || HOURLY_PACKAGES[1]; // default 8h/80km

// Intermediate stops: outstation trips only, same limit the server enforces.
export const STOP_TRIP_TYPES = ["oneway", "roundtrip"];
export const MAX_STOPS = 5;

// GST added on top of every booking subtotal. Display-only mirror of the
// server's GST_RATE_PERCENT, used where a price is shown before the server has
// priced it (the classic booking form); the booking stores the server's figure.
export const GST_RATE_PERCENT = 5;
export const withGst = (subtotal) => {
  const base = Math.round(Number(subtotal || 0) * 100) / 100;
  const gst = Math.round(base * GST_RATE_PERCENT) / 100;
  return { subtotal: base, gstRate: GST_RATE_PERCENT, gstAmount: gst, total: Math.round((base + gst) * 100) / 100 };
};

/** "12,345" / "12,345.50" formatting for rupee amounts (paise shown only when present). */
export const formatINR = (n) => {
  const v = Number(n || 0);
  const d = Number.isInteger(v) ? 0 : 2;
  return v.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
};

/**
 * The server's stored price breakdown for a booking. Bookings made before
 * itemised pricing existed carry only `fare`, so they get one line and no GST
 * split rather than a guessed one.
 */
export const bookingPricing = (b = {}) =>
  b.pricing && Array.isArray(b.pricing.lines)
    ? b.pricing
    : {
        source: "legacy",
        lines: [{ key: "fare", label: "Trip fare", detail: "", amount: Number(b.fare) || 0 }],
        subtotal: Number(b.fare) || 0,
        gstRate: null,
        gstAmount: null,
        total: Number(b.fare) || 0,
      };

/**
 * Booking distance for display. Round trips show both legs, e.g.
 * "670 km × 2 (up & down) = 1,340 km" (from the stored pricing).
 */
export const distanceText = (b = {}) => {
  const p = b.pricing || {};
  const n = (v) => Number(v).toLocaleString("en-IN");
  if (p.roundTripKm && p.oneWayKm) return `${n(p.oneWayKm)} km × 2 (up & down) = ${n(p.roundTripKm)} km`;
  return b.distanceKm ? `${n(b.distanceKm)} km` : "";
};

/** The POST /api/bookings `trip` payload for a decoded search. */
export const tripFromSearch = (search) => ({
  type: search.type,
  pickup: search.pickup,
  drop: search.type === "hourly" ? null : search.drop,
  stops: STOP_TRIP_TYPES.includes(search.type) ? search.stops || [] : [],
  date: search.date,
  time: search.time,
  returnDate: search.type === "roundtrip" ? search.returnDate : "",
  returnTime: search.type === "roundtrip" ? search.returnTime : "",
  pkg: search.type === "hourly" ? search.pkg : "",
});

// ---------------------------------------------------------------------------
// Search <-> URL round-trip. The results page lives at /book/results?…, so a
// refresh, a shared link, or the browser back button all reconstruct the exact
// search. Coordinates travel with the labels so no re-geocoding is needed.
// ---------------------------------------------------------------------------

const isCoord = (v) => Number.isFinite(Number(v));

export function encodeSearch(search) {
  const p = new URLSearchParams();
  p.set("type", search.type);
  p.set("p", search.pickup.label);
  p.set("plat", String(search.pickup.lat));
  p.set("plon", String(search.pickup.lon));
  p.set("date", search.date);
  p.set("time", search.time);
  if (search.type !== "hourly" && search.drop) {
    p.set("d", search.drop.label);
    p.set("dlat", String(search.drop.lat));
    p.set("dlon", String(search.drop.lon));
  }
  if (STOP_TRIP_TYPES.includes(search.type)) {
    for (const st of search.stops || []) p.append("s", `${st.lat},${st.lon},${st.label}`);
  }
  if (search.type === "roundtrip") {
    p.set("rdate", search.returnDate);
    if (search.returnTime) p.set("rtime", search.returnTime);
  }
  if (search.type === "hourly") p.set("pkg", search.pkg || "8h80");
  return p;
}

/** Rebuild the search object from URL params. Returns null when incomplete. */
export function decodeSearch(params) {
  const type = params.get("type");
  if (!TRIP_TYPES.some((t) => t.key === type)) return null;
  const pickup = {
    label: params.get("p") || "",
    lat: Number(params.get("plat")),
    lon: Number(params.get("plon")),
  };
  const date = params.get("date") || "";
  const time = params.get("time") || "";
  if (!pickup.label || !isCoord(pickup.lat) || !isCoord(pickup.lon) || !date || !time) return null;

  const search = { type, pickup, drop: null, stops: [], date, time, returnDate: "", returnTime: "", pkg: "" };

  if (type !== "hourly") {
    const drop = {
      label: params.get("d") || "",
      lat: Number(params.get("dlat")),
      lon: Number(params.get("dlon")),
    };
    if (!drop.label || !isCoord(drop.lat) || !isCoord(drop.lon)) return null;
    search.drop = drop;
  }
  if (STOP_TRIP_TYPES.includes(type)) {
    // "lat,lon,label" — the label may itself contain commas.
    for (const raw of params.getAll("s").slice(0, MAX_STOPS)) {
      const [lat, lon, ...rest] = raw.split(",");
      const stop = { label: rest.join(",").trim(), lat: Number(lat), lon: Number(lon) };
      if (!stop.label || !isCoord(lat) || !isCoord(lon)) return null;
      search.stops.push(stop);
    }
  }
  if (type === "roundtrip") {
    search.returnDate = params.get("rdate") || "";
    search.returnTime = params.get("rtime") || "";
    if (!search.returnDate) return null;
  }
  if (type === "hourly") search.pkg = params.get("pkg") || "8h80";
  return search;
}

/** "2026-08-04" -> "04 Aug 2026" for summaries. */
export const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/** "14:00" -> "2:00 PM" for summaries. */
export const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = String(t).split(":").map(Number);
  if (!Number.isFinite(h)) return t;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m || 0).padStart(2, "0")} ${ampm}`;
};

/** Current local time as "HH:mm" — the default pickup time in pickers. */
export const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** "0 hrs 32 min" from minutes, for the distance banner + ride details. */
export const fmtDuration = (mins) => {
  const m = Math.max(0, Math.round(Number(mins) || 0));
  return `${Math.floor(m / 60)} hr${Math.floor(m / 60) === 1 ? "" : "s"} ${m % 60} min`;
};

/**
 * Preview a coupon on a server quote: the discount comes off the pre-GST
 * subtotal and GST is recomputed — the same rule the server applies when the
 * booking is created (the server's figure is the one charged).
 * applied: { code, type, value, discount } from POST /coupons/apply.
 */
export function withCoupon(pricing, applied) {
  if (!pricing || !applied?.discount) return pricing;
  const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  const gross = r2(pricing.lines.reduce((s, l) => s + Number(l.amount || 0), 0));
  const subtotal = r2(gross - Math.min(gross, applied.discount));
  const gstRate = Number(pricing.gstRate) || 0;
  const gstAmount = r2((subtotal * gstRate) / 100);
  return {
    ...pricing,
    grossSubtotal: gross,
    discount: r2(gross - subtotal),
    coupon: { code: applied.code, type: applied.type, value: applied.value },
    subtotal,
    gstAmount,
    total: r2(subtotal + gstAmount),
  };
}

/** Pre-GST subtotal of a quote (what coupon minimums are measured against). */
export const grossOf = (pricing) =>
  Math.round((pricing?.lines || []).reduce((s, l) => s + Number(l.amount || 0), 0) * 100) / 100;

// 15-char GSTIN: state code, PAN, entity no., "Z", check character.
export const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
