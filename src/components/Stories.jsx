import React, { useState } from "react";
import { Heart } from "lucide-react";

const STORIES = [
  {
    id: 1,
    tag: "Family",
    readTime: "6 min read",
    title: "A family weekend in Ooty",
    desc: "Six members, one Innova Crysta, and endless memories. Explore our journey through the winding hair-pin bends, emerald tea estates, and misty hills.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800",
    author: "Anoop & Family",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: 2,
    tag: "Corporate",
    readTime: "8 min read",
    title: "Corporate retreat to Kodaikanal",
    desc: "How we moved a 40-person tech team from Chennai in complete luxury and comfort, making our annual strategic sync-up a true breeze with Force Urbania.",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800",
    author: "Deepak & Team",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: 3,
    tag: "Couples",
    readTime: "5 min read",
    title: "A honeymoon along the backwaters",
    desc: "Kerala by private premium houseboat: a magical getaway curated with pristine views, traditional candlelight dinners, and tranquil rides.",
    image: "https://images.unsplash.com/photo-1593693411515-c202e974fe05?auto=format&fit=crop&q=80&w=800",
    author: "Vijay & Priya",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
  }
];

export default function Stories() {
  const [likes, setLikes] = useState({ 1: 42, 2: 89, 3: 56 });
  const [likedStories, setLikedStories] = useState({});

  const handleLike = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (likedStories[id]) {
      setLikes((prev) => ({ ...prev, [id]: prev[id] - 1 }));
      setLikedStories((prev) => ({ ...prev, [id]: false }));
    } else {
      setLikes((prev) => ({ ...prev, [id]: prev[id] + 1 }));
      setLikedStories((prev) => ({ ...prev, [id]: true }));
    }
  };

  return (
    <section id="stories" className="py-24 bg-zinc-50 dark:bg-bg-dark relative transition-colors duration-300">
      {/* Background radial accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-2">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-gold uppercase">
              Customer Diaries
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
            Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold italic font-normal text-glow-gold">Stories</span>
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-md mx-auto">
            Memories from the open road, shared directly by our travelers.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STORIES.map((story) => (
            <div 
              key={story.id}
              className="group relative h-[480px] rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/5 shadow-lg flex flex-col justify-end transition-all duration-500 hover:shadow-2xl hover:border-gold/30 hover:-translate-y-2 cursor-pointer"
            >
              {/* Background Image */}
              <img 
                src={story.image} 
                alt={story.title} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20 group-hover:via-zinc-950/80 transition-all duration-300 z-10"></div>

              {/* Content Card */}
              <div className="relative z-20 p-6 flex flex-col h-full justify-between">
                
                {/* Top Row: Category tag and read time */}
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-bold tracking-wider text-zinc-950 bg-gold px-3 py-1 rounded-full uppercase">
                    {story.tag}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-300/85 backdrop-blur-md bg-white/10 px-2.5 py-1 rounded-full border border-white/5">
                    {story.readTime}
                  </span>
                </div>

                {/* Bottom Row: Text content + Author info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-bold text-white tracking-wide leading-tight group-hover:text-gold transition-colors duration-300">
                      {story.title}
                    </h3>
                    <p className="text-xs text-zinc-200/90 leading-relaxed font-light line-clamp-3">
                      {story.desc}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-[1px] bg-white/10 w-full"></div>

                  {/* Author Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={story.avatar} 
                        alt={story.author} 
                        className="w-8 h-8 rounded-full border border-gold/30 object-cover shadow-md"
                      />
                      <div className="text-left">
                        <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-medium">Story by</p>
                        <p className="text-xs font-semibold text-white">{story.author}</p>
                      </div>
                    </div>

                    {/* Interactive Like Button */}
                    <button 
                      onClick={(e) => handleLike(story.id, e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-semibold transition-all duration-300 cursor-pointer ${
                        likedStories[story.id]
                          ? "bg-gold border-gold text-zinc-950 scale-105"
                          : "bg-white/5 border-white/10 text-white hover:bg-gold hover:border-gold hover:text-zinc-950"
                      }`}
                    >
                      <Heart 
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          likedStories[story.id] ? "fill-zinc-950 scale-110" : ""
                        }`}
                      />
                      <span>{likes[story.id]}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
