import { motion } from "framer-motion";
import { Search, MapPin, Compass, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import heroImage from "@/assets/hero-travel.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    navigate(`/search${location ? `?q=${encodeURIComponent(location)}` : ""}`);
  };

  const inputCls =
    "w-full bg-transparent text-sm font-medium text-white placeholder:text-slate-300/70 outline-none";
  const labelCls =
    "mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-accent";

  return (
    <section className="relative flex min-h-[620px] md:min-h-[720px] items-center overflow-hidden pb-16 pt-32 md:pb-20 md:pt-40">
      {/* Background with Ambient Radial Glow Overlay */}
      <div className="absolute inset-0">
        <motion.img
          src={heroImage}
          alt="Lush Kerala backwaters with palm trees at sunset"
          className="h-full w-full object-cover object-center"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 7, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.18),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-5 py-6 sm:px-6 lg:px-12">
        <div className="max-w-4xl">
          {/* Top Pill Badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 flex flex-wrap items-center gap-3"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-300 backdrop-blur-md">
              <Compass className="h-4 w-4 animate-spin-slow text-sky-400" />
              Authentic Kerala & Global Holidays
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/15 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md">
              <span className="text-amber-400">★</span> 4.9 (2,400+ Verified Reviews)
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mb-5 font-display text-3xl font-extrabold leading-tight text-white sm:text-5xl md:mb-7 md:text-6xl lg:text-7xl tracking-tight"
          >
            Where the{" "}
            <span className="bg-gradient-to-r from-sky-400 via-emerald-300 to-amber-300 bg-clip-text font-normal italic text-transparent">
              Backwaters
            </span>{" "}
            Meet Your Soul
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg md:mb-10 md:text-xl font-normal"
          >
            Discover the hidden serenity of God's Own Country & bespoke global journeys.
            Luxury houseboats, misty hill resorts, and 24/7 VIP concierge care.
          </motion.p>

          {/* Ultra-Modern Glassmorphism Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex max-w-4xl flex-col items-stretch gap-2 rounded-3xl border border-white/20 bg-slate-950/70 p-2.5 shadow-2xl backdrop-blur-2xl md:flex-row ring-1 ring-white/10"
          >
            <div className="flex flex-1 items-center gap-3.5 border-b border-white/10 px-5 py-3.5 md:border-b-0 md:border-r">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="w-full">
                <span className={labelCls}>Destination</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Munnar, Alleppey, Wayanad..."
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex flex-1 items-center gap-3.5 border-b border-white/10 px-5 py-3.5 md:border-b-0 md:border-r">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="w-full">
                <span className={labelCls}>Arrival Date</span>
                <input type="date" className={`${inputCls} [color-scheme:dark]`} />
              </div>
            </div>

            <div className="flex flex-1 items-center gap-3.5 px-5 py-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400">
                <Users className="h-5 w-5" />
              </div>
              <div className="w-full">
                <span className={labelCls}>Travelers</span>
                <select className={`${inputCls} cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white`}>
                  <option value="2">2 Guests (Couple)</option>
                  <option value="1">1 Guest (Solo)</option>
                  <option value="4">4 Guests (Family)</option>
                  <option value="6">6+ Guests (Group)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2.5 rounded-2xl gradient-accent px-8 py-4 text-sm font-extrabold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-sky-500/25 active:scale-95"
            >
              <Search className="h-4 w-4 stroke-[2.5]" />
              <span>Explore Deals</span>
            </button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-7 sm:flex sm:flex-wrap sm:items-center md:mt-12 md:gap-14 md:pt-8"
          >
            {[
              { value: "50K+", label: "Happy Explorers" },
              { value: "500+", label: "Handpicked Stays" },
              { value: "4.9 ★", label: "Guest Satisfaction" },
              { value: "24/7", label: "VIP Concierge Care" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-8 md:gap-14">
                {i > 0 && <div className="hidden h-10 w-px bg-white/10 md:block" />}
                <div>
                  <p className="font-display text-2xl font-extrabold text-white md:text-3xl tracking-tight">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300 md:tracking-[0.2em]">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-slate-300">Scroll Down</span>
        <div className="h-12 w-0.5 animate-pulse bg-gradient-to-b from-sky-400 to-transparent" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
