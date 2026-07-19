// Booking-form vehicle options with indicative pricing.
//
// Mirrors the fleet data in components/Fleet.jsx (and the JSON-LD in
// client/index.html) WITHOUT importing it — Fleet.jsx is presentation-owned and
// this module is the single source the booking flow reads. Keep the two in sync
// when tariffs change.
//
//   perKm      -> outstation rate (₹/km), shown in the dropdown label
//   eightHours -> local 8h/80km package price (₹), used as the indicative fare

export const VEHICLE_OPTIONS = [
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
 * Resolve a fleet-card vehicle name (Fleet.jsx `vehicle.name`) to its option,
 * used to preselect the dropdown when the user clicked "Book Now" on a card.
 * Case-insensitive exact match on the label; returns null when unknown.
 */
export const findVehicleByName = (name) => {
  const n = String(name || "").trim().toLowerCase();
  if (!n) return null;
  return VEHICLE_OPTIONS.find((v) => v.label.toLowerCase() === n) || null;
};

/** Resolve a stored dropdown value (label — ₹N/km) back to its option. */
export const findVehicleByValue = (value) =>
  VEHICLE_OPTIONS.find((v) => vehicleOptionText(v) === value) || null;
