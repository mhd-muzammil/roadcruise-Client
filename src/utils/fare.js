// Fare engine for the trip-planner flow (hero widget -> results -> checkout).
// Every quote is derived from the SAME admin-managed vehicle record served by
// GET /api/vehicles ({ outstationRate, driverBata, localPricing }), so admin
// rate edits flow straight into the quoted prices — no second rate table.
//
// Quotes are indicative (the site already frames fares that way); the billing
// conventions below are the standard Indian intercity-cab market rules and are
// centralized in FARE_RULES so the business can tune them in one place.

export const TRIP_TYPES = [
  { key: "airport", label: "Airport Transfers", short: "Airport Transfer" },
  { key: "oneway", label: "Outstation One-Way", short: "Outstation One-Way" },
  { key: "roundtrip", label: "Outstation Round-Trip", short: "Outstation Round-Trip" },
  { key: "hourly", label: "Hourly Rentals", short: "Hourly Rental" },
];

export const tripTypeByKey = (key) => TRIP_TYPES.find((t) => t.key === key) || null;

export const HOURLY_PACKAGES = [
  { key: "4h40", label: "4 hrs 40 kms", hours: 4, kms: 40, priceKey: "fourHours" },
  { key: "8h80", label: "8 hrs 80 kms", hours: 8, kms: 80, priceKey: "eightHours" },
  { key: "12h120", label: "12 hrs 120 kms", hours: 12, kms: 120, priceKey: "twelveHours" },
];

export const hourlyPackageByKey = (key) =>
  HOURLY_PACKAGES.find((p) => p.key === key) || HOURLY_PACKAGES[1]; // default 8h/80km

export const FARE_RULES = {
  airportMinKm: 30, // airport transfers bill at least this many km
  onewayMinKm: 130, // one-way OUTSTATION trips bill at least this many km
  roundtripMinKmPerDay: 250, // OUTSTATION round trips bill at least this many km per day
  // At/below this one-way distance a trip is a LOCAL drop (home -> airport,
  // suburb -> suburb), not an outstation run — the outstation minimums above
  // must NOT apply, or a 15 km hop gets billed as a 130 km trip.
  localTripKm: 50,
  freeWaitingMins: 30,
  advanceRate: 0.2, // 20% deposit option — keep in sync with the server's ADVANCE_RATE
};

/** "12,345" formatting for rupee amounts. */
export const formatINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

/** Whole days a round trip spans (same-day return = 1). */
export const tripDays = (fromDate, toDate) => {
  const a = new Date(`${fromDate}T00:00:00`);
  const b = new Date(`${toDate || fromDate}T00:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 1;
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
};

/**
 * Quote one vehicle for a search. Returns null when the vehicle can't serve
 * this trip type (e.g. no hourly package prices configured).
 *
 * search: { type, distanceKm?, days?, pkg? }
 * vehicle: the raw GET /api/vehicles record.
 *
 * Returns { fare, billKm, days, perKm, pkg, included: string[], excluded: string[] }
 */
export function quoteForVehicle(vehicle, search) {
  const perKm = Number(vehicle?.outstationRate) || 0;
  const bata = Number(vehicle?.driverBata) || 0;
  const local = vehicle?.localPricing || {};
  const type = search?.type;

  if (type === "hourly") {
    const pkg = hourlyPackageByKey(search?.pkg);
    const price = Number(local[pkg.priceKey]) || 0;
    if (price <= 0) return null;
    const extraKm = Number(local.extraKm) || 0;
    const extraHr = Number(local.extraHr) || 0;
    return {
      fare: Math.round(price),
      billKm: pkg.kms,
      days: 1,
      perKm,
      pkg,
      included: [
        `${pkg.hours} hours & ${pkg.kms} km included`,
        "Driver allowance",
        "Fuel & vehicle charges",
      ],
      excluded: [
        "Road tolls & parking, if any",
        extraKm ? `Extra km @ ₹${extraKm}/km` : "Extra km charged as per tariff",
        extraHr ? `Extra hour @ ₹${extraHr}/hr` : "Extra hours charged as per tariff",
      ],
    };
  }

  if (perKm <= 0) return null;
  const distanceKm = Math.max(1, Math.round(Number(search?.distanceKm) || 0));
  if (!distanceKm) return null;

  if (type === "airport") {
    const billKm = Math.max(distanceKm, FARE_RULES.airportMinKm);
    return {
      fare: Math.round(billKm * perKm),
      billKm,
      days: 1,
      perKm,
      pkg: null,
      included: [
        `${billKm} km included`,
        "Driver allowance",
        `${FARE_RULES.freeWaitingMins} mins free waiting from trip start`,
      ],
      excluded: [
        "Airport entry, tolls & parking, if any",
        `Travel beyond ${billKm} km @ ₹${perKm}/km`,
        `Waiting beyond ${FARE_RULES.freeWaitingMins} mins, as per tariff`,
      ],
    };
  }

  if (type === "oneway") {
    // Local drop vs genuine outstation: short trips bill actual km (min 30,
    // like an airport transfer, no outstation bata); the 130 km floor + bata
    // apply only beyond localTripKm.
    const isLocal = distanceKm <= FARE_RULES.localTripKm;
    const billKm = Math.max(distanceKm, isLocal ? FARE_RULES.airportMinKm : FARE_RULES.onewayMinKm);
    return {
      fare: Math.round(billKm * perKm + (isLocal ? 0 : bata)),
      billKm,
      days: 1,
      perKm,
      pkg: null,
      included: [
        `${billKm} km included`,
        isLocal || !bata ? "Driver allowance" : `Driver bata ₹${formatINR(bata)}`,
        "One-way drop — pay only for this direction",
      ],
      excluded: [
        "Road tolls, parking & interstate permits, if any",
        `Travel beyond ${billKm} km @ ₹${perKm}/km`,
        "Night driving allowance (11 PM – 5 AM), if applicable",
      ],
    };
  }

  if (type === "roundtrip") {
    const days = Math.max(1, Number(search?.days) || 1);
    // A same-day return within localTripKm is a local up-down (e.g. an airport
    // pick-up-and-return), not an outstation tour — bill both directions at
    // actual km (min 30 each way) instead of the 250 km/day outstation floor.
    // Driver bata still applies: the driver waits and drives back.
    const isLocal = days === 1 && distanceKm <= FARE_RULES.localTripKm;
    const billKm = isLocal
      ? Math.max(distanceKm * 2, FARE_RULES.airportMinKm * 2)
      : Math.max(distanceKm * 2, FARE_RULES.roundtripMinKmPerDay * days);
    return {
      fare: Math.round(billKm * perKm + bata * days),
      billKm,
      days,
      perKm,
      pkg: null,
      included: [
        `${formatINR(billKm)} km included (${days} day${days > 1 ? "s" : ""})`,
        bata
          ? `Driver bata ₹${formatINR(bata)}/day × ${days}`
          : "Driver allowance",
        "Vehicle at your disposal for the entire trip",
      ],
      excluded: [
        "Road tolls, parking & interstate permits, if any",
        `Travel beyond ${formatINR(billKm)} km @ ₹${perKm}/km`,
        ...(isLocal ? [] : [`Minimum billing ${FARE_RULES.roundtripMinKmPerDay} km/day`]),
      ],
    };
  }

  return null;
}

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

  const search = { type, pickup, drop: null, date, time, returnDate: "", returnTime: "", pkg: "" };

  if (type !== "hourly") {
    const drop = {
      label: params.get("d") || "",
      lat: Number(params.get("dlat")),
      lon: Number(params.get("dlon")),
    };
    if (!drop.label || !isCoord(drop.lat) || !isCoord(drop.lon)) return null;
    search.drop = drop;
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

/** "0 hrs 32 min" from minutes, for the distance banner + ride details. */
export const fmtDuration = (mins) => {
  const m = Math.max(0, Math.round(Number(mins) || 0));
  return `${Math.floor(m / 60)} hr${Math.floor(m / 60) === 1 ? "" : "s"} ${m % 60} min`;
};
