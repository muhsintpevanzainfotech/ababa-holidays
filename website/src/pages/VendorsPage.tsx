import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Building2,
  Package,
  Globe,
  Compass,
  Car,
  Anchor,
  Sparkles,
  SlidersHorizontal,
  X,
  Heart,
  CheckCircle2,
  Award,
  Users,
  Briefcase,
  ArrowUpDown,
  Filter,
  PhoneCall,
  Check,
  ChevronRight,
  ArrowRight,
  ChevronDown,
  Palmtree,
  Mountain,
  Plane,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchVendorsStart } from "@/store/slices/vendorSlice";
import { fetchServicesStart } from "@/store/slices/servicesSlice";
import { getImageUrl } from "@/lib/imageHelper";
import { getVendorSlug } from "@/lib/utils";

import destKerala from "@/assets/dest-kerala-backwaters.jpg";
import destSantorini from "@/assets/dest-santorini.jpg";
import destMunnar from "@/assets/dest-munnar.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destParis from "@/assets/dest-paris.jpg";

const fallbackBanners = [destKerala, destSantorini, destMunnar, destDubai, destParis];

interface VendorItem {
  id: string;
  _id?: string;
  name: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  logo?: string;
  coverImage?: string;
  coverBanner?: string;
  banner?: string;
  image?: string;
  rating?: number;
  sold?: number;
  priceLevel?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  fullAddress?: string;
  verified?: boolean;
  isVerified?: boolean;
  isSuspended?: boolean;
  category?: string;
  vendorType?: string;
  description?: string;
  services?: string[];
  selectedServices?: any[];
  specialties?: string[];
  createdAt?: string;
}

const getCleanLocation = (vendor: VendorItem) => {
  const isObjectId = (str?: string) => Boolean(str && /^[0-9a-fA-F]{24}$/.test(str.trim()));
  const city = vendor.city && !isObjectId(vendor.city) ? vendor.city.trim() : "";
  const state = vendor.state && !isObjectId(vendor.state) ? vendor.state.trim() : "";
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  if (vendor.location && !isObjectId(vendor.location)) {
    const parts = vendor.location.split(",").map((p) => p.trim()).filter((p) => p && !isObjectId(p));
    if (parts.length > 0) return parts.join(", ");
  }
  return vendor.country && !isObjectId(vendor.country) ? vendor.country : "Verified Hub";
};

const getCleanDescription = (vendor: VendorItem) => {
  const raw = vendor.description?.trim() || "";
  if (raw.length >= 15 && !/^(text|ttextt|test|asdf|qwerty|xcv)/i.test(raw)) {
    return raw;
  }
  const vendorName = vendor.companyName || vendor.name || "Travel Partner";
  return `${vendorName} is an authorized travel agency providing certified holiday tours, customized vacation itineraries, and direct booking support.`;
};

const getVendorCover = (vendor: VendorItem, index: number) => {
  const defaultBanner = fallbackBanners[index % fallbackBanners.length];
  const raw = vendor.coverBanner || vendor.coverImage || vendor.banner || vendor.image;
  if (raw && typeof raw === "string" && !raw.includes("ui-avatars") && !/^\d+$/.test(raw.trim()) && raw.trim() !== "/favicon.png") {
    return getImageUrl(raw, defaultBanner);
  }
  return defaultBanner;
};

const getVendorLogo = (vendor: VendorItem) => {
  const raw = vendor.logo || vendor.avatar;
  if (raw && typeof raw === "string" && !raw.includes("ui-avatars") && !/^\d+$/.test(raw.trim()) && raw.trim() !== "/favicon.png") {
    return getImageUrl(raw);
  }
  return null;
};

// ============================================================================
// HIGH-FIDELITY VENDOR CARD SKELETON
// ============================================================================
const VendorCardSkeleton = () => {
  return (
    <div className="rounded-3xl bg-card border border-border/80 shadow-card flex flex-col justify-between overflow-hidden animate-pulse">
      {/* Banner Skeleton */}
      <div className="relative p-3 pb-0">
        <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-muted/80">
          <div className="absolute top-3 left-3 h-6 w-28 rounded-full bg-background/50" />
          <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/50" />
        </div>

        {/* Overlapping Brand Logo / Avatar */}
        <div className="absolute left-6 -bottom-5 flex items-center justify-center">
          <div className="h-14 w-14 rounded-2xl border-3 border-card bg-muted shadow-xl" />
        </div>
      </div>

      {/* Card Body Skeleton */}
      <div className="p-5 pt-8 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="h-5 w-3/4 rounded-lg bg-muted" />

          {/* Location & Category */}
          <div className="flex items-center justify-between gap-2">
            <div className="h-3.5 w-1/2 rounded bg-muted/70" />
            <div className="h-4 w-14 rounded-md bg-muted/60" />
          </div>

          {/* Description Lines */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full rounded bg-muted/60" />
            <div className="h-3 w-5/6 rounded bg-muted/60" />
          </div>

          {/* Service Pills */}
          <div className="flex gap-1.5 pt-1">
            <div className="h-5 w-16 rounded-lg bg-muted/70" />
            <div className="h-5 w-20 rounded-lg bg-muted/70" />
            <div className="h-5 w-14 rounded-lg bg-muted/70" />
          </div>
        </div>

        {/* Metric Grid Skeleton */}
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-3 rounded-2xl bg-muted/50 p-2.5 text-center divide-x divide-border/60 border border-border/40">
            <div className="h-7 rounded bg-muted/70" />
            <div className="h-7 rounded bg-muted/70" />
            <div className="h-7 rounded bg-muted/70" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-10 flex-1 rounded-xl bg-muted" />
            <div className="h-10 w-10 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN VENDORS DIRECTORY PAGE
// ============================================================================
const VendorsPage = () => {
  const dispatch = useAppDispatch();
  const { vendors: reduxVendors, loading } = useAppSelector((state) => state.vendor);
  const { services: reduxServices, loading: servicesLoading } = useAppSelector((state) => state.services);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified">("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"rating" | "popular" | "name" | "newest">("rating");
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [wishlistState, setWishlistState] = useState<Record<string, boolean>>({});
  const [activeModalVendor, setActiveModalVendor] = useState<VendorItem | null>(null);

  useEffect(() => {
    dispatch(fetchVendorsStart());
    if (!reduxServices || reduxServices.length === 0) {
      dispatch(fetchServicesStart());
    }
  }, [dispatch, reduxServices]);

  const rawVendors: VendorItem[] = (reduxVendors as any) || [];

  // Dynamic Service Categories strictly from API
  const dynamicCategories = useMemo(() => {
    const list: Array<{ id: string; label: string; icon?: any; image?: string }> = [
      { id: "all", label: "All Services", icon: Sparkles, image: "" },
    ];

    if (Array.isArray(reduxServices) && reduxServices.length > 0) {
      reduxServices.forEach((s: any) => {
        const sId = String(s._id || s.id || s.title || "");
        const sTitle = String(s.title || s.name || "").trim();
        const sImage = s.icon || s.image || s.thumbnail;
        if (sTitle) {
          list.push({
            id: sId,
            label: sTitle,
            image: sImage ? getImageUrl(sImage) : undefined,
          });
        }
      });
    }

    return list;
  }, [reduxServices]);

  // Extract unique locations for filtering
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    rawVendors.forEach((v) => {
      const loc = getCleanLocation(v);
      const city = loc.split(",")[0]?.trim();
      if (city && city !== "South India" && city !== "Verified Hub" && !/^[0-9a-fA-F]{24}$/.test(city)) {
        locSet.add(city);
      }
    });
    return Array.from(locSet).sort();
  }, [rawVendors]);

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    return rawVendors
      .filter((vendor) => {
        // Exclude suspended vendors
        if (vendor.isSuspended) return false;

        const locText = getCleanLocation(vendor);
        const descText = getCleanDescription(vendor);

        // Search text matching
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          vendor.name?.toLowerCase().includes(searchLower) ||
          vendor.companyName?.toLowerCase().includes(searchLower) ||
          locText.toLowerCase().includes(searchLower) ||
          descText.toLowerCase().includes(searchLower) ||
          (vendor.services || []).some((s) => String(s).toLowerCase().includes(searchLower));

        // Category / Service matching via API data
        let matchesCategory = true;
        if (selectedCategory !== "all") {
          const activeServiceObj = dynamicCategories.find((c) => c.id === selectedCategory);
          const activeLabel = (activeServiceObj ? activeServiceObj.label : selectedCategory).toLowerCase();

          const vServices = (vendor.services || []).map((s) => String(s).toLowerCase());
          const vSelectedServices = (vendor.selectedServices || []).map((s) =>
            typeof s === "object" && s !== null ? String(s.title || s.name || s._id || "").toLowerCase() : String(s).toLowerCase()
          );
          const vCategory = String(vendor.category || "").toLowerCase();
          const vType = String(vendor.vendorType || "").toLowerCase();

          matchesCategory =
            vServices.some((s) => s.includes(activeLabel) || activeLabel.includes(s)) ||
            vSelectedServices.some((s) => s.includes(activeLabel) || s === selectedCategory.toLowerCase()) ||
            vCategory.includes(activeLabel) ||
            vType.includes(activeLabel);
        }

        // Verification filter
        let matchesVerification = true;
        if (verificationFilter === "verified") {
          matchesVerification = vendor.isVerified === true || vendor.verified === true;
        }

        // Location filter
        let matchesLocation = true;
        if (locationFilter !== "all") {
          matchesLocation = locText.toLowerCase().includes(locationFilter.toLowerCase());
        }

        return matchesSearch && matchesCategory && matchesVerification && matchesLocation;
      })
      .sort((a, b) => {
        if (sortBy === "rating") {
          return (b.rating || 5.0) - (a.rating || 5.0);
        }
        if (sortBy === "popular") {
          return (b.sold || 0) - (a.sold || 0);
        }
        if (sortBy === "name") {
          return (a.name || a.companyName || "").localeCompare(b.name || b.companyName || "");
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        return 0;
      });
  }, [rawVendors, searchTerm, selectedCategory, dynamicCategories, verificationFilter, locationFilter, sortBy]);

  const toggleWishlist = (vendor: VendorItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const vId = vendor.id || vendor._id || "";
    const nextState = !wishlistState[vId];
    setWishlistState((prev) => ({ ...prev, [vId]: nextState }));
    toast({
      title: nextState ? "Partner Saved" : "Removed",
      description: `${vendor.name || vendor.companyName} ${nextState ? "added to your saved partners list." : "removed from saved partners."}`,
    });
  };

  const totalVerifiedCount = rawVendors.filter((v) => v.isVerified || v.verified).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent selection:text-white">
      <Navbar />

      {/* ============================================================ */}
      {/* 1. HERO SECTION WITH BACKGROUND IMAGE                        */}
      {/* ============================================================ */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 bg-slate-950 text-white overflow-hidden">
        {/* Background Image with Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={destSantorini}
            alt="Travel Partners Background"
            className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.15] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/80 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-slate-950/85" />
        </div>

        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* ============================================================ */}
        {/* FLOATING DESTINATION CARDS & BADGES (LEFT & RIGHT SIDES)     */}
        {/* ============================================================ */}

        {/* --- LEFT SIDE FLOATING ELEMENTS --- */}
        {/* Top Left Card: Kerala Backwaters */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:block absolute left-3 xl:left-8 2xl:left-14 top-32 xl:top-36 z-20 pointer-events-auto"
        >
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [-0.5, 0.5, -0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.45)] hover:border-emerald-500/40 hover:scale-105 transition-all max-w-[240px] xl:max-w-[270px] group cursor-default"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20">
              <img
                src={destKerala}
                alt="Kerala Backwaters"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                <Palmtree className="w-3 h-3 text-emerald-400" />
                <span>Kerala Backwaters</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                Houseboat & Beach Tours
              </h4>
              <p className="text-[10px] text-slate-300 font-medium">★ 4.9 • 120+ Packages</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Center-Left Floating Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="hidden 2xl:block absolute left-6 2xl:left-12 top-[48%] -translate-y-1/2 z-20 pointer-events-auto"
        >
          <motion.div
            animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 text-white shadow-xl hover:border-emerald-400/60 transition-all cursor-default"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-200">250+ Certified Guides</span>
          </motion.div>
        </motion.div>

        {/* Bottom Left Card: Munnar Highlands */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:block absolute left-4 xl:left-10 2xl:left-16 bottom-16 xl:bottom-20 z-20 pointer-events-auto"
        >
          <motion.div
            animate={{ y: [0, 12, 0], rotate: [0.5, -0.5, 0.5] }}
            transition={{ duration: 6, delay: 0.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.45)] hover:border-sky-500/40 hover:scale-105 transition-all max-w-[240px] xl:max-w-[270px] group cursor-default"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20">
              <img
                src={destMunnar}
                alt="Munnar Highlands"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1 text-[10px] font-extrabold text-sky-400 uppercase tracking-wider">
                <Mountain className="w-3 h-3 text-sky-400" />
                <span>Munnar Highlands</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                Tea Resorts & Treks
              </h4>
              <p className="text-[10px] text-slate-300 font-medium">Direct Local Rates</p>
            </div>
          </motion.div>
        </motion.div>

        {/* --- RIGHT SIDE FLOATING ELEMENTS --- */}
        {/* Top Right Card: Santorini Greece */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:block absolute right-3 xl:right-8 2xl:right-14 top-32 xl:top-36 z-20 pointer-events-auto"
        >
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0.5, -0.5, 0.5] }}
            transition={{ duration: 5.5, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.45)] hover:border-amber-500/40 hover:scale-105 transition-all max-w-[240px] xl:max-w-[270px] group cursor-default"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20">
              <img
                src={destSantorini}
                alt="Santorini Greece"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                <Globe className="w-3 h-3 text-amber-400" />
                <span>Global DMCs</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                Santorini & Europe
              </h4>
              <p className="text-[10px] text-slate-300 font-medium">★ 5.0 • Luxury Getaways</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Center-Right Floating Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="hidden 2xl:block absolute right-6 2xl:right-12 top-[48%] -translate-y-1/2 z-20 pointer-events-auto"
        >
          <motion.div
            animate={{ y: [0, -10, 0], x: [0, -4, 0] }}
            transition={{ duration: 4.8, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-sky-500/30 text-white shadow-xl hover:border-sky-400/60 transition-all cursor-default"
          >
            <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
              <Plane className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-200">Instant B2B Quotes</span>
          </motion.div>
        </motion.div>

        {/* Bottom Right Card: Dubai Desert & Skyline */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="hidden lg:block absolute right-4 xl:right-10 2xl:right-16 bottom-16 xl:bottom-20 z-20 pointer-events-auto"
        >
          <motion.div
            animate={{ y: [0, 10, 0], rotate: [-0.5, 0.5, -0.5] }}
            transition={{ duration: 5.8, delay: 1, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.45)] hover:border-purple-500/40 hover:scale-105 transition-all max-w-[240px] xl:max-w-[270px] group cursor-default"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20">
              <img
                src={destDubai}
                alt="Dubai Skyline"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1 text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Dubai & GCC</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                Desert Safaris & City Stays
              </h4>
              <p className="text-[10px] text-slate-300 font-medium">Visa & Transfers Included</p>
            </div>
          </motion.div>
        </motion.div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm backdrop-blur-md"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized Partner & Agency Network</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight leading-tight text-white mb-6"
          >
            Verified Travel Partners & <br />
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Certified Tour Operators
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6"
          >
            Connect directly with verified destination management companies, luxury resort chains, fleet operators, and certified local guides across India & worldwide.
          </motion.p>

          {/* Become a Partner Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex items-center justify-center gap-3 mb-10 flex-wrap"
          >
            <Link to="/vendor-register">
              <Button className="gradient-accent text-accent-foreground font-bold rounded-full px-7 h-12 text-sm shadow-xl shadow-accent/20 hover:opacity-90 transition-all flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Join as Travel Partner</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Quick Metrics Bar with High Contrast Text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto p-4 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl text-white"
          >
            <div className="p-3 text-center">
              {loading ? (
                <div className="h-8 w-16 mx-auto rounded-lg bg-slate-800 animate-pulse" />
              ) : (
                <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400">{totalVerifiedCount}+</div>
              )}
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200 mt-1">Verified Partners</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl sm:text-3xl font-display font-black text-sky-400">100%</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200 mt-1">KYC Screened</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl sm:text-3xl font-display font-black text-amber-400">5.0 ★</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200 mt-1">Customer Trust</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl sm:text-3xl font-display font-black text-purple-400">24/7</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200 mt-1">Direct Support</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. DYNAMIC SEARCH & FILTER SUITE                             */}
      {/* ============================================================ */}
      <section className="py-5 bg-background border-b border-border/80 relative z-20 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 space-y-3">
          
          {/* Top Row: Search Input + Location Dropdown + Sort Dropdown + Verification Toggle */}
          <div className="flex flex-col lg:flex-row items-center gap-3">
            
            {/* Search Input */}
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              <Input
                type="text"
                placeholder="Search partners by name, city, service, or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-10 h-12 rounded-2xl bg-card border-border shadow-inner text-sm font-semibold focus-visible:ring-accent"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Buttons & Styled Custom Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto overflow-visible">
              
              {/* Custom Location Dropdown */}
              {availableLocations.length > 0 && (
                <div className={`relative shrink-0 ${locationDropdownOpen ? "z-50" : "z-20"}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocationDropdownOpen((prev) => !prev);
                      setSortDropdownOpen(false);
                    }}
                    className={`h-12 px-4 rounded-2xl bg-card border transition-all flex items-center gap-2.5 text-xs font-extrabold shadow-sm ${
                      locationDropdownOpen
                        ? "border-accent ring-2 ring-accent/20 text-accent"
                        : locationFilter !== "all"
                        ? "border-rose-500/50 text-foreground bg-rose-500/5"
                        : "border-border text-foreground hover:border-accent hover:bg-muted"
                    }`}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/15 text-rose-500 shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate max-w-[130px]">
                      {locationFilter === "all" ? "All Locations" : locationFilter}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                        locationDropdownOpen ? "rotate-180 text-accent" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {locationDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setLocationDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.96 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute left-0 top-full mt-2 w-64 max-h-72 overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-1.5 z-50 space-y-1 backdrop-blur-xl ring-1 ring-black/10"
                        >
                          <div className="px-3 py-2 border-b border-border/60 mb-1 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filter by Hub</span>
                            {locationFilter !== "all" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setLocationFilter("all");
                                  setLocationDropdownOpen(false);
                                }}
                                className="text-[10px] font-bold text-accent hover:underline"
                              >
                                Reset
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setLocationFilter("all");
                              setLocationDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                              locationFilter === "all"
                                ? "bg-accent/15 text-accent"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5 text-sky-500" />
                              <span>All Locations</span>
                            </div>
                            {locationFilter === "all" && <Check className="w-3.5 h-3.5 text-accent" />}
                          </button>

                          {availableLocations.map((loc) => {
                            const isSelected = locationFilter.toLowerCase() === loc.toLowerCase();
                            return (
                              <button
                                key={loc}
                                type="button"
                                onClick={() => {
                                  setLocationFilter(loc);
                                  setLocationDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                                  isSelected
                                    ? "bg-rose-500/15 text-rose-500"
                                    : "text-foreground hover:bg-muted"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <span className="truncate">{loc}</span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Custom Sort By / Top Rated Dropdown */}
              <div className={`relative shrink-0 ${sortDropdownOpen ? "z-50" : "z-20"}`}>
                <button
                  type="button"
                  onClick={() => {
                    setSortDropdownOpen((prev) => !prev);
                    setLocationDropdownOpen(false);
                  }}
                  className={`h-12 px-4 rounded-2xl bg-card border transition-all flex items-center gap-2.5 text-xs font-extrabold shadow-sm ${
                    sortDropdownOpen
                      ? "border-accent ring-2 ring-accent/20 text-accent"
                      : "border-border text-foreground hover:border-accent hover:bg-muted"
                  }`}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 shrink-0">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate max-w-[130px]">
                    {sortBy === "rating"
                      ? "Top Rated"
                      : sortBy === "popular"
                      ? "Most Tours Sold"
                      : sortBy === "name"
                      ? "Name (A-Z)"
                      : "Newest"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                      sortDropdownOpen ? "rotate-180 text-accent" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {sortDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setSortDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-card border border-border shadow-2xl p-1.5 z-50 space-y-1 backdrop-blur-xl ring-1 ring-black/10"
                      >
                        <div className="px-3 py-2 border-b border-border/60 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sort Partners</span>
                        </div>

                        {[
                          { id: "rating", label: "Top Rated", icon: Star, iconColor: "text-amber-400 fill-amber-400" },
                          { id: "popular", label: "Most Tours Sold", icon: Sparkles, iconColor: "text-sky-400" },
                          { id: "name", label: "Name (A-Z)", icon: ArrowUpDown, iconColor: "text-purple-400" },
                          { id: "newest", label: "Newest Registered", icon: ShieldCheck, iconColor: "text-emerald-400" },
                        ].map((opt) => {
                          const isSelected = sortBy === opt.id;
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setSortBy(opt.id as any);
                                setSortDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                                isSelected
                                  ? "bg-accent/15 text-accent"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={`w-3.5 h-3.5 ${opt.iconColor}`} />
                                <span>{opt.label}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Verification Toggle */}
              <div className="flex items-center p-1 rounded-2xl bg-muted/80 border border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setVerificationFilter("all")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    verificationFilter === "all"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Partners
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationFilter("verified")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    verificationFilter === "verified"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Only
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Dynamic Service Category Tabs from API */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide pt-0.5">
            {servicesLoading && dynamicCategories.length <= 1 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 w-28 rounded-2xl bg-muted animate-pulse shrink-0" />
              ))
            ) : (
              dynamicCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 border transition-all ${
                      isSelected
                        ? "gradient-accent text-accent-foreground border-transparent shadow-md scale-[1.02]"
                        : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt=""
                        className="w-4 h-4 rounded-md object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : cat.icon ? (
                      <cat.icon className="w-3.5 h-3.5 shrink-0" />
                    ) : null}
                    <span>{cat.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. VENDORS DIRECTORY GRID                                    */}
      {/* ============================================================ */}
      <section className="py-10 flex-1 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          
          {/* Active Filters Summary Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-foreground">
                Showing {filteredVendors.length} {filteredVendors.length === 1 ? "Travel Partner" : "Travel Partners"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedCategory !== "all"
                  ? `Filtered by ${dynamicCategories.find((c) => c.id === selectedCategory)?.label || selectedCategory}`
                  : "All certified travel providers, resort operators & local agencies"}
              </p>
            </div>

            {(searchTerm || selectedCategory !== "all" || verificationFilter !== "all" || locationFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setVerificationFilter("all");
                  setLocationFilter("all");
                }}
                className="text-xs font-bold text-muted-foreground hover:text-accent gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </Button>
            )}
          </div>

          {/* Grid or Empty / Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <VendorCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="w-full py-20 px-6 rounded-3xl border border-dashed border-border text-center bg-card max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">No Travel Partners Match Your Filters</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Try searching for a different destination or clearing specific category and verification filters.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setVerificationFilter("all");
                  setLocationFilter("all");
                }}
                className="rounded-2xl gradient-accent text-accent-foreground font-bold px-6"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVendors.map((vendor, index) => {
                const vId = vendor.id || vendor._id || `v-${index}`;
                const vendorName = vendor.companyName || vendor.name || "Travel Partner";
                const isVerified = vendor.isVerified || vendor.verified;
                const coverImg = getVendorCover(vendor, index);
                const logoImg = getVendorLogo(vendor);
                const locationText = getCleanLocation(vendor);
                const descText = getCleanDescription(vendor);
                const ratingVal = vendor.rating ? Number(vendor.rating).toFixed(1) : "5.0";
                const toursSold = vendor.sold || 0;
                const priceLevel = vendor.priceLevel || "$$";
                const isWishlisted = !!wishlistState[vId];
                const servicesList = vendor.services || [];

                return (
                  <motion.div
                    key={vId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className="rounded-3xl bg-card border border-border/80 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden group relative"
                  >
                    {/* Banner & Badges */}
                    <div className="relative p-3 pb-0">
                      <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-muted">
                        <img
                          src={coverImg}
                          alt={vendorName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackBanners[index % fallbackBanners.length];
                          }}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                        {/* Top Left: Verification Status Badge */}
                        {isVerified ? (
                          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-emerald-500/30 shadow-sm">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            Verified Partner
                          </span>
                        ) : (
                          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                            Registered Agency
                          </span>
                        )}

                        {/* Top Right: Wishlist Bookmark */}
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(vendor, e)}
                          aria-label="Save to Wishlist"
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                            isWishlisted
                              ? "bg-rose-500 text-white shadow-md"
                              : "bg-black/50 text-white/80 hover:text-white hover:bg-black/70"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      {/* Overlapping Brand Logo / Avatar */}
                      <div className="absolute left-6 -bottom-5 flex items-center justify-center">
                        <div className="h-14 w-14 rounded-2xl border-3 border-card bg-card shadow-xl flex items-center justify-center overflow-hidden">
                          {logoImg ? (
                            <img src={logoImg} alt={vendorName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full gradient-accent text-accent-foreground font-extrabold flex items-center justify-center text-lg">
                              {vendorName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 pt-8 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-display text-lg font-extrabold text-foreground leading-snug line-clamp-1 group-hover:text-accent transition-colors">
                            {vendorName}
                          </h3>
                        </div>

                        {/* Classification & Location */}
                        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-muted-foreground mb-2.5">
                          <span className="inline-flex items-center gap-1.5 text-foreground truncate max-w-[170px]">
                            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span className="truncate">{locationText}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-muted-foreground uppercase shrink-0">
                            {vendor.category || vendor.vendorType || "Agency"}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                          {descText}
                        </p>

                        {/* Services Offered Badges */}
                        {servicesList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {servicesList.slice(0, 3).map((srv, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-lg bg-muted text-foreground border border-border/60 truncate max-w-[140px]"
                              >
                                {srv}
                              </span>
                            ))}
                            {servicesList.length > 3 && (
                              <span className="text-[10px] font-bold text-accent px-1 self-center">
                                +{servicesList.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Metric Grid */}
                      <div className="grid grid-cols-3 rounded-2xl bg-muted/60 p-2.5 text-center divide-x divide-border/60 border border-border/40">
                        <div className="flex flex-col items-center justify-center px-1">
                          <div className="flex items-center gap-1 font-display text-xs font-bold text-foreground">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>{ratingVal}</span>
                          </div>
                          <span className="text-[8.5px] font-bold tracking-widest text-muted-foreground uppercase mt-0.5">
                            RATING
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center px-1">
                          <span className="font-display text-xs font-bold text-foreground">
                            {toursSold > 0 ? `${toursSold}+` : "Verified"}
                          </span>
                          <span className="text-[8.5px] font-bold tracking-widest text-muted-foreground uppercase mt-0.5">
                            TOURS
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center px-1">
                          <span className="font-display text-xs font-bold text-emerald-500">
                            {priceLevel}
                          </span>
                          <span className="text-[8.5px] font-bold tracking-widest text-muted-foreground uppercase mt-0.5">
                            PRICE
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center gap-2 pt-1">
                        <Link to={`/vendor/${getVendorSlug(vendor)}`} className="flex-1">
                          <Button
                            type="button"
                            className="w-full h-10 rounded-xl gradient-accent text-accent-foreground font-extrabold text-xs shadow-sm gap-1.5 hover:scale-[1.02] active:scale-95 border-0"
                          >
                            <span>Explore Store</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveModalVendor(vendor)}
                          className="h-10 px-3 rounded-xl border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Quick Contact & Profile"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. PARTNER ONBOARDING CTA BANNER                             */}
      {/* ============================================================ */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 sm:p-12 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="space-y-3 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-400">
                <Briefcase className="w-4 h-4" /> Partner Opportunities
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                Are you a Travel Agency or Resort Operator?
              </h3>
              <p className="text-sm text-slate-300 max-w-xl">
                Join Ababa Travels certified partner network. List your holiday packages, access traveler enquiries, manage direct bookings, and grow your revenue.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link to="/vendor-register">
                <Button className="h-12 px-6 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold shadow-lg gap-2">
                  <span>Register As Partner</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. VENDOR DETAILS QUICK CONTACT MODAL                        */}
      {/* ============================================================ */}
      <AnimatePresence mode="wait">
        {activeModalVendor && (
          <div key="vendor-detail-dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalVendor(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-card border border-border shadow-2xl"
            >
              {/* Modal Banner */}
              <div className="relative h-44 w-full bg-muted">
                <img
                  src={getVendorCover(activeModalVendor, 0)}
                  alt={activeModalVendor.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = destKerala;
                  }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <button
                  type="button"
                  onClick={() => setActiveModalVendor(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="absolute bottom-4 left-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-accent text-accent-foreground border-0 text-[10px] uppercase font-bold">
                      {activeModalVendor.category || "Partner"}
                    </Badge>
                    {(activeModalVendor.isVerified || activeModalVendor.verified) && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified Partner
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl font-bold">{activeModalVendor.companyName || activeModalVendor.name}</h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    About Partner
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {getCleanDescription(activeModalVendor)}
                  </p>
                </div>

                {/* Direct Contact Card */}
                <div className="rounded-2xl bg-muted/60 p-4 space-y-2.5 text-sm">
                  <div className="flex items-center gap-3 text-foreground">
                    <MapPin className="h-4 w-4 text-accent shrink-0" />
                    <span>{getCleanLocation(activeModalVendor)}</span>
                  </div>
                  {activeModalVendor.phone && (
                    <div className="flex items-center gap-3 text-foreground">
                      <Phone className="h-4 w-4 text-accent shrink-0" />
                      <a href={`tel:${activeModalVendor.phone}`} className="hover:underline font-bold">
                        {activeModalVendor.phone}
                      </a>
                    </div>
                  )}
                  {activeModalVendor.email && (
                    <div className="flex items-center gap-3 text-foreground">
                      <Mail className="h-4 w-4 text-accent shrink-0" />
                      <a href={`mailto:${activeModalVendor.email}`} className="hover:underline">
                        {activeModalVendor.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    to={`/vendor/${getVendorSlug(activeModalVendor)}`}
                    onClick={() => setActiveModalVendor(null)}
                    className="flex-1"
                  >
                    <Button
                      type="button"
                      className="w-full h-12 rounded-2xl gradient-accent text-accent-foreground font-bold gap-2 shadow-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Explore Partner Store
                    </Button>
                  </Link>

                  {activeModalVendor.phone && (
                    <a href={`tel:${activeModalVendor.phone}`} className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-2xl gap-2 font-bold"
                      >
                        <Phone className="h-4 w-4 text-accent" />
                        Call Direct
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default VendorsPage;
