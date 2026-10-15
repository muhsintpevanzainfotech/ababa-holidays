import { useParams, Link } from "react-router-dom";
import { useState, useId, FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  MapPin,
  CheckCircle,
  ArrowLeft,
  Heart,
  Share2,
  Users,
  Shield,
  Award,
  Sparkles,
  Calendar,
  Compass,
  Check,
  Building2,
  Utensils,
  Car,
  MessageSquarePlus,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import SectionHeading from "@/components/SectionHeading";
import { useWishlist } from "@/contexts/WishlistContext";
import { getPackagePricing } from "@/lib/pricing";

interface GuestReviewItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
}

const initialReviewsList: GuestReviewItem[] = [
  {
    id: "rev-1",
    name: "Sarah M.",
    rating: 5,
    date: "Feb 2026",
    text: "Absolutely incredible experience! Every detail was perfectly planned. The luxury stay was stunning and the guided tours were punctual and organized.",
  },
  {
    id: "rev-2",
    name: "James K.",
    rating: 5,
    date: "Jan 2026",
    text: "Best vacation we've ever booked on dotravels. The local guides were knowledgeable and friendly. Would rebook in a heartbeat!",
  },
  {
    id: "rev-3",
    name: "Maria L.",
    rating: 4,
    date: "Dec 2025",
    text: "Great trip overall! Beautiful destinations and comfortable AC transport throughout. Highly recommended for families.",
  },
  {
    id: "rev-4",
    name: "David R.",
    rating: 5,
    date: "Nov 2025",
    text: "Exceeded all expectations. The sunset boat tour and resort stay were highlights I'll never forget. Worth every rupee!",
  },
];

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchPackageDetailsStart, fetchPackagesStart } from "@/store/slices/packagesSlice";
import { getImageUrl } from "@/lib/imageHelper";

const PackageDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { selectedPackage, packages: reduxPackages, detailsLoading } = useAppSelector((state) => state.packages);

  useEffect(() => {
    if (id) {
      dispatch(fetchPackageDetailsStart(id));
    }
    if (!reduxPackages || reduxPackages.length === 0) {
      dispatch(fetchPackagesStart({}));
    }
  }, [id, dispatch, reduxPackages]);

  const rawPkg =
    selectedPackage ||
    (Array.isArray(reduxPackages)
      ? reduxPackages.find(
          (p: any) =>
            p._id === id ||
            p.id === id ||
            p.customId === id ||
            (p.title && id && p.title.toLowerCase().includes(id.toLowerCase()))
        )
      : null);
  const pkg = rawPkg ? {
    ...rawPkg,
    id: rawPkg._id || rawPkg.id || "",
    _id: rawPkg._id || rawPkg.id || "",
    title: rawPkg.title || rawPkg.packageName || rawPkg.name || "Exclusive Package",
    description: rawPkg.description || rawPkg.packageDescription || "",
    location: rawPkg.location || rawPkg.destination || "Destination",
    duration: rawPkg.duration || "3 Days / 2 Nights",
    category: typeof rawPkg.category === "string" ? rawPkg.category : rawPkg.category?.name || rawPkg.serviceCategory?.name || "Holiday",
    rating: Number(rawPkg.rating || rawPkg.averageRating || 5),
    price: rawPkg.price || rawPkg.discountPrice || rawPkg.originalPrice || 0,
    originalPrice: rawPkg.originalPrice || rawPkg.price || 0,
    included: rawPkg.inclusions || rawPkg.included || [],
    itinerary: rawPkg.itinerary || [],
    gallery: (rawPkg.images && rawPkg.images.length > 0
      ? rawPkg.images
      : (rawPkg.gallery && rawPkg.gallery.length > 0 ? rawPkg.gallery : [rawPkg.image || "/favicon.png"])).map((img: string) => getImageUrl(img))
  } : null;

  const pricing = getPackagePricing(pkg);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [travelersCount, setTravelersCount] = useState(2);
  const [selectedDate, setSelectedDate] = useState("");
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = pkg ? isInWishlist(pkg.id || pkg._id) : false;

  // GUEST REVIEWS STATE
  const [reviews, setReviews] = useState<GuestReviewItem[]>(initialReviewsList);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewDate, setNewReviewDate] = useState("Oct 2026");
  const [newReviewText, setNewReviewText] = useState("");
  const formId = useId();

  const relatedPackages = Array.isArray(reduxPackages) && pkg
    ? reduxPackages
        .filter((p: any) => (p.id || p._id) !== (pkg.id || pkg._id) && (p.location === pkg.location || p.category === pkg.category))
        .slice(0, 3)
    : [];
  const gallery = pkg?.gallery && pkg.gallery.length > 0 ? pkg.gallery : ["/favicon.png"];

  if (detailsLoading || !pkg) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          {detailsLoading ? (
            <div className="space-y-4">
              <div className="h-8 w-48 bg-muted rounded-full mx-auto animate-pulse" />
              <div className="h-64 max-w-2xl bg-muted rounded-2xl mx-auto animate-pulse" />
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold font-display">Package Not Found</h1>
              <p className="text-muted-foreground text-sm">The package you are looking for might have been moved or is unavailable.</p>
              <Link to="/packages">
                <Button>Browse Packages</Button>
              </Link>
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pkg.title,
        text: `Check out ${pkg.title} on dotravels!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Package link copied to clipboard!");
    }
  };

  const handleAddReviewSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    const newReview: GuestReviewItem = {
      id: `rev-${Date.now()}`,
      name: newReviewName.trim(),
      rating: newReviewRating,
      date: newReviewDate.trim() || "Oct 2026",
      text: newReviewText.trim(),
    };

    setReviews([newReview, ...reviews]);
    setReviewSubmitted(true);
  };

  const resetReviewForm = () => {
    setNewReviewName("");
    setNewReviewRating(5);
    setNewReviewDate("Oct 2026");
    setNewReviewText("");
    setReviewSubmitted(false);
  };

  // Compute live rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
      : pkg.rating.toFixed(1);

  return (
    <div className="min-h-screen bg-background text-foreground select-none">
      <Navbar />

      <main className="pt-20 md:pt-24 pb-16">
        {/* HERO IMAGE & GALLERY HEADER */}
        <div className="relative w-full h-[52vh] sm:h-[60vh] lg:h-[68vh] overflow-hidden bg-slate-950">
          <img
            src={gallery[activeImageIndex]}
            alt={pkg.title}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />

          {/* TOP CONTROLS & BREADCRUMB */}
          <div className="absolute top-6 inset-x-0 z-20">
            <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
              <Link
                to="/packages"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900/75 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-lg border border-white/15 hover:bg-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-accent" />
                <span>Back to Packages</span>
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() =>
                    toggleItem({
                      id: pkg.id,
                      title: pkg.title,
                      image: pkg.image,
                      price: pricing.price,
                      location: pkg.location,
                    })
                  }
                  className={`rounded-full border border-white/20 backdrop-blur-md px-4 py-2 text-xs font-semibold gap-2 shadow-lg transition-colors ${
                    inWishlist
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : "bg-slate-900/75 text-white hover:bg-slate-900"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-current" : ""}`} />
                  <span>{inWishlist ? "Saved" : "Save"}</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleShare}
                  className="rounded-full border border-white/20 bg-slate-900/75 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 gap-2 shadow-lg transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-accent" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </div>

          {/* FLOATING GALLERY THUMBNAILS (BOTTOM RIGHT) */}
          {gallery.length > 1 && (
            <div className="absolute bottom-6 right-4 sm:right-8 z-20 flex items-center gap-2 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/15 p-2 shadow-2xl">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative h-12 w-16 sm:h-14 sm:w-20 overflow-hidden rounded-xl border-2 transition-all ${
                    i === activeImageIndex
                      ? "border-accent scale-105 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* HERO TITLE OVERLAY (BOTTOM LEFT) */}
          <div className="absolute bottom-6 left-0 right-28 sm:right-auto z-20">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-2xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground shadow-sm">
                    {pkg.category || "Tour Package"}
                  </span>
                  {pricing.discountPercent && (
                    <span className="rounded-full bg-destructive px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-destructive-foreground shadow-sm">
                      {pricing.discountPercent}% OFF · {pricing.offerCode}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
                  {pkg.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-slate-200">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span>{pkg.location}</span>
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>{pkg.duration}</span>
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>
                      {avgRating} ({reviews.length} verified reviews)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN BODY GRID */}
        <div className="container mx-auto px-4 lg:px-8 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* LEFT 2 COLUMNS: PACKAGE DETAILS */}
            <div className="lg:col-span-2 space-y-10">
              {/* DISCOUNT OFFER BANNER */}
              {pricing.listPrice > pricing.price && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl gradient-accent p-5 text-accent-foreground shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/20"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent-foreground animate-pulse" />
                      <p className="font-display font-bold text-lg leading-snug">Special Deal Applied!</p>
                    </div>
                    <p className="text-xs sm:text-sm opacity-90">
                      Save ₹{pricing.listPrice - pricing.price} per traveler with promo code{" "}
                      <strong className="underline decoration-accent-foreground">{pricing.offerCode}</strong>.
                    </p>
                  </div>
                  <div className="shrink-0 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2 text-center border border-white/20">
                    <p className="text-[11px] uppercase tracking-wider opacity-80">Regular Price</p>
                    <p className="font-display text-lg font-bold line-through opacity-90">₹{pricing.listPrice}</p>
                  </div>
                </motion.div>
              )}

              {/* OVERVIEW SECTION */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="surface-panel rounded-2xl p-6 sm:p-8 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Package Overview</h2>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {pkg.description}
                </p>

                {/* TRIP HIGHLIGHT PILLS */}
                <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border/60">
                  <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Stay</p>
                      <p className="text-xs font-semibold text-foreground">4/5-Star Resorts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3">
                    <Utensils className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Meals</p>
                      <p className="text-xs font-semibold text-foreground">Breakfast Included</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3">
                    <Car className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Transfers</p>
                      <p className="text-xs font-semibold text-foreground">AC Cab / Coach</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Group</p>
                      <p className="text-xs font-semibold text-foreground">Private & Shared</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ITINERARY SECTION */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="surface-panel rounded-2xl p-6 sm:p-8 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Day-by-Day Itinerary</h2>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground rounded-full bg-muted px-3 py-1">
                    {pkg.duration}
                  </span>
                </div>

                <div className="relative space-y-6 pl-2">
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-accent to-border" />

                  {pkg.itinerary && Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0 ? (
                    pkg.itinerary.map((dayItem: any, idx: number) => {
                      const dayTitle = typeof dayItem === "string" ? dayItem.replace(/^Day \d+:\s*/, "") : dayItem?.title || dayItem?.description || `Day ${idx + 1}`;
                      const dayDesc = typeof dayItem === "object" && dayItem?.title ? dayItem?.description : null;
                      return (
                        <div key={idx} className="relative flex items-start gap-4">
                          <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-accent font-display text-xs font-bold text-accent-foreground shadow-md ring-4 ring-background">
                            {idx + 1}
                          </div>

                          <div className="flex-1 rounded-xl bg-card border border-border/80 p-4 shadow-sm space-y-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-accent">
                              Day {idx + 1}
                            </p>
                            <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                              {dayTitle}
                            </p>
                            {dayDesc && (
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                                {dayDesc}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Detailed day-by-day plan will be provided upon booking confirmation.</p>
                  )}
                </div>
              </motion.div>

              {/* INCLUSIONS SECTION */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="surface-panel rounded-2xl p-6 sm:p-8 space-y-5"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">What's Included</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {pkg.included && pkg.included.length > 0 ? (
                    pkg.included.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl bg-card border border-border/60 p-3.5 shadow-sm"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-foreground">{item}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      {["Resort Accommodations", "Daily Breakfast & Dinner", "Guided Sightseeing Tours", "24/7 On-Call Support"].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-xl bg-card border border-border/60 p-3.5 shadow-sm">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-foreground">{item}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </motion.div>

              {/* REVIEWS SECTION WITH ADD REVIEW MODAL BUTTON */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="surface-panel rounded-2xl p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Verified Guest Reviews</h2>
                    <p className="text-xs text-muted-foreground">Authentic ratings & experiences shared by real travelers</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={() => {
                        resetReviewForm();
                        setReviewModalOpen(true);
                      }}
                      className="rounded-full border-0 gradient-accent px-4 py-2 text-xs font-bold text-accent-foreground gap-2 shadow-md hover:opacity-90 transition-all"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      <span>Write a Review</span>
                    </Button>

                    <div className="flex items-center gap-3 rounded-2xl bg-card border border-border/80 p-3 shadow-sm">
                      <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">{avgRating}</div>
                      <div>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-[11px] font-medium text-muted-foreground">{reviews.length} reviews</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="rounded-xl bg-card border border-border/60 p-4 sm:p-5 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-accent font-display font-bold text-accent-foreground text-xs">
                            {rev.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{rev.name}</p>
                            <p className="text-[11px] text-muted-foreground">{rev.date} · Verified Guest</p>
                          </div>
                        </div>

                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, starIdx) => (
                            <Star
                              key={starIdx}
                              className={`w-3.5 h-3.5 ${starIdx < rev.rating ? "fill-current" : "text-muted opacity-40"}`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        "{rev.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: STICKY BOOKING SIDEBAR */}
            <div className="lg:sticky lg:top-28">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-card rounded-2xl p-6 shadow-xl border border-border space-y-6"
              >
                {/* PRICING HEADER */}
                <div className="space-y-1 border-b border-border/60 pb-4">
                  <p className="text-xs font-medium text-muted-foreground">Pricing Starts From</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold text-foreground">₹{pricing.price}</span>
                    {pricing.listPrice > pricing.price && (
                      <span className="text-base text-muted-foreground line-through">₹{pricing.listPrice}</span>
                    )}
                    <span className="text-xs text-muted-foreground">/ person</span>
                  </div>
                  {pricing.offerCode && (
                    <div className="pt-1">
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                        {pricing.discountPercent}% OFF with {pricing.offerCode}
                      </span>
                    </div>
                  )}
                </div>

                {/* TRIP INPUTS */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Travel Date</span>
                      <span className="text-[11px] text-muted-foreground">Flexible scheduling</span>
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-medium text-foreground shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Number of Travelers</span>
                      <span className="text-[11px] text-muted-foreground">₹{pricing.price} × {travelersCount}</span>
                    </label>
                    <select
                      value={travelersCount}
                      onChange={(e) => setTravelersCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-medium text-foreground shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    >
                      <option value={1}>1 Traveler</option>
                      <option value={2}>2 Travelers</option>
                      <option value={3}>3 Travelers</option>
                      <option value={4}>4 Travelers</option>
                      <option value={5}>5+ Group Booking</option>
                    </select>
                  </div>
                </div>

                {/* TOTAL SUMMARY */}
                <div className="rounded-xl bg-muted/60 p-4 space-y-2 border border-border/50">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Base Fare ({travelersCount} pax)</span>
                    <span>₹{pricing.price * travelersCount}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Taxes & Service Fees</span>
                    <span className="text-emerald-500 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/60 pt-2">
                    <span>Total Estimate</span>
                    <span className="font-display text-xl font-bold text-primary">₹{pricing.price * travelersCount}</span>
                  </div>
                </div>

                {/* BOOK NOW BUTTON */}
                <Link to={`/booking/${pkg.id}`} className="block">
                  <Button className="w-full rounded-full border-0 gradient-accent py-3.5 text-accent-foreground font-bold text-sm shadow-md hover:opacity-90 transition-opacity">
                    Book Now
                  </Button>
                </Link>

                {/* TRUST & SECURITY BADGES */}
                <div className="space-y-2.5 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Free cancellation up to 48 hours prior</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Award className="w-4 h-4 text-accent shrink-0" />
                    <span>Best price & luxury stay guarantee</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <span>24/7 dedicated Kerala travel assistance desk</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* SIMILAR PACKAGES SECTION */}
          {relatedPackages.length > 0 && (
            <section className="mt-16 sm:mt-20 pt-10 border-t border-border/60">
              <SectionHeading badge="Recommended Vacations" title="Similar Packages You May Like" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {relatedPackages.map((p, i) => (
                  <PackageCard
                    key={p.id}
                    {...p}
                    index={i}
                    description=""
                    itinerary={[]}
                    included={[]}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* GUEST REVIEW ADD FORM MODAL DIALOG */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-border bg-card p-6 sm:p-8 select-none">
          {!reviewSubmitted ? (
            <>
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="font-display text-2xl font-bold text-foreground">
                  Write a Guest Review
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Share your experience for <strong className="text-foreground">{pkg.title}</strong> to help fellow travelers.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddReviewSubmit} className="space-y-4 pt-2">
                {/* RATING SELECTOR */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">Overall Rating</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          aria-label={`Rate ${star} star`}
                          className="p-1 transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= newReviewRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted hover:text-amber-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-accent">
                      {newReviewRating === 5 && "5 - Exceptional"}
                      {newReviewRating === 4 && "4 - Very Good"}
                      {newReviewRating === 3 && "3 - Average"}
                      {newReviewRating === 2 && "2 - Below Average"}
                      {newReviewRating === 1 && "1 - Poor"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* FULL NAME */}
                  <div className="space-y-1.5">
                    <Label htmlFor={`${formId}-rev-name`} className="text-xs font-bold text-foreground">
                      Full Name
                    </Label>
                    <Input
                      id={`${formId}-rev-name`}
                      placeholder="e.g. Rahul Sharma"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      required
                      className="rounded-xl border-border text-xs"
                    />
                  </div>

                  {/* TRAVEL MONTH / DATE */}
                  <div className="space-y-1.5">
                    <Label htmlFor={`${formId}-rev-date`} className="text-xs font-bold text-foreground">
                      Travel Month / Date
                    </Label>
                    <Input
                      id={`${formId}-rev-date`}
                      placeholder="e.g. Oct 2026"
                      value={newReviewDate}
                      onChange={(e) => setNewReviewDate(e.target.value)}
                      required
                      className="rounded-xl border-border text-xs"
                    />
                  </div>
                </div>

                {/* REVIEW TEXTAREA */}
                <div className="space-y-1.5">
                  <Label htmlFor={`${formId}-rev-text`} className="text-xs font-bold text-foreground">
                    Your Review & Experience
                  </Label>
                  <Textarea
                    id={`${formId}-rev-text`}
                    placeholder="Describe your tour experience, guides, accommodation, transport, and highlights..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    rows={4}
                    required
                    className="rounded-xl border-border text-xs leading-relaxed"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReviewModalOpen(false)}
                    className="rounded-full text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-full border-0 gradient-accent text-accent-foreground font-bold text-xs px-6 shadow-md hover:opacity-90"
                  >
                    Submit Review
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                <ThumbsUp className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-2xl font-bold text-foreground">Review Submitted!</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Thank you, <strong className="text-foreground">{newReviewName}</strong>! Your review for{" "}
                  <strong>{pkg.title}</strong> has been published.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="w-full rounded-full border-0 gradient-accent text-accent-foreground font-bold text-xs py-3"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PackageDetailsPage;
