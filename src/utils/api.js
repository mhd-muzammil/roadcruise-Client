// API base URL. Configurable per environment via VITE_API_URL (set it in a .env
// file for production, e.g. VITE_API_URL=https://api.yourdomain.com/api). Falls
// back to localhost for local development. No longer hard-wired to localhost.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
