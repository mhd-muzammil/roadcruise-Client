import React from "react";
import { Link } from "react-router-dom";
import { LegalPage, Section, Bullets } from "../components/common/LegalPage";
import useDocumentMeta from "../hooks/useDocumentMeta";

export default function Terms() {
  useDocumentMeta({
    title: "Terms of Service | Road Cruise",
    description:
      "The terms governing vehicle rental and tour package bookings with Road Cruise — fares, tolls, payments, cancellations and responsibilities.",
  });
  return (
    <LegalPage
      badge="Legal"
      title="Terms of Service"
      intro="Please read these terms carefully before booking a vehicle or tour package with Road Cruise."
      updated="July 2026"
    >
      <Section title="1. Agreement">
        <p>
          These Terms of Service ("Terms") govern your use of the Road Cruise website and our vehicle rental and tour
          package services. By making a booking or using our services, you agree to be bound by these Terms. If you do
          not agree, please do not use our services.
        </p>
      </Section>

      <Section title="2. Bookings & Confirmation">
        <Bullets items={[
          "A booking request is confirmed only after our team verifies availability and, where applicable, payment.",
          "Fares shown online are indicative estimates. The final fare depends on distance, duration, tolls, permits, and your specific requirements, and will be confirmed by our team.",
          "You are responsible for providing accurate trip details — pickup/drop locations, dates, passenger count, and contact information.",
          "You must be at least 18 years of age to make a booking.",
        ]} />
      </Section>

      <Section title="3. Fares, Tolls & Extra Charges">
        <p>Unless expressly included in a package, the following are charged separately and are payable by the customer:</p>
        <Bullets items={[
          "Toll gate fees, parking charges and state entry taxes / permits.",
          "Hill station entry charges where applicable.",
          "Driver night allowance (typically ₹200–₹500) for driving between 10:00 PM and 5:00 AM, varying by vehicle.",
          "Additional kilometres or hours beyond the selected package, at the per-km / per-hour rate for that vehicle.",
        ]} />
      </Section>

      <Section title="4. Payments">
        <p>
          We accept secure online payments (card, UPI, net banking) via our payment gateway, as well as pay-on-arrival
          for eligible bookings. Online payments are processed by a third-party gateway; we do not store your card
          details. A booking marked "pay on arrival" is held pending and confirmed by our team.
        </p>
      </Section>

      <Section title="5. Cancellations & Refunds">
        <p>
          Cancellations and refunds are governed by our <Link to="/refund" className="text-gold hover:underline">Refund Policy</Link>.
          Refund timelines depend on your bank or payment provider.
        </p>
      </Section>

      <Section title="6. Customer Responsibilities">
        <Bullets items={[
          "Treat our vehicles, drivers and staff with respect. Any damage caused to the vehicle by the customer may be chargeable.",
          "Carrying or consuming illegal substances in our vehicles is strictly prohibited.",
          "The number of passengers must not exceed the vehicle's seating capacity for safety and legal compliance.",
          "Be ready at the agreed pickup point on time; waiting charges may apply for significant delays.",
        ]} />
      </Section>

      <Section title="7. Liability">
        <p>
          Road Cruise operates with professional, verified drivers and maintained vehicles. However, we are not liable
          for delays or losses caused by circumstances beyond our reasonable control, including traffic, weather,
          road closures, strikes, or other force-majeure events. Our maximum liability for any claim is limited to the
          amount paid for the affected booking.
        </p>
      </Section>

      <Section title="8. Changes to These Terms">
        <p>
          We may update these Terms from time to time. The latest version will always be available on this page, with
          the revision date shown above. Continued use of our services after changes constitutes acceptance.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          Questions about these Terms? Email <a href="mailto:info@roadcruise.in" className="text-gold hover:underline">info@roadcruise.in</a> or
          call <a href="tel:+917338899062" className="text-gold hover:underline">+91 73388 99062</a> / <a href="tel:+917338899063" className="text-gold hover:underline">+91 73388 99063</a>.
        </p>
      </Section>
    </LegalPage>
  );
}
