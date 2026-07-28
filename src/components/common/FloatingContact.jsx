import { MessageSquareText } from "lucide-react";

/**
 * Floating quick-contact buttons (WhatsApp + SMS), fixed at the bottom-right on
 * every page. One source of truth for the business number below — change it here
 * and both buttons update. Opens WhatsApp chat (wa.me) and the native SMS
 * composer, each with a friendly prefilled message.
 */
const PHONE_WA = "917338899062"; // E.164 without "+" — required by wa.me
const PHONE_TEL = "+917338899062"; // with "+" — for the sms: scheme
const PREFILL = "Hi Road Cruise, I'd like to know more about your services.";

const waHref = `https://wa.me/${PHONE_WA}?text=${encodeURIComponent(PREFILL)}`;
const smsHref = `sms:${PHONE_TEL}?body=${encodeURIComponent(PREFILL)}`;

// Brand WhatsApp glyph (lucide has no official WhatsApp icon).
function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function FloatingContact() {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 print:hidden">
      {/* SMS */}
      <a
        href={smsHref}
        aria-label="Send Road Cruise an SMS"
        title="Text us"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-zinc-950 shadow-lg shadow-black/30 ring-1 ring-black/10 transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <MessageSquareText className="h-6 w-6" />
      </a>

      {/* WhatsApp */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Road Cruise on WhatsApp"
        title="Chat on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 ring-1 ring-black/10 transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {/* subtle attention pulse */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping" />
        <WhatsAppIcon className="relative h-7 w-7" />
      </a>
    </div>
  );
}
