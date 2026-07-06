import React from "react";
import { LegalPage, Section, Bullets } from "../components/common/LegalPage";

export default function Privacy() {
  return (
    <LegalPage
      badge="Legal"
      title="Privacy Policy"
      intro="How Road Cruise collects, uses and protects your personal information."
      updated="July 2026"
    >
      <Section title="1. Information We Collect">
        <p>When you book with us or contact us, we may collect:</p>
        <Bullets items={[
          "Contact details — your name, phone number and email address.",
          "Booking details — pickup/drop locations, travel dates, passenger count, vehicle or package preference, and any special requirements you share.",
          "Payment information — processed securely by our third-party payment gateway; we do not store your card or banking details on our servers.",
          "Account details — if you register, your login email and encrypted password.",
        ]} />
      </Section>

      <Section title="2. How We Use Your Information">
        <Bullets items={[
          "To process and confirm your bookings and payments.",
          "To contact you about your trip, send confirmations, invoices and reminders.",
          "To respond to your enquiries and provide customer support.",
          "To improve our services and, with your consent, share relevant offers.",
        ]} />
      </Section>

      <Section title="3. Sharing Your Information">
        <p>
          We share your information only as needed to deliver our service — for example, with the assigned driver to
          complete your trip, and with our payment gateway to process payments. We do not sell your personal data. We
          may disclose information where required by law.
        </p>
      </Section>

      <Section title="4. Data Security">
        <p>
          We take reasonable technical and organisational measures to protect your data. Payments are handled over
          encrypted connections by a certified payment provider, and passwords are stored using strong hashing. No
          method of transmission over the internet is 100% secure, but we work to safeguard your information.
        </p>
      </Section>

      <Section title="5. Cookies">
        <p>
          Our website may use essential cookies and similar technologies to keep you signed in and to remember your
          preferences. You can control cookies through your browser settings.
        </p>
      </Section>

      <Section title="6. Your Rights">
        <Bullets items={[
          "Request access to the personal data we hold about you.",
          "Ask us to correct or update inaccurate information.",
          "Request deletion of your data, subject to legal and record-keeping requirements.",
          "Opt out of promotional messages at any time.",
        ]} />
      </Section>

      <Section title="7. Contact">
        <p>
          For any privacy request or question, email <a href="mailto:info@roadcruise.in" className="text-gold hover:underline">info@roadcruise.in</a> or
          call <a href="tel:+917338899062" className="text-gold hover:underline">+91 73388 99062</a>.
        </p>
      </Section>
    </LegalPage>
  );
}
