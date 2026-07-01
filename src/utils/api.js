const BASE_URL = "http://localhost:5000/api";

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  return res.json();
};

export const registerUser = async (name, email, phone, password) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }
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
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Google sign-in failed");
  }
  return res.json();
};

export const fetchBookings = async () => {
  const res = await fetch(`${BASE_URL}/bookings`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
};

export const createBooking = async (bookingData) => {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData)
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
};

export const updateBooking = async (id, updateData) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData)
  });
  if (!res.ok) throw new Error("Failed to update booking");
  return res.json();
};

export const deleteBooking = async (id) => {
  const res = await fetch(`${BASE_URL}/bookings/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete booking");
  return res.json();
};
