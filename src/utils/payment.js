import { createPaymentOrder, simulateMockCheckout, verifyPayment } from "./api";

// Razorpay hosted checkout, loaded on demand.
const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";
export function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = RAZORPAY_SRC;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Open a checkout for an ALREADY-CREATED payment order and verify it
 * server-side. Handles both the real Razorpay widget and the mock preview
 * gateway. Shared by "Pay Now" on My Bookings and the trip-planner checkout.
 *
 * co       — the `checkout` object returned by the server.
 * prefill  — { name, contact, email, description }.
 *
 * Resolves { status: "paid" }; rejects on dismissal/verification failure.
 */
export async function payWithCheckout(co, prefill = {}) {
  if (!co || !co.orderId) throw new Error("Could not start payment for this booking.");

  // Mock gateway (no real Razorpay account): use the signed preview checkout.
  if (co.provider !== "razorpay") {
    const sig = await simulateMockCheckout(co.orderId);
    await verifyPayment({ orderId: sig.orderId, paymentId: sig.paymentId, signature: sig.signature });
    return { status: "paid" };
  }

  const ok = await loadRazorpay();
  if (!ok) throw new Error("Could not load the secure payment window. Check your connection and try again.");

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: co.keyId,
      order_id: co.orderId,
      amount: co.amount,
      currency: co.currency,
      name: "Road Cruise",
      description: prefill.description || "Booking",
      prefill: { name: prefill.name || "", contact: prefill.contact || "", email: prefill.email || "" },
      theme: { color: "#D4AF37" },
      handler: async (resp) => {
        try {
          await verifyPayment({
            orderId: resp.razorpay_order_id,
            paymentId: resp.razorpay_payment_id,
            signature: resp.razorpay_signature,
          });
          resolve({ status: "paid" });
        } catch (e) {
          reject(new Error(e.message || "We couldn't verify your payment. If you were charged, contact support."));
        }
      },
      modal: { ondismiss: () => reject(new Error("Payment was not completed.")) },
    });
    rzp.open();
  });
}

/**
 * Pay for an EXISTING (unpaid) booking end-to-end. Creates/reuses the order,
 * then runs the shared checkout. Resolves { status: "paid" | "already_paid" }.
 */
export async function payForBooking(booking, user) {
  const order = await createPaymentOrder(booking.id);
  if (order.alreadyPaid) return { status: "already_paid" };
  return payWithCheckout(order.checkout, {
    name: booking.name || "",
    contact: booking.phone || "",
    email: user?.email || "",
    description: booking.item || "Booking",
  });
}
