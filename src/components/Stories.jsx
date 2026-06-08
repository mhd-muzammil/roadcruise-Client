import React from "react";
import { ThumbsUp } from "lucide-react";

const STORIES = [
  {
    id: 1,
    tag: "Family",
    readTime: "6 min read",
    title: "A family weekend in Ooty",
    desc: "Six members, one Innova Crysta, and endless memories. Explore our journey through the winding hair-pin bends, emerald tea estates, and misty mornings in the Queen of Hill Stations."
  },
  {
    id: 2,
    tag: "Corporate",
    readTime: "8 min read",
    title: "Corporate retreat to Kodaikanal",
    desc: "How we moved a 40-person tech team from Chennai in complete luxury and comfort, making our annual strategic sync-up a true breeze with Force Urbania and luxury support."
  },
  {
    id: 3,
    tag: "Couples",
    readTime: "5 min read",
    title: "A honeymoon along the backwaters",
    desc: "Kerala by private premium houseboat: a magical getaway curated with pristine views, traditional candlelight dinners, and tranquil rides away from the busy city buzz."
  }
];

export default function Stories() {
  return (
    <section id="stories" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">Travel Stories</h2>
          <p className="text-3xl md:text-4xl font-serif font-bold text-white">
            Memories from the open road.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STORIES.map((story) => (
            <div 
              key={story.id}
              className="group p-8 rounded-2xl glass-card border border-white/5 hover:border-gold/30 bg-zinc-900/30 flex flex-col justify-between h-full"
            >
              <div className="space-y-6">
                {/* Category badges */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                  <span className="text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                    {story.tag}
                  </span>
                  <span>{story.readTime}</span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-white tracking-wide group-hover:text-gold transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {story.desc}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-8 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Story by Customer</span>
                <ThumbsUp className="w-4 h-4 text-zinc-500 group-hover:text-gold transition-colors" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
