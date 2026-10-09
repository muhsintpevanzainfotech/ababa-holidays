import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Tag,
  Building2,
  Users,
  Heart,
  Award,
  Pause,
  Play,
  Copy,
  Check,
  Star,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBannersApi } from "@/api/endpoints";
import { getImageUrl } from "@/lib/imageHelper";

import destKerala from "@/assets/dest-kerala-backwaters.jpg";
import serviceHajj from "@/assets/service-hajj.jpg";
import serviceFamily from "@/assets/service-family.jpg";
import serviceWedding from "@/assets/service-wedding.jpg";
import destSantorini from "@/assets/dest-santorini.jpg";

export interface BannerSlide {
  id: string;
  badge: string;
  badgeIcon: any;
  title: string;
  highlightText?: string;
  description: string;
  offerCode?: string;
  discountText?: string;
  ctaText: string;
  ctaPath: string;
  image: string;
  gradientBg: string;
}

export const fallbackBannerSlides: BannerSlide[] = [
  {
    id: "kerala-special",
    badge: "🌿 Kerala Special",
    badgeIcon: Sparkles,
    title: "Explore God's Own Country",
    highlightText: "30% OFF",
    description: "Discover breathtaking backwaters, misty Munnar tea hills, and luxury houseboat cruises with all-inclusive meals.",
    offerCode: "KERALA30",
    discountText: "Flat 30% Off All Kerala Packages",
    ctaText: "Explore Kerala Now",
    ctaPath: "/packages?cat=kerala",
    image: destKerala,
    gradientBg: "from-emerald-950 via-slate-900 to-navy-dark",
  },
  {
    id: "hajj-umrah",
    badge: "🕌 Sacred Pilgrimage",
    badgeIcon: Building2,
    title: "Hajj & Umrah Packages",
    highlightText: "5-Star Stays",
    description: "Sacred, comfortable and trusted pilgrimage packages with Haram view hotels, guided rituals & express visa assistance.",
    offerCode: "HAJJ10",
    discountText: "Early Booking 10% Discount",
    ctaText: "View Pilgrimage Deals",
    ctaPath: "/services/hajj-umrah",
    image: serviceHajj,
    gradientBg: "from-amber-950 via-slate-900 to-slate-950",
  },
  {
    id: "family-holidays",
    badge: "👨‍👩‍👧‍👦 Family Special",
    badgeIcon: Users,
    title: "Family Holiday Packages",
    highlightText: "Kids Free",
    description: "Create unforgettable memories with your loved ones. Curated resorts, theme parks, private vans & guided sightseeing.",
    offerCode: "FAMILY20",
    discountText: "Save 20% On Group Bookings",
    ctaText: "Explore Family Packages",
    ctaPath: "/packages",
    image: serviceFamily,
    gradientBg: "from-blue-950 via-navy-dark to-slate-900",
  },
  {
    id: "wedding-trips",
    badge: "💍 Wedding Journeys",
    badgeIcon: Heart,
    title: "Wedding Trip Packages",
    highlightText: "VIP Escort",
    description: "Plan your dream destination wedding travel. Premium chauffeur fleets, honeymoon suites & personalized event transport.",
    offerCode: "WEDDING25",
    discountText: "Free Chauffeur Escort Service",
    ctaText: "Plan Wedding Travel",
    ctaPath: "/services/wedding-trips",
    image: serviceWedding,
    gradientBg: "from-rose-950 via-slate-900 to-navy-dark",
  },
  {
    id: "premium-tours",
    badge: "✨ Premium World Holidays",
    badgeIcon: Award,
    title: "Curated International Tours",
    highlightText: "Best Value",
    description: "Handcrafted global itineraries across Santorini, Dubai, Bali & Maldives with 5-star accommodations & 24/7 concierge.",
    offerCode: "EARLY25",
    discountText: "Save up to $500 per booking",
    ctaText: "View Premium Packages",
    ctaPath: "/packages",
    image: destSantorini,
    gradientBg: "from-indigo-950 via-slate-900 to-slate-950",
  },
];

const resolveBannerImage = (path?: string) => {
  return getImageUrl(path, destKerala);
};

const gradientsList = [
  "from-emerald-950 via-slate-900 to-navy-dark",
  "from-amber-950 via-slate-900 to-slate-950",
  "from-blue-950 via-navy-dark to-slate-900",
  "from-rose-950 via-slate-900 to-navy-dark",
  "from-indigo-950 via-slate-900 to-slate-950",
];

const PromoBannerCarousel = () => {
  const [slides, setSlides] = useState<BannerSlide[]>(fallbackBannerSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const navigate = useNavigate();

  // Fetch admin Web Banners from backend
  useEffect(() => {
    let isSubscribed = true;

    const fetchAdminBanners = async () => {
      try {
        const rawBanners = await getBannersApi();
        if (isSubscribed && Array.isArray(rawBanners) && rawBanners.length > 0) {
          const mappedSlides: BannerSlide[] = rawBanners.map((b: any, idx: number) => ({
            id: b._id || b.customId || `admin-banner-${idx}`,
            badge: b.userRole === "Admin" ? "✨ Official Web Offer" : "🔥 Special Promotion",
            badgeIcon: Sparkles,
            title: b.title || "Exclusive Travel Offer",
            highlightText: "Special Offer",
            description:
              b.description ||
              "Discover handcrafted travel itineraries, luxury stays, and memorable journeys with Ababa Holidays.",
            ctaText: "Explore Offer",
            ctaPath: b.link || "/packages",
            image: resolveBannerImage(b.image),
            gradientBg: gradientsList[idx % gradientsList.length],
          }));
          setSlides(mappedSlides);
        }
      } catch {
        // Retain fallback slides if offline
      }
    };

    fetchAdminBanners();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Auto-slide interval every 4.5 seconds
  useEffect(() => {
    if (isPaused || !isPlaying || slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, isPlaying, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || fallbackBannerSlides[0];
  const BadgeIcon = currentSlide.badgeIcon || Sparkles;

  const handleCopyCode = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section
      className="pt-24 sm:pt-28 pb-6 bg-background relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className={`relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-r ${currentSlide.gradientBg} border border-white/15 shadow-2xl min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex items-center transition-all duration-700`}>
          {/* Dynamic Ambient Blur Highlights */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500/15 rounded-full blur-[140px] pointer-events-none" />

          {/* Background Mesh Overlay Pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="w-full grid grid-cols-1 md:grid-cols-12 items-center gap-6 sm:gap-8 p-6 sm:p-10 lg:p-12 relative z-10"
            >
              {/* Left Content Column */}
              <div className="md:col-span-7 space-y-4 sm:space-y-5">
                {/* Floating Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-accent/30 shadow-sm">
                    <BadgeIcon className="h-3.5 w-3.5" />
                    {currentSlide.badge}
                  </span>

                  {currentSlide.highlightText && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold uppercase tracking-wide border border-emerald-500/30">
                      <Tag className="h-3.5 w-3.5" />
                      {currentSlide.highlightText}
                    </span>
                  )}
                </div>

                {/* Main Headline */}
                <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                  {currentSlide.title}
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
                  {currentSlide.description}
                </p>

                {/* Offer Code & Discount Snippet */}
                {currentSlide.offerCode && (
                  <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-dashed border-accent/50 bg-black/40 backdrop-blur-md text-xs">
                    <span className="text-slate-300 font-medium">Use Code:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(currentSlide.offerCode)}
                      className="font-mono text-xs sm:text-sm font-extrabold text-accent uppercase tracking-wider flex items-center gap-1 hover:underline"
                    >
                      {currentSlide.offerCode}
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {currentSlide.discountText && (
                      <span className="text-emerald-400 font-semibold border-l border-white/15 pl-2.5">
                        {currentSlide.discountText}
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => {
                      if (currentSlide.ctaPath.startsWith("http")) {
                        window.open(currentSlide.ctaPath, "_blank");
                      } else {
                        navigate(currentSlide.ctaPath);
                      }
                    }}
                    className="h-12 sm:h-13 px-7 sm:px-8 rounded-full gradient-accent text-accent-foreground font-bold text-xs sm:text-sm shadow-xl shadow-accent/20 hover:opacity-90 transition-all gap-2"
                  >
                    <span>{currentSlide.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/packages")}
                    className="h-12 sm:h-13 px-6 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white text-xs sm:text-sm font-semibold backdrop-blur-md hidden sm:inline-flex"
                  >
                    Browse All Deals
                  </Button>
                </div>
              </div>

              {/* Right Media Card Showcase */}
              <div className="md:col-span-5 hidden md:block">
                <div className="relative h-64 sm:h-72 lg:h-80 w-full overflow-hidden rounded-3xl border border-white/20 shadow-2xl group bg-slate-900">
                  <img
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = destKerala;
                    }}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Rating Floating Pill */}
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/15 flex items-center gap-1.5 shadow-md">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>4.9 / 5</span>
                    <span className="text-slate-400 font-normal">| 50k+ Happy Travelers</span>
                  </div>

                  {/* Bottom Caption Pill */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold backdrop-blur-md bg-black/50 px-4 py-2.5 rounded-2xl border border-white/15">
                    <span className="truncate">{currentSlide.title}</span>
                    <span className="text-accent font-bold text-xs shrink-0 flex items-center gap-1">
                      Explore <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Floating Control Bar */}
          <div className="absolute right-6 bottom-5 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/15">
            <span className="px-3 text-xs font-bold text-white font-mono border-r border-white/15">
              0{currentIndex + 1} / 0{slides.length}
            </span>

            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              aria-label={isPlaying ? "Pause auto-play" : "Start auto-play"}
              title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-all hover:bg-white/20 active:scale-95"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous slide"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-all hover:bg-white/20 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-all hover:bg-white/20 active:scale-95"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Pagination Indicators / Dots */}
          <div className="absolute bottom-6 left-6 sm:left-10 z-20 flex items-center gap-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-8 bg-accent" : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBannerCarousel;
