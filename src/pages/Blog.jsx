import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, User, ArrowRight } from "lucide-react";
import useDocumentMeta from "../hooks/useDocumentMeta";
import { ARTICLES, CATEGORIES } from "../data/articles";

export default function Blog() {
  useDocumentMeta({
    title: "Travel Blog: South India Road Trip Guides | Road Cruise",
    description:
      "Road trip guides, ghat driving safety tips and hidden destinations across South India, written by Road Cruise chauffeurs and travel experts.",
    canonical: "/blog",
  });
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredArticles = activeCategory === "All"
    ? ARTICLES
    : ARTICLES.filter((art) => art.category === activeCategory);

  const featuredArticle = ARTICLES.find((art) => art.featured);
  const regularArticles = filteredArticles.filter((art) => !art.featured || activeCategory !== "All");

  return (
    <div className="pt-24 min-h-screen bg-zinc-50 dark:bg-bg-dark text-zinc-900 dark:text-white transition-colors duration-300">

      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gold/5 blur-[130px] rounded-full pointer-events-none animate-pulse-slow"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-16">

        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 bg-gold/15 border border-gold/30 rounded-full animate-pulse">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase text-glow-gold">Road Cruise Journal</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">
            Stories & Travel Guides
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
            Discover safety tips, scenic driving routes, local landmarks, and stories from our experienced chauffeurs to inspire your next South India road trip.
          </p>
        </div>

        {/* 1. Featured Post Banner (Only shown when category is "All") */}
        {activeCategory === "All" && featuredArticle && (
          <div className="relative group rounded-3xl overflow-hidden glass-premium border border-zinc-200 dark:border-white/5 hover:border-gold/40 shadow-2xl transition-all duration-500 bg-white/40 dark:bg-zinc-900/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

              {/* Image Left */}
              <div className="lg:col-span-7 h-64 lg:h-96 overflow-hidden relative bg-zinc-950">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms] brightness-90 group-hover:brightness-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-zinc-950/40 via-transparent to-transparent"></div>
              </div>

              {/* Text Content Right */}
              <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between text-left">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-gold">
                    <span>{featuredArticle.category}</span>
                    <span>•</span>
                    <span className="text-zinc-500 dark:text-zinc-400">{featuredArticle.readTime}</span>
                  </div>

                  <h2 className="text-xl lg:text-3xl font-serif font-bold leading-tight group-hover:text-gold transition-colors duration-300">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-xs lg:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                    {featuredArticle.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-150 dark:border-white/5 mt-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30">
                      <User className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold block text-zinc-800 dark:text-white">{featuredArticle.author}</span>
                      <span className="text-[9px] text-zinc-500 block">{featuredArticle.date}</span>
                    </div>
                  </div>

                  <Link
                    to={`/blog/${featuredArticle.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors cursor-pointer"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* 2. Category Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-zinc-200 dark:border-white/5 pb-6">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === category
                  ? "bg-gold text-zinc-950 font-bold shadow-md"
                  : "bg-white dark:bg-white/5 border border-zinc-200 dark:border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 3. Regular Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularArticles.map((art) => (
            <article
              key={art.id}
              className="group flex flex-col justify-between rounded-3xl glass-premium border border-zinc-200 dark:border-white/5 hover:border-gold/40 hover:scale-[1.02] hover:-translate-y-1.5 shadow-2xl hover:shadow-gold/5 transition-all duration-500 bg-white/40 dark:bg-zinc-900/10 overflow-hidden text-left"
            >
              {/* Cover Image */}
              <div className="h-52 overflow-hidden relative bg-zinc-950">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent"></div>

                {/* Category tag */}
                <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[9px] uppercase font-bold text-white tracking-widest">
                  {art.category}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gold" />
                      {art.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gold" />
                      {art.readTime}
                    </span>
                  </div>

                  <h2 className="text-base font-serif font-bold text-zinc-900 dark:text-white group-hover:text-gold transition-colors tracking-wide leading-snug">
                    {art.title}
                  </h2>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light line-clamp-3">
                    {art.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
                  <span className="text-[10px] font-medium text-zinc-500">By {art.author}</span>
                  <Link
                    to={`/blog/${art.id}`}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors cursor-pointer"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </article>
          ))}
        </div>

      </div>

    </div>
  );
}
