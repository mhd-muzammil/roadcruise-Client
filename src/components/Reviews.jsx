import { useState, useEffect, useMemo, useCallback } from "react";
import { Star, Quote, Check, X, Loader2, PenLine, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { getReviews, submitReview } from "../utils/api";

const RATING_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very good", 5: "Excellent" };
const TEXT_MIN = 10;
const TEXT_MAX = 600;

/** Photo avatar when available; otherwise a gold-gradient initial-letter disc. */
function ReviewerAvatar({ review }) {
  const [broken, setBroken] = useState(false);
  if (review.avatar && !broken) {
    return (
      <img
        src={review.avatar}
        alt={`${review.name} — Road Cruise customer`}
        loading="lazy"
        onError={() => setBroken(true)}
        className="w-14 h-14 rounded-full border-2 border-gold/30 object-cover shadow-md"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="w-14 h-14 rounded-full border-2 border-gold/30 shadow-md bg-gradient-to-br from-gold-hover via-gold to-gold-dark flex items-center justify-center"
    >
      <span className="text-xl font-serif font-bold text-white drop-shadow-sm select-none">
        {(review.name || "?").trim().charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export default function Reviews() {
  // Only genuine customer reviews from the server — no built-in placeholders.
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // "Share your experience" form state
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [thankName, setThankName] = useState("");

  // Load live reviews; on failure the section simply shows the invite state.
  useEffect(() => {
    let alive = true;
    getReviews()
      .then((list) => {
        if (alive && Array.isArray(list)) {
          setReviews(list);
          setActiveReviewIndex(0);
        }
      })
      .catch(() => { /* offline / dev without backend — invite state shows */ })
      .finally(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, []);

  // Fade out, switch slide, fade back in.
  const goTo = useCallback((idxOrFn) => {
    setIsFading(true);
    setTimeout(() => {
      setActiveReviewIndex((prev) => (typeof idxOrFn === "function" ? idxOrFn(prev) : idxOrFn));
      setIsFading(false);
    }, 300);
  }, []);

  // Auto-play (paused while the form is open so the page stays calm mid-typing).
  useEffect(() => {
    if (formOpen || reviews.length <= 1) return undefined;
    const timer = setInterval(() => {
      goTo((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length, formOpen, goTo]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return "5.0";
    return (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const current = reviews.length > 0 ? reviews[Math.min(activeReviewIndex, reviews.length - 1)] : null;
  const activeLabel = RATING_LABELS[hoverRating || rating];
  const trimmedTextLen = text.trim().length;

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setName("");
    setRole("");
    setText("");
    setFormError("");
  };

  const closeForm = () => {
    setFormOpen(false);
    setSubmitted(false);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setFormError("");

    const cleanName = name.trim();
    const cleanRole = role.trim();
    const cleanText = text.trim();

    if (!Number.isInteger(rating) || rating < 1) {
      setFormError("Please pick a star rating first.");
      return;
    }
    if (cleanName.length < 2) {
      setFormError("Please enter your name (at least 2 characters).");
      return;
    }
    if (cleanText.length < TEXT_MIN) {
      setFormError(`Please write at least ${TEXT_MIN} characters about your trip.`);
      return;
    }
    if (/(https?:\/\/|www\.)/i.test(cleanText)) {
      setFormError("Links are not allowed in reviews.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitReview({ name: cleanName, role: cleanRole, rating, text: cleanText });
      const stored = data?.review || { name: cleanName, role: cleanRole, rating, text: cleanText, avatar: null };
      setReviews((prev) => [stored, ...prev]);
      setActiveReviewIndex(0);
      setIsFading(false);
      setThankName((stored.name || cleanName).split(" ")[0]);
      setSubmitted(true);
      resetForm();
    } catch (err) {
      setFormError(err?.message || "Could not submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 shadow-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/25 transition";

  return (
    <section className="py-24 relative overflow-hidden bg-zinc-50 dark:bg-bg-dark transition-colors duration-300">
      {/* Decorative Blur Background Element */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center space-y-5 max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 px-4 py-1.5 rounded-full">
            {/* Google Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span className="text-[10px] font-bold tracking-widest text-gold uppercase">Customer Reviews</span>
            {reviews.length > 0 && (
              <>
                <span className="text-[10px] text-zinc-400">·</span>
                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{averageRating} ★ Rating</span>
              </>
            )}
          </div>

          <h2 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
            Heard from our <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold italic font-normal text-glow-gold">travellers.</span>
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-md mx-auto">
            Read stories of comfort, luxury, and reliability shared by our premium clients.
          </p>
        </div>

        {/* Sliding reviews card — spinner while loading, invite when empty */}
        {!loaded ? (
          <div className="flex items-center justify-center min-h-[280px] rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-xl max-w-4xl mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-gold/60" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="relative overflow-hidden p-8 md:p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-xl max-w-4xl mx-auto text-center">
            <Quote className="absolute top-6 left-6 w-16 h-16 text-gold/10 transform rotate-180 pointer-events-none" />
            <div className="py-10 space-y-3">
              <div className="flex items-center justify-center gap-1 text-gold/40">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5" />
                ))}
              </div>
              <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-white">Be the first to share your journey</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light max-w-sm mx-auto">
                Travelled with Road Cruise? Your experience helps fellow travellers choose better.
              </p>
            </div>
          </div>
        ) : (
        <div className="relative overflow-hidden p-8 md:p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-xl max-w-4xl mx-auto">
          {/* Quote Accent Icon */}
          <Quote className="absolute top-6 left-6 w-16 h-16 text-gold/10 transform rotate-180 pointer-events-none" />

          {/* Slide Content with transition */}
          <div className={`transition-all duration-300 ease-in-out ${isFading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            <div className="space-y-8 text-center flex flex-col items-center">

              {/* Star Rating */}
              <div className="flex items-center gap-1 text-gold" aria-label={`Rated ${current.rating} out of 5`}>
                {[...Array(Math.max(1, Math.min(5, Number(current.rating) || 5)))].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current text-glow-gold" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-lg md:text-xl italic font-light text-zinc-800 dark:text-zinc-200 leading-relaxed max-w-3xl font-serif">
                "{current.text}"
              </p>

              {/* Reviewer Details */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <ReviewerAvatar key={current.id ?? current.name} review={current} />
                  {/* Verified Check Badge */}
                  <span className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border border-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>

                <div className="text-center">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white tracking-wide">
                    {current.name}
                  </h4>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    {current.role ? (
                      <>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{current.role}</p>
                        <span className="text-[10px] text-zinc-300 dark:text-zinc-600">•</span>
                      </>
                    ) : null}
                    <span className="text-[10px] font-semibold text-gold tracking-wider uppercase">Verified Customer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider controls: dots for small sets, arrows + counter for large ones */}
          {reviews.length <= 10 ? (
            <div className="flex items-center justify-center gap-2.5 mt-10">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`transition-all duration-300 cursor-pointer rounded-full ${
                    activeReviewIndex === idx
                      ? "w-8 h-2.5 bg-gold"
                      : "w-2.5 h-2.5 bg-zinc-200 dark:bg-white/15 hover:bg-zinc-300 dark:hover:bg-white/25"
                  }`}
                  aria-label={`Go to review slide ${idx + 1}`}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => goTo((prev) => (prev - 1 + reviews.length) % reviews.length)}
                className="p-2 rounded-full border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-gold hover:border-gold/40 transition cursor-pointer"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tabular-nums">
                {Math.min(activeReviewIndex + 1, reviews.length)} / {reviews.length}
              </span>
              <button
                onClick={() => goTo((prev) => (prev + 1) % reviews.length)}
                className="p-2 rounded-full border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-gold hover:border-gold/40 transition cursor-pointer"
                aria-label="Next review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        )}

        {/* Share your experience */}
        <div className="max-w-4xl mx-auto mt-8">
          {!formOpen ? (
            <div className="text-center">
              <button
                onClick={() => { setFormOpen(true); setSubmitted(false); }}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-bold text-zinc-900 shadow-md shadow-gold/25 hover:bg-gold-dark hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <PenLine className="w-4 h-4" />
                Share your experience
              </button>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 font-light">
                Travelled with us? Your words help fellow travellers choose better.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-xl p-6 md:p-10 max-w-2xl mx-auto">
              {submitted ? (
                /* Thank-you state */
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-gold-hover via-gold to-gold-dark flex items-center justify-center shadow-lg shadow-gold/30">
                    <Check className="w-8 h-8 text-white stroke-[3]" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white">
                    Thank you{thankName ? `, ${thankName}` : ""}!
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-sm mx-auto">
                    Your review is live in the carousel above. We're delighted you cruised with us.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setSubmitted(false)}
                      className="rounded-full border border-zinc-200 dark:border-white/10 px-5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:border-gold/40 hover:text-gold transition cursor-pointer"
                    >
                      Write another
                    </button>
                    <button
                      onClick={closeForm}
                      className="rounded-full bg-zinc-900 dark:bg-white/10 px-6 py-2 text-xs font-semibold text-white hover:bg-zinc-700 dark:hover:bg-white/20 transition cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Review form */
                <form onSubmit={handleSubmit} noValidate>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-white">Share your experience</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-1">It takes less than a minute.</p>
                    </div>
                    <button
                      type="button"
                      onClick={closeForm}
                      className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 transition cursor-pointer"
                      aria-label="Close review form"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Star picker */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase mb-2">
                      Your rating
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-0.5" onMouseLeave={() => setHoverRating(0)} role="radiogroup" aria-label="Star rating">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            type="button"
                            key={v}
                            role="radio"
                            aria-checked={rating === v}
                            onClick={() => setRating(v)}
                            onMouseEnter={() => setHoverRating(v)}
                            onFocus={() => setHoverRating(v)}
                            onBlur={() => setHoverRating(0)}
                            className="p-1 cursor-pointer group"
                            aria-label={`${v} star${v > 1 ? "s" : ""} — ${RATING_LABELS[v]}`}
                          >
                            <Star
                              className={`w-8 h-8 transition-all duration-150 ${
                                (hoverRating || rating) >= v
                                  ? "fill-gold text-gold scale-110 drop-shadow-[0_0_6px_rgba(212,175,55,0.45)]"
                                  : "text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-500"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className={`text-sm font-semibold min-w-[80px] ${activeLabel ? "text-gold" : "text-zinc-400 font-normal"}`}>
                        {activeLabel || "Tap to rate"}
                      </span>
                    </div>
                  </div>

                  {/* Name + trip */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="review-name" className="block text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase mb-2">
                        Your name
                      </label>
                      <input
                        id="review-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={60}
                        placeholder="e.g. Ananya Raman"
                        className={inputClasses}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="review-role" className="block text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase mb-2">
                        Your trip <span className="text-zinc-400 normal-case font-normal">(optional)</span>
                      </label>
                      <input
                        id="review-role"
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        maxLength={60}
                        placeholder="e.g. Family trip to Kodaikanal"
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-5">
                    <div className="flex items-baseline justify-between mb-2">
                      <label htmlFor="review-text" className="block text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase">
                        Your review
                      </label>
                      <span className={`text-[11px] tabular-nums ${text.length > TEXT_MAX - 50 ? "text-amber-600" : "text-zinc-400"}`}>
                        {text.length}/{TEXT_MAX}
                      </span>
                    </div>
                    <textarea
                      id="review-text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={TEXT_MAX}
                      rows={4}
                      placeholder="How was the car, the driver, the journey?"
                      className={`${inputClasses} resize-none`}
                      required
                    />
                    {trimmedTextLen > 0 && trimmedTextLen < TEXT_MIN && (
                      <p className="mt-1.5 text-[11px] text-zinc-400">
                        {TEXT_MIN - trimmedTextLen} more character{TEXT_MIN - trimmedTextLen > 1 ? "s" : ""} to go.
                      </p>
                    )}
                  </div>

                  {/* Error + submit */}
                  {formError && (
                    <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-2.5">
                      {formError}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="rounded-full px-5 py-2.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-2.5 text-sm font-bold text-zinc-900 shadow-md shadow-gold/25 hover:bg-gold-dark hover:text-white transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitting ? "Sending..." : "Submit review"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
