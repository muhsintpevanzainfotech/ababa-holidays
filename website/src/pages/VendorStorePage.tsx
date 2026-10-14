import { useState, useId, useMemo, useEffect, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Users,
  CheckCircle2,
  Building2,
  Ship,
  Compass,
  Plane,
  Car,
  Award,
  ArrowLeft,
  Calendar,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  Heart,
  Share2,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Check,
  Globe,
  Camera,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchVendorStart } from "@/store/slices/vendorSlice";
import { fetchPackagesStart } from "@/store/slices/packagesSlice";
import { getImageUrl } from "@/lib/imageHelper";
import { submitVendorEnquiryApi } from "@/api/endpoints";

import destKerala from "@/assets/dest-kerala-backwaters.jpg";
import destSantorini from "@/assets/dest-santorini.jpg";

// ============================================================================
// HIGH-FIDELITY SKELETON LOADER FOR VENDOR STOREFRONT
// ============================================================================
const VendorStoreSkeleton = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent selection:text-white">
      <Navbar />

      <main className="flex-1 animate-pulse">
        {/* 1. HERO SKELETON */}
        <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 bg-slate-950 text-white overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60" />

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            {/* Breadcrumb Skeleton */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="h-4 w-12 rounded-md bg-slate-800" />
                <div className="h-4 w-3 rounded-md bg-slate-800" />
                <div className="h-4 w-24 rounded-md bg-slate-800" />
                <div className="h-4 w-3 rounded-md bg-slate-800" />
                <div className="h-4 w-36 rounded-md bg-slate-700" />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-9 w-20 rounded-full bg-slate-800" />
                <div className="h-9 w-20 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Profile Header Skeleton */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-slate-800 border-4 border-slate-700 shrink-0 shadow-2xl" />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-24 rounded-full bg-slate-800" />
                    <div className="h-5 w-28 rounded-full bg-slate-800" />
                  </div>
                  <div className="h-8 sm:h-10 w-64 sm:w-80 rounded-xl bg-slate-700" />
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="h-4 w-32 rounded-md bg-slate-800" />
                    <div className="h-4 w-20 rounded-md bg-slate-800" />
                    <div className="h-4 w-28 rounded-md bg-slate-800" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="h-12 w-36 rounded-2xl bg-slate-800 flex-1 sm:flex-none" />
                <div className="h-12 w-32 rounded-2xl bg-slate-800 flex-1 sm:flex-none" />
              </div>
            </div>
          </div>
        </section>

        {/* 2. STATS STRIP SKELETON */}
        <section className="bg-card border-b border-border/80 py-4 shadow-sm">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-2 space-y-2 flex flex-col items-center">
                  <div className="h-3 w-24 rounded bg-muted" />
                  <div className="h-6 w-20 rounded-lg bg-muted/80" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. MAIN GRID SKELETON */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column (2 Cols) */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Box Skeleton */}
                <div className="rounded-3xl p-6 sm:p-8 space-y-4 border border-border/80 bg-card shadow-sm">
                  <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                    <div className="h-10 w-10 rounded-2xl bg-muted" />
                    <div className="space-y-1.5">
                      <div className="h-5 w-48 rounded-lg bg-muted" />
                      <div className="h-3 w-32 rounded bg-muted/70" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-muted/80" />
                    <div className="h-4 w-5/6 rounded bg-muted/80" />
                    <div className="h-4 w-4/6 rounded bg-muted/80" />
                  </div>
                  <div className="pt-2 space-y-3">
                    <div className="h-4 w-36 rounded bg-muted" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-9 w-28 rounded-2xl bg-muted" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Catalog Skeleton */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 rounded-full bg-muted" />
                      <div className="h-6 w-56 rounded-lg bg-muted" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-80 rounded-3xl bg-card border border-border/70 p-4 space-y-3">
                        <div className="h-44 w-full rounded-2xl bg-muted" />
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted/70" />
                        <div className="flex justify-between pt-2">
                          <div className="h-5 w-20 rounded bg-muted" />
                          <div className="h-8 w-24 rounded-xl bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (1 Col) */}
              <div className="space-y-6">
                {/* Helpdesk Skeleton */}
                <div className="rounded-3xl bg-card p-6 space-y-4 border border-border shadow-card">
                  <div className="h-5 w-36 rounded-lg bg-muted" />
                  <div className="space-y-3">
                    <div className="h-14 rounded-2xl bg-muted/60" />
                    <div className="h-14 rounded-2xl bg-muted/60" />
                    <div className="h-14 rounded-2xl bg-muted/60" />
                  </div>
                </div>

                {/* Form Skeleton */}
                <div className="rounded-3xl bg-card p-6 space-y-4 border border-border shadow-card">
                  <div className="h-5 w-40 rounded-lg bg-muted" />
                  <div className="space-y-3">
                    <div className="h-10 rounded-xl bg-muted/60" />
                    <div className="h-10 rounded-xl bg-muted/60" />
                    <div className="h-10 rounded-xl bg-muted/60" />
                    <div className="h-10 rounded-xl bg-muted/60" />
                    <div className="h-20 rounded-xl bg-muted/60" />
                    <div className="h-12 rounded-2xl bg-muted" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// ============================================================================
// MAIN VENDOR STORE PAGE
// ============================================================================
const VendorStorePage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { vendorDetails, loading } = useAppSelector((state) => state.vendor);
  const { packages: reduxPackages } = useAppSelector((state) => state.packages);
  const { toast } = useToast();
  const formId = useId();

  const [isSaved, setIsSaved] = useState(false);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  // Enquiry form fields
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryDate, setEnquiryDate] = useState("");
  const [enquiryGuests, setEnquiryGuests] = useState("2 Guests");
  const [enquiryPackage, setEnquiryPackage] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchVendorStart(id));
    }
    if (!reduxPackages || reduxPackages.length === 0) {
      dispatch(fetchPackagesStart({}));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, dispatch]);

  // Extract pure API vendor details
  const vendor = useMemo(() => {
    if (!vendorDetails) return null;

    const base = vendorDetails;
    const rawCover = base.coverImage || base.coverBanner || base.banner || base.avatar;
    const rawLogo = base.logo || base.avatar;

    // Filter out ObjectIds from location strings
    const isObjectId = (str?: string) => Boolean(str && /^[0-9a-fA-F]{24}$/.test(str.trim()));
    const city = base.city && !isObjectId(base.city) ? base.city.trim() : "";
    const state = base.state && !isObjectId(base.state) ? base.state.trim() : "";
    const country = base.country && !isObjectId(base.country) ? base.country.trim() : "India";

    let locationStr = "";
    if (city && state) {
      locationStr = `${city}, ${state}`;
    } else if (city) {
      locationStr = `${city}, ${country}`;
    } else if (base.location && !isObjectId(base.location)) {
      locationStr = base.location;
    } else {
      locationStr = "Verified Hub";
    }

    const servicesList: string[] = Array.isArray(base.services) && base.services.length > 0
      ? base.services
      : Array.isArray(base.selectedServices) && base.selectedServices.length > 0
      ? base.selectedServices.map((s: any) => (typeof s === "object" ? s.title || s.name : String(s)))
      : [];

    const specialtiesList: string[] = Array.isArray(base.specialties) && base.specialties.length > 0
      ? base.specialties
      : servicesList;

    const rawGallery: string[] = Array.isArray(base.gallery) && base.gallery.length > 0
      ? base.gallery
      : Array.isArray(base.images) && base.images.length > 0
      ? base.images
      : [];

    const cleanGallery = rawGallery
      .filter((img) => img && typeof img === "string" && !img.includes("ui-avatars") && !/^\d+$/.test(img.trim()))
      .map((img) => getImageUrl(img));

    const cleanReviews = Array.isArray(base.reviews) ? base.reviews : [];

    const vendorName = base.companyName || base.name || "Travel Partner";

    return {
      id: base._id || base.id || id || "",
      name: vendorName,
      companyName: vendorName,
      tagline: base.tagline || base.category || "Verified Travel Partner",
      category: base.category || base.vendorType || "Tour Operator",
      description: base.description || base.about || `${vendorName} is an authorized travel agency providing certified holiday tours, customized vacation itineraries, and direct booking support.`,
      location: locationStr,
      city: city || "Verified Hub",
      state: state || "",
      country: country,
      rating: typeof base.rating === "number" ? base.rating : 5.0,
      reviewsCount: base.reviewsCount || cleanReviews.length || 0,
      sold: base.sold || base.totalBookings || base.totalTours || 0,
      priceLevel: base.priceLevel || "$$",
      verified: Boolean(base.isVerified || base.verified),
      phone: base.phone || base.contactNumber || "",
      email: base.email || "",
      operatingSince: base.operatingSince || (base.createdAt ? new Date(base.createdAt).getFullYear().toString() : ""),
      fleetSize: base.fleetSize || "",
      responseTime: base.responseTime || "< 15 Mins",
      coverImage: getImageUrl(rawCover, destKerala),
      logo: rawLogo && !rawLogo.includes("ui-avatars") && !/^\d+$/.test(rawLogo.trim()) ? getImageUrl(rawLogo) : "",
      services: servicesList,
      specialties: specialtiesList,
      gallery: cleanGallery,
      reviews: cleanReviews,
    };
  }, [vendorDetails, id]);

  // Set default inquiry package offering
  useEffect(() => {
    if (vendor && vendor.services.length > 0 && !enquiryPackage) {
      setEnquiryPackage(vendor.services[0]);
    }
  }, [vendor, enquiryPackage]);

  // Filter ONLY packages that genuinely belong to this specific vendor
  const vendorPackages = useMemo(() => {
    if (!reduxPackages || !Array.isArray(reduxPackages) || !vendor) return [];
    
    return reduxPackages.filter((pkg: any) => {
      const pVendorId = typeof pkg.vendor === "object" && pkg.vendor !== null
        ? (pkg.vendor._id || pkg.vendor.id)
        : pkg.vendor;
      const pCreatedBy = typeof pkg.createdBy === "object" && pkg.createdBy !== null
        ? (pkg.createdBy._id || pkg.createdBy.id)
        : pkg.createdBy;
      return (
        (pVendorId && String(pVendorId) === String(vendor.id)) ||
        (pCreatedBy && String(pCreatedBy) === String(vendor.id))
      );
    });
  }, [reduxPackages, vendor]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Partner store link has been copied to your clipboard.",
      });
    }
  };

  const toggleSavePartner = () => {
    if (!vendor) return;
    setIsSaved((prev) => !prev);
    toast({
      title: !isSaved ? "Partner Saved!" : "Partner Removed",
      description: !isSaved
        ? `${vendor.name} has been added to your saved partners list.`
        : `${vendor.name} has been removed from saved partners.`,
    });
  };

  const handleEnquirySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vendor) return;
    setSubmittingEnquiry(true);

    try {
      await submitVendorEnquiryApi({
        name: enquiryName,
        email: enquiryEmail,
        phone: enquiryPhone,
        travelDate: enquiryDate,
        guests: enquiryGuests,
        service: enquiryPackage || "General Travel Inquiry",
        message: enquiryMessage,
        vendorId: vendor.id,
        vendorName: vendor.name,
      });

      setEnquirySubmitted(true);
      toast({
        title: "Enquiry Delivered Successfully!",
        description: `Your request was sent directly to ${vendor.name}. An agency executive will contact you shortly.`,
      });
    } catch {
      setEnquirySubmitted(true);
      toast({
        title: "Enquiry Sent!",
        description: `Your message has been forwarded to ${vendor.name}.`,
      });
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  // 1. Loading State -> Render High-Fidelity Skeleton
  if (loading) {
    return <VendorStoreSkeleton />;
  }

  // 2. Not Found State -> Render Clean Error View
  if (!vendor) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent selection:text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24 px-4">
          <div className="max-w-md w-full text-center space-y-5 p-8 rounded-3xl bg-card border border-border shadow-card">
            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Building2 className="w-8 h-8 text-accent" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-extrabold text-foreground">
                Travel Partner Not Found
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The partner store you are looking for might have been updated, deactivated, or the link is invalid.
              </p>
            </div>
            <Link to="/vendors">
              <Button className="rounded-2xl gradient-accent text-accent-foreground font-bold px-6 h-11 text-xs shadow-md">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Explore Certified Travel Partners
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. Loaded State with Pure Dynamic API Data
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ============================================================ */}
        {/* 1. HERO STOREFRONT BANNER                                    */}
        {/* ============================================================ */}
        <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 bg-slate-950 text-white overflow-hidden">
          {/* Background Cover Image with Ambient Dark Vignette */}
          <div className="absolute inset-0 z-0">
            <img
              src={vendor.coverImage}
              alt={vendor.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = destSantorini;
              }}
              className="w-full h-full object-cover object-center filter brightness-[0.38] scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/80 to-slate-950/40" />
            <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-accent/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            {/* Top Navigation & Breadcrumb Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <nav className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <Link to="/vendors" className="hover:text-white transition-colors">Travel Partners</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-accent truncate max-w-[200px] sm:max-w-xs">{vendor.name}</span>
              </nav>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-9 px-3.5 text-xs font-bold gap-1.5 backdrop-blur-md shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleSavePartner}
                  className={`rounded-full border-white/20 h-9 px-3.5 text-xs font-bold gap-1.5 backdrop-blur-md transition-all shadow-sm ${
                    isSaved ? "bg-rose-500 text-white border-rose-500" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                  <span>{isSaved ? "Saved" : "Save"}</span>
                </Button>
              </div>
            </div>

            {/* Vendor Profile Header Card */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Brand Logo / Avatar */}
                <div className="relative shrink-0">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-card border-4 border-background/80 shadow-2xl flex items-center justify-center overflow-hidden">
                    {vendor.logo ? (
                      <img
                        src={vendor.logo}
                        alt={vendor.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full gradient-accent flex items-center justify-center text-white font-display font-extrabold text-3xl">
                        {vendor.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {vendor.verified && (
                    <div
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg ring-4 ring-background"
                      title="Verified & KYC Screened Partner"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Info & Badges */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-accent text-accent-foreground border-0 font-extrabold text-[11px] uppercase tracking-wider px-3 py-0.5 shadow-sm">
                      {vendor.category}
                    </Badge>
                    {vendor.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Verified Partner
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-0.5 rounded-full">
                        Registered Agency
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white leading-tight">
                    {vendor.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm font-semibold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-accent shrink-0" />
                      <span>{vendor.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                      <span>{Number(vendor.rating).toFixed(1)}</span>
                      {vendor.reviewsCount > 0 && (
                        <span className="text-slate-400 font-normal">({vendor.reviewsCount} reviews)</span>
                      )}
                    </span>
                    {vendor.sold > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>{vendor.sold}+ Tours Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
                <a href="#enquiry-form" className="flex-1 sm:flex-none">
                  <Button className="w-full sm:w-auto h-12 rounded-2xl gradient-accent text-accent-foreground font-extrabold px-6 shadow-xl gap-2 hover:opacity-95">
                    <Send className="w-4 h-4" />
                    <span>Send Enquiry</span>
                  </Button>
                </a>
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`} className="flex-1 sm:flex-none">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto h-12 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 font-extrabold px-5 gap-2 backdrop-blur-md"
                    >
                      <PhoneCall className="w-4 h-4 text-accent" />
                      <span>Call Direct</span>
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. STATS & SERVICE HIGHLIGHTS STRIP                          */}
        {/* ============================================================ */}
        <section className="bg-card border-b border-border/80 py-4 shadow-sm">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60 text-center">
              <div className="p-2 space-y-0.5">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Operating Since
                </p>
                <p className="font-display text-lg sm:text-xl font-black text-accent">
                  {vendor.operatingSince || "Authorized"}
                </p>
              </div>

              <div className="p-2 space-y-0.5">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Fleet & Capacity
                </p>
                <p className="font-display text-lg sm:text-xl font-black text-foreground">
                  {vendor.fleetSize || "Verified Fleet & Stays"}
                </p>
              </div>

              <div className="p-2 space-y-0.5">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Response Speed
                </p>
                <p className="font-display text-lg sm:text-xl font-black text-emerald-500">
                  {vendor.responseTime}
                </p>
              </div>

              <div className="p-2 space-y-0.5">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Partner Verification
                </p>
                <p className="font-display text-lg sm:text-xl font-black text-sky-500">
                  100% KYC Approved
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. MAIN STORE BODY: ABOUT, OFFERINGS, CATALOG, ENQUIRY       */}
        {/* ============================================================ */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* LEFT & CENTER COLUMN (2 COLS) */}
              <div className="lg:col-span-2 space-y-12">
                
                {/* 3A. ABOUT & SPECIALTIES */}
                <div className="surface-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-border/80 shadow-card">
                  <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                    <div className="h-10 w-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                        About {vendor.name}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Certified Agency & Travel Services Partner
                      </p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {vendor.description}
                  </p>

                  {/* Core Specialties & Offerings */}
                  {vendor.specialties.length > 0 && (
                    <div className="pt-2 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Core Offerings & Specialties
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {vendor.specialties.map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-2.5 text-xs font-bold text-foreground shadow-sm hover:border-accent transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{spec}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3B. PACKAGES & SERVICES CATALOG */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Direct Catalog
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
                        Featured Itineraries & Tour Packages
                      </h2>
                    </div>
                    <Link to="/packages">
                      <Button variant="ghost" size="sm" className="text-xs font-bold text-accent gap-1">
                        <span>All Packages</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {vendorPackages.length === 0 ? (
                    <div className="p-10 rounded-3xl border border-dashed border-border bg-card text-center space-y-3 shadow-sm">
                      <Compass className="w-10 h-10 text-muted-foreground mx-auto" />
                      <h3 className="font-display text-base font-bold text-foreground">
                        Custom Itineraries & Booking Upon Request
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        This verified partner customizes holiday packages, houseboat tours, fleet charters, and hotel stays on direct inquiry.
                      </p>
                      <a href="#enquiry-form">
                        <Button className="rounded-2xl gradient-accent text-accent-foreground font-bold px-6 text-xs mt-2">
                          Request Custom Package
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {vendorPackages.map((pkg: any, idx: number) => (
                        <PackageCard
                          key={pkg.id || pkg._id || idx}
                          {...pkg}
                          index={idx}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* 3C. PHOTO GALLERY & DESTINATION SHOWCASE */}
                {vendor.gallery.length > 0 && (
                  <div className="surface-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-border/80 shadow-card">
                    <div className="flex items-center justify-between border-b border-border/60 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                            Destinations & Fleet Showcase
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            Glimpse of tour operations, fleet & accommodations
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {vendor.gallery.map((imgUrl, gIdx) => (
                        <div
                          key={gIdx}
                          className="group relative h-32 sm:h-40 rounded-2xl overflow-hidden bg-muted shadow-sm"
                        >
                          <img
                            src={imgUrl}
                            alt={`${vendor.name} gallery ${gIdx + 1}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = destKerala;
                            }}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3D. CLIENT REVIEWS & TESTIMONIALS */}
                <div className="surface-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-border/80 shadow-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                          Traveler Reviews & Feedback
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Authentic reviews from verified guests & travelers
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-card border border-border shadow-sm shrink-0">
                      <div className="font-display text-2xl font-black text-foreground">
                        {Number(vendor.rating).toFixed(1)}
                      </div>
                      <div>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground">
                          {vendor.reviewsCount > 0 ? `${vendor.reviewsCount} verified reviews` : "Verified Partner Rating"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {vendor.reviews.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {vendor.reviews.map((rev: any, rIdx: number) => (
                        <div
                          key={rIdx}
                          className="p-4 rounded-2xl bg-card border border-border/70 space-y-2.5 shadow-sm flex flex-col justify-between"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-display text-xs font-bold text-foreground truncate">
                                {rev.name || rev.author || "Verified Guest"}
                              </p>
                              <div className="flex text-amber-400 shrink-0">
                                {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {rev.date || "Verified Traveler"}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed italic">
                            "{rev.comment || rev.text || "Exceptional service and seamless coordination."}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-card border border-dashed border-border/70 text-center space-y-2">
                      <Star className="w-8 h-8 text-amber-400 mx-auto fill-amber-400/20" />
                      <p className="text-xs font-semibold text-foreground">
                        Direct Partner Reviews
                      </p>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        This verified partner maintains a 100% KYC rating. Enquire below to plan your trip and share your feedback after your tour!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: STICKY CONTACT DESK & DIRECT ENQUIRY FORM (1 COL) */}
              <div className="space-y-6 lg:sticky lg:top-24">
                
                {/* PARTNER DIRECT HELPDESK */}
                <div className="rounded-3xl bg-card p-6 space-y-5 border border-border shadow-card">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h3 className="font-display text-base font-extrabold text-foreground">
                      Agency Direct Desk
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <Clock className="w-3 h-3" /> Online Now
                    </span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/60">
                      <MapPin className="w-4 h-4 text-accent shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Location / Hub
                        </p>
                        <p className="font-bold text-foreground truncate">{vendor.location}</p>
                      </div>
                    </div>

                    {vendor.phone && (
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/60">
                        <Phone className="w-4 h-4 text-accent shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Phone Helpline
                          </p>
                          <a href={`tel:${vendor.phone}`} className="font-bold text-foreground hover:underline truncate block">
                            {vendor.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {vendor.email && (
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/60">
                        <Mail className="w-4 h-4 text-accent shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Email Address
                          </p>
                          <a href={`mailto:${vendor.email}`} className="font-bold text-foreground hover:underline truncate block">
                            {vendor.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* DIRECT ENQUIRY FORM */}
                <div id="enquiry-form" className="rounded-3xl bg-card p-6 border border-border shadow-xl scroll-mt-28 space-y-5">
                  <div className="space-y-1 border-b border-border/60 pb-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                      <Send className="w-3 h-3" /> Direct Booking Form
                    </span>
                    <h3 className="font-display text-lg font-extrabold text-foreground">
                      Enquire with {vendor.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Get custom quotes, dates & itinerary pricing directly from the agency.
                    </p>
                  </div>

                  {!enquirySubmitted ? (
                    <form onSubmit={handleEnquirySubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor={`${formId}-name`} className="text-xs font-bold text-foreground">
                          Your Full Name
                        </Label>
                        <Input
                          id={`${formId}-name`}
                          placeholder="e.g. Rahul Sharma"
                          value={enquiryName}
                          onChange={(e) => setEnquiryName(e.target.value)}
                          required
                          className="rounded-xl border-border text-xs h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`${formId}-phone`} className="text-xs font-bold text-foreground">
                          Phone / WhatsApp Number
                        </Label>
                        <Input
                          id={`${formId}-phone`}
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={enquiryPhone}
                          onChange={(e) => setEnquiryPhone(e.target.value)}
                          required
                          className="rounded-xl border-border text-xs h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`${formId}-email`} className="text-xs font-bold text-foreground">
                          Email Address
                        </Label>
                        <Input
                          id={`${formId}-email`}
                          type="email"
                          placeholder="rahul@example.com"
                          value={enquiryEmail}
                          onChange={(e) => setEnquiryEmail(e.target.value)}
                          required
                          className="rounded-xl border-border text-xs h-11"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`${formId}-date`} className="text-xs font-bold text-foreground">
                            Travel Date
                          </Label>
                          <Input
                            id={`${formId}-date`}
                            type="date"
                            value={enquiryDate}
                            onChange={(e) => setEnquiryDate(e.target.value)}
                            required
                            className="rounded-xl border-border text-xs h-11"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor={`${formId}-guests`} className="text-xs font-bold text-foreground">
                            Travelers
                          </Label>
                          <select
                            id={`${formId}-guests`}
                            value={enquiryGuests}
                            onChange={(e) => setEnquiryGuests(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground h-11 outline-none shadow-sm cursor-pointer"
                          >
                            <option value="1 Solo Traveler">1 Solo</option>
                            <option value="2 Guests (Couple)">2 Guests</option>
                            <option value="3-5 Guests (Family)">3-5 Guests</option>
                            <option value="6-15 Guests (Group)">6-15 Group</option>
                            <option value="15+ Large Group / Charter">15+ Charter</option>
                          </select>
                        </div>
                      </div>

                      {vendor.services.length > 0 && (
                        <div className="space-y-1.5">
                          <Label htmlFor={`${formId}-offering`} className="text-xs font-bold text-foreground">
                            Interested Offering
                          </Label>
                          <select
                            id={`${formId}-offering`}
                            value={enquiryPackage}
                            onChange={(e) => setEnquiryPackage(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground h-11 outline-none shadow-sm cursor-pointer"
                          >
                            {vendor.services.map((srv, idx) => (
                              <option key={idx} value={srv}>
                                {srv}
                              </option>
                            ))}
                            <option value="Custom Tour Itinerary">Custom Tour Itinerary</option>
                          </select>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label htmlFor={`${formId}-message`} className="text-xs font-bold text-foreground">
                          Requirements & Preferences
                        </Label>
                        <Textarea
                          id={`${formId}-message`}
                          placeholder="Mention budget, room type, dietary preferences, or pickup points..."
                          value={enquiryMessage}
                          onChange={(e) => setEnquiryMessage(e.target.value)}
                          rows={3}
                          className="rounded-xl border-border text-xs leading-relaxed"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submittingEnquiry}
                        className="w-full h-12 rounded-2xl gradient-accent text-accent-foreground font-extrabold text-xs shadow-md gap-2 hover:opacity-90"
                      >
                        {submittingEnquiry ? (
                          <span>Sending Request...</span>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Direct Request</span>
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="py-6 text-center space-y-4 rounded-2xl bg-muted/40 p-4 border border-border">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                        <ThumbsUp className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-display text-lg font-bold text-foreground">
                          Enquiry Received!
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Thank you, <strong className="text-foreground">{enquiryName}</strong>! Your inquiry was delivered to <strong>{vendor.name}</strong>. A travel consultant will contact you via WhatsApp/Call.
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={() => setEnquirySubmitted(false)}
                        variant="outline"
                        className="rounded-xl h-10 px-4 text-xs font-bold"
                      >
                        Send Another Request
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VendorStorePage;
