import motLogo from "../assets/ministry-of-tourism.svg";
import incredibleIndiaLogo from "../assets/incredible-india.png";

// Government-recognition strip — Ministry of Tourism (GoI) + Incredible India.
// The artwork is black-on-white, so each badge sits on a white card to stay
// legible in both light and dark themes.
export default function Recognition() {
  return (
    <section
      aria-label="Government recognitions"
      className="py-12 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300"
    >
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-6">
          Recognized By
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex h-24 items-center justify-center bg-white rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm px-6 sm:px-8">
            <img
              src={motLogo}
              alt="Ministry of Tourism, Government of India"
              className="h-14 w-auto"
              loading="lazy"
            />
          </div>
          <div className="flex h-24 items-center justify-center bg-white rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm px-6 sm:px-8">
            <img
              src={incredibleIndiaLogo}
              alt="Incredible India"
              className="h-10 sm:h-11 w-auto"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
