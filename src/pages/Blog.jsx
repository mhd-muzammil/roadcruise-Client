import React, { useState } from "react";
import { Clock, Calendar, User, ArrowRight, X, BookOpen } from "lucide-react";

const ARTICLES = [
  {
    id: "nilgiri-guide",
    title: "The Ultimate Guide to Nilgiri Hills Road Trips: Ooty & Coonoor Heritage",
    category: "Travel Guides",
    date: "June 08, 2026",
    readTime: "6 Min Read",
    author: "Arjun Mehta",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=1200",
    summary: "Conquer the 36 hairpin bends of the Ooty road. Explore heritage colonial bungalows, tea plantations, and scenic viewpoints with our curated road trip guide.",
    featured: true,
    content: [
      "The Nilgiri Hills, or Blue Mountains, are home to some of the most scenic road trip routes in South India. Driving from Bangalore or Coimbatore towards Ooty and Coonoor is an adventure that offers breathtaking views of mist-covered peaks, lush tea gardens, and rich wildlife sanctuaries.",
      "### Conquering the Hairpin Bends",
      "If you take the Kalhatty Ghat route from Masinagudi, you will encounter 36 legendary hairpin bends. This stretch is extremely steep and requires absolute control. If you are driving a manual rental vehicle, stay in first or second gear, and always give uphill traffic the right of way. Alternatively, taking our professional chauffeur service ensures you can sit back and capture the scenery while a certified driver handles the curves.",
      "### Must-Visit Heritage Stops",
      "Once you reach Ooty, skip the crowded commercial spots and head to these premium locations:",
      "- **Stone House**: The first colonial bungalow built in Ooty in 1822.",
      "- **Nilgiri Mountain Railway**: A UNESCO World Heritage Toy Train ride that winds through steep cliffs and dark tunnels.",
      "- **Doddabetta Tea Factory**: Learn the art of tea leaf processing and sample hot cardamom tea.",
      "### When to Plan Your Journey",
      "The best time to visit is between October and May. Avoid peak monsoon months (July to August) due to landslide risks. No matter when you go, ensure your vehicle's brakes, coolants, and tire threads are inspected beforehand."
    ]
  },
  {
    id: "ghat-road-safety",
    title: "Safety on the Ghat Roads: 5 Critical Rules for Mountain Driving",
    category: "Road Safety",
    date: "May 24, 2026",
    readTime: "4 Min Read",
    author: "Ravi Kumar (Chauffeur Captain)",
    image: "https://th.bing.com/th/id/R.cf1da50373c8331769bfda24a1b438ec?rik=JFv%2bSsgO8OHqVw&riu=http%3a%2f%2fmycameralog.com%2fwp-content%2fuploads%2f2022%2f09%2fIMG_20220911_160134-001.jpg&ehk=f%2bADsyxNmxr2n5NDmlBy4xzGgzC1CGkcsc3%2bzjj7YfM%3d&risl=&pid=ImgRaw&r=0",
    summary: "Driving in the mountains is vastly different from cruising on highways. Learn the five crucial guidelines our professional drivers follow to stay safe on ghat roads.",
    featured: false,
    content: [
      "Ghat road driving requires heightened focus, specialized vehicle control, and strict adherence to safety rules. At Road Cruise, our chauffeurs undergo mandatory mountain-driving training. Here are the top five guidelines to ensure safety:",
      "### 1. Engine Braking is Essential",
      "Never ride your brakes down a long hill! This causes brake fade, where the pads overheat and lose stopping power. Instead, use 'engine braking' by shifting to a lower gear (e.g. 2nd or 3rd gear) to let the engine's compression regulate the vehicle's speed.",
      "### 2. The Uphill Traffic Rule",
      "Vehicles driving uphill always have the right of way. It is much harder for a heavy vehicle (like a Tempo Traveller or Mini Bus) to restart from a complete stop on a steep incline. If you see a vehicle climbing, pull over to a safe spot and let them pass.",
      "### 3. Maintain Absolute Lane Discipline",
      "It can be tempting to cut corners on sharp curves, but this is extremely dangerous on narrow ghat roads. Stay strictly within your lane. Honk gently at blind turns to alert oncoming traffic of your presence.",
      "### 4. Watch the Temperature Gauge",
      "Climbing steep hills puts heavy strain on the engine. Keep an eye on your dashboard temperature gauge. If it climbs near the red mark, turn off the AC, pull over safely, let the engine idle for a few minutes, and check coolant levels.",
      "### 5. Check Weather & Landslide Warnings",
      "During monsoons, hills are prone to sudden landslides and thick fog. Always check local meteorological reports before heading up roads to places like Kodaikanal or Munnar."
    ]
  },
  {
    id: "coorg-waterfalls",
    title: "Top 5 Hidden Waterfalls in Coorg You Must Visit",
    category: "Destinations",
    date: "April 15, 2026",
    readTime: "5 Min Read",
    author: "Sarah D'Souza",
    image: "https://www.danteswatersports.net/wp-content/uploads/2018/11/nauyaka1-768x476.jpg",
    summary: "Ditch the commercial tourist grids. Explore these five secluded waterfalls tucked deep inside the private coffee estates of Coorg.",
    featured: false,
    content: [
      "Coorg (Kodagu) is often called the Scotland of India. While Abbey Falls and Raja's Seat attract thousands of tourists daily, the true magic of Coorg lies in its hidden waterfalls tucked deep in private estates and forest ranges.",
      "### 1. Iruppu Falls",
      "Located in the Brahmagiri range, Iruppu is a fresh forest cascade. A beautiful forest walk leads to the falls, making it a great destination for nature lovers. It is also believed to have mythological significance.",
      "### 2. Chelavara Falls",
      "A stunning natural fall where water crashes down from a height of 150 feet into a orange-colored pool. It is located near Chomakund Hills, offering panoramic views of valleys.",
      "### 3. Mallalli Falls",
      "Situated in the northern foothills of Pushpagiri, Mallalli is one of the most powerful falls in Karnataka. The Kumaradhara river cascades down over 200 feet in a spectacular white curtain.",
      "### 4. Abbimatta Falls",
      "A quiet, lesser-known waterfall located near Somwarpet. It is surrounded by coffee plantations, offering a peaceful escape from crowds.",
      "### 5. Devaragundi Falls",
      "Tucked deep inside private coffee plantations near Thokur, this hidden gem is perfect for trekking enthusiasts. Always seek local guidance before hiking here, as the forest paths can be confusing."
    ]
  },
  {
    id: "chauffeur-life",
    title: "A Day in the Life of a Luxury Concierge Chauffeur",
    category: "Chauffeur Stories",
    date: "March 29, 2026",
    readTime: "8 Min Read",
    author: "Vikram Sen",
    image: "https://tse2.mm.bing.net/th/id/OIP.fpeh6Tx8zBJSAf35_mbAOAHaEK?r=0&cb=thfc1falcon2&rs=1&pid=ImgDetMain&o=7&rm=3",
    summary: "Get a behind-the-scenes look at the commitment, safety protocols, and hospitality guidelines that define a true Road Cruise concierge chauffeur.",
    featured: false,
    content: [
      "At Road Cruise, a chauffeur is not just a driver; they are a concierge on wheels. From planning routes to recommending the best local eateries, our drivers are committed to making your journey a premium experience.",
      "### The Morning Checklist",
      "A chauffeur's day starts two hours before passenger pickup. The morning routine includes: ",
      "- **Complete Cleanliness**: The vehicle undergoes deep vacuuming and sanitization.",
      "- **Mechanical Verification**: Checking tire pressures, engine oils, and brake fluids.",
      "- **Route Planning**: Reviewing live traffic reports and weather forecasts.",
      "### Hospitality & Guest Care",
      "Our chauffeurs are trained in professional etiquette. They ensure the temperature inside is tailored to your preference, offer bottled water, and maintain a quiet cabin if you need to work or rest.",
      "### Safety Over Speed",
      "Every vehicle is GPS-monitored. If a driver exceeds the speed limit, our central safety desk receives an alert. We prioritize your comfort and safety over reaching a few minutes early."
    ]
  },
  {
    id: "east-coast-road",
    title: "The Best Seafood Pitstops Along the East Coast Road (ECR)",
    category: "Travel Guides",
    date: "February 12, 2026",
    readTime: "7 Min Read",
    author: "Aditi Rao",
    image: "https://dt4l9bx31tioh.cloudfront.net/eazymedia/restaurant/682117/restaurant220250104101427.png?width=818&height=450&mode=crop?format=auto&quality=80",
    summary: "Cruising along the coast from Chennai to Pondicherry? Check out these top culinary stops for fresh catches and beachside dining experiences.",
    featured: false,
    content: [
      "The East Coast Road (ECR) running along the Bay of Bengal is one of the most scenic coastal highways in India. If you are taking a weekend getaway to Pondicherry, the drive is incomplete without sampling the fresh seafood along the route.",
      "### Culinary Highlights along ECR",
      "Here are the top seafood spots recommended by our regular travellers and chauffeurs:",
      "- **The Wharf (Mahabalipuram)**: High-end dining right next to the beach, offering fresh catches prepared in clay ovens.",
      "- **Kadaloor Sea Tavern**: Known for traditional clay-pot fish curries and spicy prawn fry.",
      "- **French Quarter Cafés (Pondicherry)**: Indulge in classic French-style butter-garlic lobsters and baked crabs.",
      "### A Perfect Weekend Plan",
      "For a perfect trip, hire a rental vehicle on a Saturday morning, enjoy a lazy lunch at Mahabalipuram, visit the Shore Temple, and arrive in Pondicherry by sunset to catch the ocean breeze."
    ]
  },
  {
    id: "munnar-tea-valleys",
    title: "Munnar Tea Valley Trail: Top Scenic Driving Routes & Viewpoints",
    category: "Destinations",
    date: "January 18, 2026",
    readTime: "5 Min Read",
    author: "Meera Nair",
    image: "https://th.bing.com/th/id/R.9a0c20a5aa5858051de8934819a9480d?rik=eZOcwkvuhJXYkA&riu=http%3a%2f%2fblog.raynatours.com%2fwp-content%2fuploads%2f2017%2f02%2fHill-station-in-Munnar.jpg&ehk=Rs37Yz0zJwngemmKUPI%2fjD45a%2f3BpMkFnCcqDWo%2bEFM%3d&risl=&pid=ImgRaw&r=0",
    summary: "Discover the emerald tea valleys of Munnar. Plan your road trip route past beautiful waterfalls, dams, and the high-altitude Eravikulam National Park.",
    featured: false,
    content: [
      "Munnar is South India's premier tea-growing region, famous for its sprawling estate valleys, cool mist, and winding roads. Driving up to Munnar from Cochin or Madurai is a visual feast, passing by major waterfalls like Valara and Cheeyappara.",
      "### The Tea Garden Scenic Trail",
      "Once you arrive in Munnar, take the Mattupetty direction. This road leads past scenic lakes, dams, and tea factories:",
      "- **Mattupetty Dam**: A beautiful reservoir where you can rent speedboats.",
      "- **Echo Point**: A natural echo phenomenon located in a scenic lake bend.",
      "- **Kundala Lake**: Known for its cherry blossom trees and pedal boating.",
      "### High Altitude Wildlife",
      "A road trip to Munnar is incomplete without visiting **Eravikulam National Park**, home to the endangered Nilgiri Tahr (wild mountain goat). Private vehicles are not allowed inside the park range, so you must park at the entry gate and board the government safari buses.",
      "### Essential Travel Tips",
      "Expect heavy fog in Munnar during winter mornings and monsoon afternoons. Ensure your vehicle has working fog lamps and hazard warning lights. Maintain low speeds, as visibility can drop below 10 meters in a matter of minutes."
    ]
  },
  {
    id: "iso-tourism-safety",
    title: "Understanding ISO 9001:2015: What Quality Certification Means for Travel Safety",
    category: "Road Safety",
    date: "January 05, 2026",
    readTime: "5 Min Read",
    author: "Rohan Das (Quality Compliance)",
    image: "https://isosrilanka.ascentworld.com/wp-content/uploads/2024/10/ISO-9001-QMS.webp",
    summary: "We explain what ISO 9001:2015 Quality Management certification means, how it governs our processes, and how it keeps our travellers safe.",
    featured: false,
    content: [
      "Road Cruise is proud to be an ISO 9001:2015 certified luxury travel and transport provider. While many see this as just a badge, it actually represents a comprehensive set of operational safety standards that protect you at every step of your journey.",
      "### What is ISO 9001:2015?",
      "ISO 9001 is the international standard for Quality Management Systems (QMS). For a tourism provider, it means that every service we deliver — from booking and chauffeur training to vehicle maintenance and route planning — is governed by strict, audited procedures.",
      "### Our Audited Maintenance Protocols",
      "Under ISO standards, we follow a double-check maintenance routine:",
      "- **Every Trip Inspection**: Tire pressure, brake fluid, steering, and GPS checks before every departure.",
      "- **Regular Maintenance Audits**: Certified workshop inspections every 5,000 kilometers.",
      "### Standardized Chauffeur Training",
      "Every chauffeur at Road Cruise undergoes a background check and regular customer-service and safe-driving audits. This guarantees that your chauffeur behaves professionally, adheres to speed limits, and is trained in basic first aid.",
      "### Continuous Feedback Loop",
      "ISO certification requires us to actively track customer complaints and reviews. Your feedback is fed into our system to continuously improve our drivers, vehicle choices, and routing, guaranteeing we always score near a perfect 5 stars."
    ]
  }
];

const CATEGORIES = ["All", "Travel Guides", "Road Safety", "Destinations", "Chauffeur Stories"];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(null);

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

                  <button
                    onClick={() => setSelectedArticle(featuredArticle)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors cursor-pointer"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
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
            <div 
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

                  <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white group-hover:text-gold transition-colors tracking-wide leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light line-clamp-3">
                    {art.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
                  <span className="text-[10px] font-medium text-zinc-500">By {art.author}</span>
                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold hover:text-gold-hover transition-colors cursor-pointer"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* 4. Article Reader Modal Overlay */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 dark:bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-gold/30 shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header Cover */}
            <div className="h-64 relative bg-zinc-950 flex-shrink-0">
              <img 
                src={selectedArticle.image} 
                alt={selectedArticle.title} 
                className="w-full h-full object-cover brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent"></div>
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 right-6 p-2 bg-zinc-950/80 backdrop-blur-md text-white hover:text-gold border border-white/10 rounded-full transition-all cursor-pointer hover:scale-105"
                aria-label="Close article reader"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-8 text-left space-y-2">
                <span className="px-3.5 py-1 bg-gold/20 backdrop-blur-md border border-gold/45 rounded-full text-[9px] uppercase tracking-widest text-gold w-max font-bold">
                  {selectedArticle.category}
                </span>
                <h2 className="text-xl md:text-3xl font-serif font-bold text-white tracking-wide leading-tight">
                  {selectedArticle.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-zinc-300 pt-1.5">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-gold" /> {selectedArticle.author}</span>
                  <span>•</span>
                  <span>{selectedArticle.date}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                </div>
              </div>
            </div>

            {/* Modal Content Scroll Body */}
            <div className="p-8 overflow-y-auto flex-1 text-left space-y-6 text-zinc-700 dark:text-zinc-300 font-light leading-relaxed text-sm">
              {selectedArticle.content.map((paragraph, idx) => {
                // Render headers
                if (paragraph.startsWith("###")) {
                  return (
                    <h3 key={idx} className="text-lg font-serif font-bold text-zinc-900 dark:text-white pt-4 border-b border-zinc-150 dark:border-white/5 pb-1">
                      {paragraph.replace("###", "").trim()}
                    </h3>
                  );
                }
                // Render list items
                if (paragraph.startsWith("-")) {
                  return (
                    <ul key={idx} className="list-disc list-inside space-y-2 pl-4">
                      <li>
                        <strong>{paragraph.replace("-", "").split(":")[0]}:</strong>
                        {paragraph.replace("-", "").split(":")[1]}
                      </li>
                    </ul>
                  );
                }
                // Render normal paragraphs
                return <p key={idx}>{paragraph}</p>;
              })}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-150 dark:border-white/5 flex justify-end bg-zinc-50 dark:bg-zinc-900/10">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 bg-gold hover:bg-gold-hover text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-gold/10"
              >
                Close Reader
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
