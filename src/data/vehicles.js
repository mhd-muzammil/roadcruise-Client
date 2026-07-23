// Booking-form vehicle options. These now come from the server (admin-managed
// inventory via GET /api/vehicles) rather than being hard-coded, so the booking
// dropdown, the Vehicles page, and the admin panel share ONE source of truth.
//
// A small static fallback (the original fleet) is kept so the booking form still
// works if the API is briefly unavailable. Helper shapes are unchanged so the
// rest of the booking flow (BookingModal) keeps working as before, with one
// addition: options now carry an `id` so the booking payload can send vehicleId
// and the server can enforce availability.
import { getVehicles } from "../utils/api";

//   perKm      -> outstation rate (₹/km), shown in the dropdown label
//   eightHours -> local 8h/80km package price (₹), used as the indicative fare
const STATIC_OPTIONS = [
  { id: "sedan", label: "Sedan (Dzire, Aura, Amaze)", perKm: 14, eightHours: 2300 },
  { id: "suv-any", label: "Any SUV (Ertiga, Marazzo, Kia Carens)", perKm: 18, eightHours: 3300 },
  { id: "kia-carens", label: "Kia Carens", perKm: 20, eightHours: 3500 },
  { id: "innova-crysta", label: "Innova Crysta", perKm: 22, eightHours: 4000 },
  { id: "innova-hycross", label: "Innova Hycross", perKm: 24, eightHours: 4400 },
  { id: "tt-12", label: "Tempo Traveller 12 A/C", perKm: 24, eightHours: 6000 },
  { id: "tt-18", label: "Tempo Traveller 18 A/C", perKm: 26, eightHours: 7000 },
  { id: "urbania", label: "Urbania 12+1", perKm: 35, eightHours: 10000 },
  { id: "minibus-21", label: "Mini Bus 21 Seater", perKm: 30, eightHours: 9000 },
  { id: "minibus-32", label: "Mini Bus 32 Seater", perKm: 50, eightHours: 12000 },
];

// Live options, replaced once the server list loads (see loadVehicleOptions()).
export let VEHICLE_OPTIONS = STATIC_OPTIONS;

/** Map a server vehicle to the booking-option shape used by the dropdown. */
const toOption = (v) => ({
  id: v.id,
  label: v.name,
  perKm: v.outstationRate,
  eightHours: v.localPricing?.eightHours || 0,
  available: v.available !== false,
});

/**
 * Fetch the fleet from the server and refresh VEHICLE_OPTIONS. Returns the new
 * options (falls back to the static list on any error). Callers can await this
 * and re-render, or ignore it and use the static default.
 */
export async function loadVehicleOptions() {
  try {
    const vehicles = await getVehicles();
    if (Array.isArray(vehicles) && vehicles.length) {
      VEHICLE_OPTIONS = vehicles.map(toOption);
    }
  } catch {
    VEHICLE_OPTIONS = STATIC_OPTIONS;
  }
  return VEHICLE_OPTIONS;
}

/** Neutral choice offered on general/package bookings. */
export const NO_PREFERENCE = "No preference (recommend for me)";

/**
 * Display + payload text for an option, e.g.
 * "Sedan (Dzire, Aura, Amaze) — ₹14/km". This exact string is what the booking
 * payload sends as `vehicle`, so the price label travels with the choice all
 * the way into the booking record and notification emails.
 */
export const vehicleOptionText = (v) => `${v.label} — ₹${v.perKm}/km`;

/**
 * Resolve a fleet-card vehicle name/id to its option, used to preselect the
 * dropdown when the user clicked "Book Now" on a card. Matches on id first
 * (exact), then case-insensitive label. Returns null when unknown.
 */
export const findVehicleByName = (name, options = VEHICLE_OPTIONS) => {
  const n = String(name || "").trim().toLowerCase();
  if (!n) return null;
  return options.find((v) => v.id === name || v.label.toLowerCase() === n) || null;
};

/** Resolve a stored dropdown value (label — ₹N/km) back to its option. */
export const findVehicleByValue = (value, options = VEHICLE_OPTIONS) =>
  options.find((v) => vehicleOptionText(v) === value) || null;
