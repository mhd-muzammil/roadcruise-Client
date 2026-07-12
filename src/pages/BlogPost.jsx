import { Link, useParams } from "react-router-dom";
import { User, Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import useDocumentMeta from "../hooks/useDocumentMeta";
import { getArticleBySlug } from "../data/articles";

// Turn the article's mixed content array (paragraphs, "### heading" markers and
// "- bullet" lines) into semantic elements. Section markers become <h2> so the
// page keeps a single <h1> (the title) with a correct h1 -> h2 hierarchy.
// Consecutive bullet lines are grouped into one <ul>.
function renderBody(content) {
  const blocks = [];
  let list = null;

  const flushList = () => {
    if (list) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc list-inside space-y-2 pl-4">
          {list}
        </ul>
      );
      list = null;
    }
  };

  content.forEach((line, idx) => {
    if (line.startsWith("###")) {
      flushList();
      blocks.push(
        <h2
          key={idx}
          className="text-lg md:text-xl font-serif font-bold text-zinc-900 dark:text-white pt-4 border-b border-zinc-150 dark:border-white/5 pb-1"
        >
          {line.replace("###", "").trim()}
        </h2>
      );
    } else if (line.startsWith("-")) {
      const body = line.replace("-", "").trim();
      const [head, ...rest] = body.split(":");
      const tail = rest.join(":");
      list = list || [];
      list.push(
        <li key={idx}>
          {tail ? <strong>{head.trim()}:</strong> : head.trim()}
          {tail}
        </li>
      );
    } else {
      flushList();
      blocks.push(<p key={idx}>{line}</p>);
    }
  });

  flushList();
  return blocks;
}

export default function BlogPost() {
  const { slug } = useParams();
  const article = getArticleBySlug(slug);

  useDocumentMeta({
    title: article
      ? `${article.title} | Road Cruise`
      : "Article Not Found | Road Cruise",
    description: article
      ? article.summary
      : "The article you are looking for could not be found. Browse the Road Cruise travel journal for road trip guides and safety tips.",
    canonical: article ? `/blog/${article.id}` : "/blog",
    noindex: !article,
  });

  if (!article) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-zinc-50 dark:bg-bg-dark text-zinc-900 dark:text-white transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-5">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Article not found</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light">
            The article you are looking for may have moved or no longer exists.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to the Journal</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="pt-24 min-h-screen bg-zinc-50 dark:bg-bg-dark text-zinc-900 dark:text-white transition-colors duration-300">

      {/* Hero cover */}
      <header className="relative h-72 md:h-96 bg-zinc-950">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-3xl mx-auto px-6 pb-8 text-left space-y-3">
            <span className="inline-block px-3.5 py-1 bg-gold/20 backdrop-blur-md border border-gold/45 rounded-full text-[9px] uppercase tracking-widest text-gold font-bold">
              {article.category}
            </span>
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-wide leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 pt-1">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-gold" /> {article.author}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gold" /> {article.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gold" /> {article.readTime}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6 text-left text-zinc-700 dark:text-zinc-300 font-light leading-relaxed text-sm md:text-base">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to the Journal</span>
        </Link>

        {renderBody(article.content)}

        {/* Natural internal CTA */}
        <div className="mt-10 p-6 rounded-2xl bg-gold/5 border border-gold/20 space-y-3">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 font-light">
            Planning this trip? Road Cruise runs chauffeur-driven rentals and curated tour
            packages across South India.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors"
            >
              <span>Explore our fleet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-zinc-300 dark:text-white/10">•</span>
            <Link
              to="/tours-travels"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors"
            >
              <span>View tour packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

    </article>
  );
}
