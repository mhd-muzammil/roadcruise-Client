// API base URL. Configurable per environment via VITE_API_URL (set it in a .env
// file for production, e.g. VITE_API_URL=https://api.yourdomain.com/api). Falls
// back to localhost for local development. No longer hard-wired to localhost.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// API origin = BASE_URL without the trailing "/api". Admin-uploaded media is
// served by the backend at "/uploads/…" (a different origin than this SPA on
// Vercel), so relative media paths must be resolved against the API origin.
export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

/**
 * Resolve a media URL for <img>/<video>. Absolute http(s) URLs (e.g. the seed
 * Pinterest images) pass through unchanged; relative "/uploads/…" paths get the
 * API origin prepended so they load from the backend, not the SPA.
 */
export const mediaUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`;
};

// The logged-in user (with accessToken) is persisted under "rc_user" by App.jsx.
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("rc_user") || "null");
  } catch {
    return null;
  }
};

/** Build headers, attaching the Bearer access token when signed in. */
const authHeaders = (extra = {}) => {
  const user = getStoredUser();
  const headers = { ...extra };
  if (user?.accessToken) headers["Authorization"] = `Bearer ${user.accessToken}`;
  return headers;
};

/** Parse an error body into a thrown Error (used for non-2xx responses). */
const throwError = async (res, fallback) => {
  let msg = fallback;
  try {
    const err = await res.json();
    msg = err.error || err.warning || fallback;
  } catch { /* non-JSON body */ }
  const e = new Error(msg);
  e.status = res.status;
  throw e;
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) return throwError(res, "Login failed");
  return res.json();
};

export const registerUser = async (name, email, phone, password) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password })
  });
  if (!res.ok) return throwError(res, "Registration failed");
  return res.json();
};

// --- Phone (SMS) OTP login (public, rate-limited server-side) ---

/**
 * Step 1: ask the server to SMS a one-time code to a mobile number.
 * Responds identically for known and unknown numbers — never branch the UI on
 * whether an account exists, because the server deliberately does not say.
 * `isNewUser` is safe to use only for cosmetics (e.g. asking for a name).
 * A 429 here means the per-number resend cooldown is still running.
 */
export const requestPhoneOtp = async (phone) => {
  const res = await fetch(`${BASE_URL}/auth/otp/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone })
  });
  if (!res.ok) return throwError(res, "Could not send the code. Please try again.");
  return res.json();
};

/**
 * Step 2: exchange the code for a session. Returns the SAME shape as
 * loginUser (user + accessToken + refreshToken), so callers store it identically.
 * Creates the account on first successful verify.
 */
export const verifyPhoneOtp = async ({ phone, code, name }) => {
  const res = await fetch(`${BASE_URL}/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code, name })
  });
  if (!res.ok) return throwError(res, "That code is incorrect or has expired.");
  return res.json();
};

// --- Password recovery (public, rate-limited server-side) ---

/**
 * Request a password-reset email. The server ALWAYS responds ok (it never
 * reveals whether the account exists), so callers should show a neutral
 * "if an account exists, we've sent a link" message regardless.
 */
export const requestPasswordReset = async (email) => {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!res.ok) return throwError(res, "Could not send the reset link. Please try again.");
  return res.json();
};

/**
 * Complete a password reset using the single-use token from the emailed link.
 * On success the server revokes all existing sessions, so the user must sign
 * in again with the new password.
 */
export const resetPassword = async ({ email, token, newPassword }) => {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token, newPassword })
  });
  if (!res.ok) return throwError(res, "Could not reset your password. The link may have expired.");
  return res.json();
};

/**
 * Verify an email address using the single-use token from the emailed link.
 */
export const verifyEmail = async ({ email, token }) => {
  const res = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token })
  });
  if (!res.ok) return throwError(res, "Could not verify your email. The link may have expired.");
  return res.json();
};

/**
 * Request a fresh verification email. Always acknowledged generically — the
 * server never reveals whether the account exists or is already verified.
 */
export const resendVerification = async (email) => {
  const res = await fetch(`${BASE_URL}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!res.ok) return throwError(res, "Could not send the verification email. Please try again.");
  return res.json();
};

// Fetch public OAuth config (mode + Google client id) for the GIS button.
export const getGoogleConfig = async () => {
  const res = await fetch(`${BASE_URL}/auth/google/config`);
  if (!res.ok) throw new Error("Failed to load Google config");
  return res.json();
};

// Request a one-time nonce for replay protection.
export const getAuthNonce = async () => {
  const res = await fetch(`${BASE_URL}/auth/nonce`);
  if (!res.ok) throw new Error("Failed to get nonce");
  return res.json();
};

// Exchange a Google ID token for the ERP user (same payload shape as loginUser).
export const googleLoginUser = async (idToken, nonce) => {
  const res = await fetch(`${BASE_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, nonce })
  });
  if (!res.ok) return throwError(res, "Google sign-in failed");
  return res.json();
};

// --- Bookings (all require a signed-in user; token attached automatically) ---

export const fetchBookings = async () => {
  const res = await fetch(`${BASE_URL}/bookings`, { headers: authHeaders() });
  if (!res.ok) return throwError(res, "Failed to fetch bookings");
  return res.json();
};

/**
 * Create a booking. Returns { booking, payment, checkout? }.
 *   payment === "required"    -> `checkout` holds the params to open the
 *                                Razorpay widget; the booking is PendingPayment.
 *   payment === "on_arrival"  -> pay-on-arrival booking, awaiting admin approval.
 *   payment === "unavailable" -> online payment was not possible; booking pending.
 */
export const createBooking = async (bookingData) => {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(bookingData)
  });
  if (!res.ok) return throwError(res, "Failed to create booking");
  return res.json();
};

export const updateBooking = async (id, updateData) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(updateData)
  });
  if (!res.ok) return throwError(res, "Failed to update booking");
  return res.json();
};

export const deleteBooking = async (id) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) return throwError(res, "Failed to delete booking");
  return res.json();
};

/**
 * Cancel a booking. A customer may cancel their own booking; admins/staff can
 * cancel any. The server frees the held vehicle unit and emails the customer.
 * Returns the updated booking (status "Cancelled").
 */
export const cancelBooking = async (id) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}/cancel`, {
    method: "PATCH",
    headers: authHeaders()
  });
  if (!res.ok) return throwError(res, "Failed to cancel booking");
  return res.json();
};

/**
 * Modify a booking's trip details (owner only; staff can modify any). Editable
 * fields: fromDate, toDate, pickup, drop, passengers, pickupTime, notes — the
 * fare/vehicle/status never change here. The server notifies the customer and
 * the business inbox. Returns the updated booking.
 */
export const modifyBooking = async (id, changes) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}/modify`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(changes)
  });
  if (!res.ok) return throwError(res, "Could not update your booking");
  return res.json();
};

/**
 * Download the booking's invoice (owner only) — a self-contained HTML document
 * (print-friendly; "Print → Save as PDF" in the browser gives a PDF). Returns
 * a Blob the caller turns into a download link.
 */
export const downloadBookingInvoice = async (id) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}/invoice`, { headers: authHeaders() });
  if (!res.ok) return throwError(res, "Could not download the invoice");
  return res.blob();
};

// --- Contact / enquiry (public — no auth) ---

/**
 * Submit the "Contact Us" enquiry. Fires an email to the business inbox and an
 * acknowledgement to the enquirer (handled server-side via the notification
 * engine). Returns the server ack; throws on validation/other errors.
 */
export const submitEnquiry = async ({ name, email, phone, subject, message }) => {
  const res = await fetch(`${BASE_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, subject, message })
  });
  if (!res.ok) return throwError(res, "Could not send your message. Please try again.");
  return res.json();
};

// --- Payments ---

/**
 * Create (or reuse) a payment order for an EXISTING booking — used by the
 * "Pay Now" button on My Bookings. Returns { payment, checkout, alreadyPaid? }.
 */
export const createPaymentOrder = async (bookingId) => {
  const res = await fetch(`${BASE_URL}/payments/orders`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ bookingId })
  });
  if (!res.ok) return throwError(res, "Could not start payment");
  return res.json();
};

/**
 * PREVIEW ONLY (mock gateway). Ask the server for a validly-signed checkout
 * result so the demo "pay online" flow can complete without a Razorpay account.
 * The server refuses this unless PAYMENT_PROVIDER=mock and not in production.
 */
export const simulateMockCheckout = async (orderId) => {
  const res = await fetch(`${BASE_URL}/payments/mock/checkout`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ orderId })
  });
  if (!res.ok) return throwError(res, "Could not start the test payment");
  return res.json();
};

/**
 * Verify a completed checkout with the server. The server re-checks the
 * gateway signature and only then captures + confirms the booking. This is the
 * trust anchor — the browser is never believed on its own.
 */
export const verifyPayment = async ({ orderId, paymentId, signature }) => {
  const res = await fetch(`${BASE_URL}/payments/verify`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ orderId, paymentId, signature })
  });
  if (!res.ok) return throwError(res, "Payment verification failed");
  return res.json();
};

// --- Places (public geo proxy for the trip planner; no keys in the browser) ---

/**
 * Autocomplete suggestions for a partial place name. Returns an array of
 * { id, name, label, lat, lon } (India-only, biased to the fleet's home base).
 */
export const searchPlaces = async (q) => {
  const res = await fetch(`${BASE_URL}/places/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) return throwError(res, "Place search is unavailable right now");
  return res.json();
};

/**
 * Driving route between two points. Returns { distanceKm, durationMin,
 * estimated } — `estimated: true` means the road router was unreachable and
 * the server answered with a road-factor straight-line approximation.
 */
export const getDrivingRoute = async ({ fromLat, fromLon, toLat, toLon }) => {
  const qs = new URLSearchParams({ fromLat, fromLon, toLat, toLon });
  const res = await fetch(`${BASE_URL}/places/route?${qs}`);
  if (!res.ok) return throwError(res, "Could not calculate the route");
  return res.json();
};

// --- Reviews (public — no auth) ---

/**
 * Fetch approved customer reviews, newest first (server caps at 50).
 * Returns an array of { id, name, role, rating, text, avatar, createdAt }.
 */
export const getReviews = async () => {
  const res = await fetch(`${BASE_URL}/reviews`);
  if (!res.ok) return throwError(res, "Failed to load reviews");
  return res.json();
};

/**
 * Submit a guest review: { name, role?, rating (1-5), text (10-600 chars) }.
 * The server validates, strips HTML, rejects links, and rate-limits per IP.
 * Returns { review } — the sanitized review as stored.
 */
export const submitReview = async ({ name, role, rating, text }) => {
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, role, rating, text })
  });
  if (!res.ok) return throwError(res, "Could not submit your review. Please try again.");
  return res.json();
};

// --- Vehicles (public browse; admin CRUD + media + availability) ---

/** Public fleet list, each vehicle with { totalUnits, heldCount, available }. */
export const getVehicles = async () => {
  const res = await fetch(`${BASE_URL}/vehicles`);
  if (!res.ok) return throwError(res, "Failed to load vehicles");
  return res.json();
};

/** Admin fleet list — includes `heldBookings` for the "Free" controls. */
export const getAdminVehicles = async () => {
  const res = await fetch(`${BASE_URL}/vehicles/admin`, { headers: authHeaders() });
  if (!res.ok) return throwError(res, "Failed to load vehicles");
  return res.json();
};

export const createVehicle = async (data) => {
  const res = await fetch(`${BASE_URL}/vehicles`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!res.ok) return throwError(res, "Failed to create vehicle");
  return res.json();
};

export const updateVehicle = async (id, data) => {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!res.ok) return throwError(res, "Failed to update vehicle");
  return res.json();
};

export const deleteVehicle = async (id) => {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) return throwError(res, "Failed to delete vehicle");
  return res.json();
};

/** Upload one or more photos/videos to a vehicle (multipart; token attached). */
export const uploadVehicleMedia = async (id, files) => {
  const fd = new FormData();
  [...files].forEach((f) => fd.append("files", f));
  const res = await fetch(`${BASE_URL}/vehicles/${id}/media`, {
    method: "POST",
    headers: authHeaders(), // no Content-Type — the browser sets the multipart boundary
    body: fd,
  });
  if (!res.ok) return throwError(res, "Failed to upload media");
  return res.json();
};

/** Free the vehicle unit held by a booking (admin, e.g. after the trip). */
export const releaseVehicleHold = async (bookingId) => {
  const res = await fetch(`${BASE_URL}/vehicles/holds/${bookingId}/release`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) return throwError(res, "Failed to free vehicle");
  return res.json();
};

// --- Gallery (public list; admin upload/delete) ---

export const getGallery = async () => {
  const res = await fetch(`${BASE_URL}/gallery`);
  if (!res.ok) return throwError(res, "Failed to load the gallery");
  return res.json();
};

export const uploadGalleryMedia = async (files, caption = "") => {
  const fd = new FormData();
  [...files].forEach((f) => fd.append("files", f));
  if (caption) fd.append("caption", caption);
  const res = await fetch(`${BASE_URL}/gallery`, { method: "POST", headers: authHeaders(), body: fd });
  if (!res.ok) return throwError(res, "Failed to upload media");
  return res.json();
};

export const deleteGalleryItem = async (id) => {
  const res = await fetch(`${BASE_URL}/gallery/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) return throwError(res, "Failed to delete media");
  return res.json();
};

// --- Promotions (admin-created travel-package popup shown on site open) ---

/** The newest active promo for the public popup, or null when none is live. */
export const getActivePromo = async () => {
  const res = await fetch(`${BASE_URL}/promos/active`);
  if (!res.ok) return throwError(res, "Failed to load promotions");
  return res.json();
};

/** Admin list — every promo (active + inactive), newest first. */
export const getAdminPromos = async () => {
  const res = await fetch(`${BASE_URL}/promos`, { headers: authHeaders() });
  if (!res.ok) return throwError(res, "Failed to load promotions");
  return res.json();
};

/**
 * Create a promo (admin). `fields` = { title, tagline, duration, price,
 * highlights (newline-separated string) }; `imageFile` is optional.
 */
export const createPromo = async (fields, imageFile) => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => v !== undefined && v !== null && fd.append(k, v));
  if (imageFile) fd.append("image", imageFile);
  const res = await fetch(`${BASE_URL}/promos`, { method: "POST", headers: authHeaders(), body: fd });
  if (!res.ok) return throwError(res, "Failed to create promotion");
  return res.json();
};

/** Partial update (admin) — e.g. { active: false } to unpublish. */
export const updatePromo = async (id, data) => {
  const res = await fetch(`${BASE_URL}/promos/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!res.ok) return throwError(res, "Failed to update promotion");
  return res.json();
};

export const deletePromo = async (id) => {
  const res = await fetch(`${BASE_URL}/promos/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) return throwError(res, "Failed to delete promotion");
  return res.json();
};
