import React from "react";
import { LegalPage, Section, Bullets } from "../components/common/LegalPage";
import useDocumentMeta from "../hooks/useDocumentMeta";

export default function Refund() {
  useDocumentMeta({
    title: "Refund & Cancellation Policy | Road Cruise",
    description:
      "Cancellation windows and refund timelines for Road Cruise vehicle rentals and tour packages, and how refunds reach your bank.",
  });
  return (
    <LegalPage
      badge="Legal"
      title="Refund & Cancellation Policy"
      intro="Our cancellation windows and how refunds are processed for Road Cruise bookings."
      updated="July 2026"
    >
      <Section title="1. Cancellation by the Customer">
        <p>You can cancel a booking by contacting our team. Cancellation charges depend on how far in advance you cancel:</p>
        <Bullets items={[
          "More than 48 hours before pickup — full refund of any amount paid.",
          "24–48 hours before pickup — 75% refund.",
          "12–24 hours before pickup — 50% refund.",
          "Less than 12 hours before pickup, or a no-show — no refund.",
        ]} />
        <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
          Tour packages and peak-season / group departures may carry different terms, which will be communicated to you
          at the time of booking.
        </p>
      </Section>

      <Section title="2. Cancellation by Road Cruise">
        <p>
          In the rare event that we must cancel a confirmed booking (for example, due to a vehicle breakdown we cannot
          substitute, or unsafe conditions), you will receive a full refund, or the option to reschedule at no extra
          cost.
        </p>
      </Section>

      <Section title="3. How Refunds Are Processed">
        <Bullets items={[
          "Refunds are issued to the original payment method used at booking.",
          "Once approved, refunds are typically initiated within 2 business days.",
          "Depending on your bank or payment provider, it may take 5–7 business days to reflect in your account.",
          "Pay-on-arrival bookings that are cancelled before payment have nothing to refund.",
        ]} />
      </Section>

      <Section title="4. Modifications & Rescheduling">
        <p>
          Need to change your dates, pickup time or vehicle? Contact us as early as possible and we will do our best to
          accommodate the change. Rescheduling is subject to availability and any fare difference.
        </p>
      </Section>

      <Section title="5. How to Request a Refund or Cancellation">
        <p>
          Share your booking reference (for example, RDZ001) along with your request by email at
          {" "}<a href="mailto:info@roadcruise.in" className="text-gold hover:underline">info@roadcruise.in</a> or
          call <a href="tel:+917338899062" className="text-gold hover:underline">+91 73388 99062</a> / <a href="tel:+917338899063" className="text-gold hover:underline">+91 73388 99063</a>.
          Our team is available 24/7.
        </p>
      </Section>
    </LegalPage>
  );
}
