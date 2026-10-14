import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  Clock,
  Tag,
  ArrowRight,
  Gift,
  Percent,
  Compass,
  Package,
  Globe,
  Flame,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store";
import { getCouponsApi, getBannersApi } from "@/api/endpoints";
import { getImageUrl } from "@/lib/imageHelper";

const STORAGE_KEY = "ababa_offer_modal_seen";

export interface OfferItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  discount: string;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  expiry: string;
  scope?: "all_packages" | "single_package";
  badge?: string;
  minBooking?: string;
  packageId?: string;
  image?: string;
  link?: string;
}

const defaultOffers: OfferItem[] = [
  {
    id: "kerala-special",
    title: "Kerala Backwaters & Munnar Hills 🌿",
    subtitle: "Flat 30% off on all Kerala houseboat & nature tour packages",
    code: "KERALA30",
    discount: "30% OFF",
    expiry: "May 30, 2026",
    badge: "🌿 Seasonal Special",
    minBooking: "Min Spend ₹10,000",
    scope: "all_packages",
  },
  {
    id: "family-honeymoon",
    title: "Couple & Family Luxury Staycation 💕",
    subtitle: "Save flat 20% on all couple & family group holiday packages",
    code: "FAMILY20",
    discount: "20% OFF",
    expiry: "Jun 15, 2026",
    badge: "💕 Popular Deal",
    minBooking: "Min Spend ₹15,000",
    scope: "all_packages",
  },
];

const OfferModal = () => {
  const [open, setOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [apiOffers, setApiOffers] = useState<OfferItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Read from Redux store as instant cache
  const { coupons: reduxCoupons, offerBanners: reduxBanners } = useAppSelector(
    (state) => state.home
  );

  // Helper to map backend coupon schema into OfferItem
  const mapCouponToOffer = (coupon: any, index: number): OfferItem => {
    const isPercent = coupon.discountType === "percentage";
    const discountText = isPercent
      ? `${coupon.discountValue}% OFF`
      : `₹${Number(coupon.discountValue || 0).toLocaleString()} OFF`;

    const isSingle = coupon.scope === "single_package" && coupon.package;
    const pkgObj = typeof coupon.package === "object" ? coupon.package : null;
    const pkgTitle = pkgObj?.title || null;

    const title = isSingle && pkgTitle ? pkgTitle : `${coupon.code} Special Promo`;
    const subtitle =
      isSingle && pkgTitle
        ? `Exclusive savings applied to ${pkgTitle}`
        : coupon.minBookingAmount && Number(coupon.minBookingAmount) > 0
        ? `Valid on bookings above ₹${Number(coupon.minBookingAmount).toLocaleString()}`
        : "Valid on all tour & holiday packages across the website";

    const expiry = coupon.expiryDate
      ? new Date(coupon.expiryDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Limited Time";

    const rawImg = pkgObj?.images?.[0] || pkgObj?.image || null;
    const image = rawImg ? getImageUrl(rawImg) : undefined;
    const packageId = pkgObj?._id || (typeof coupon.package === "string" ? coupon.package : undefined);

    return {
      id: coupon._id || `coupon-${index}`,
      code: coupon.code || `OFFER${index + 1}`,
      title,
      subtitle,
      discount: discountText,
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue,
      expiry,
      scope: coupon.scope || "all_packages",
      badge: isSingle ? "📦 Package Deal" : "🌐 All Packages",
      minBooking:
        coupon.minBookingAmount && Number(coupon.minBookingAmount) > 0
          ? `Min Spend ₹${Number(coupon.minBookingAmount).toLocaleString()}`
          : "No Min Spend",
      packageId,
      image,
    };
  };

  // Helper to map backend banner schema into OfferItem if coupons are empty
  const mapBannerToOffer = (banner: any, index: number): OfferItem => {
    const fallbackCode = banner.link && banner.link.includes("cat=")
      ? `${banner.link.split("cat=")[1].toUpperCase()}DEAL`
      : `DEAL${index + 1}`;

    return {
      id: banner._id || `banner-${index}`,
      code: fallbackCode,
      title: banner.title || "Exclusive Travel Promotion",
      subtitle:
        banner.description ||
        "Discover incredible seasonal savings on curated itineraries and packages.",
      discount: "SPECIAL OFFER",
      expiry: "Limited Period",
      badge: banner.userRole === "Admin" ? "✨ Official Offer" : "🔥 Featured Deal",
      minBooking: "All Packages",
      image: banner.image ? getImageUrl(banner.image) : undefined,
      link: banner.link || "/packages",
    };
  };

  // Fetch active coupons & promotional banners from API
  useEffect(() => {
    let isSubscribed = true;

    const fetchOffers = async () => {
      setIsLoading(true);
      try {
        // First try getting public active coupons
        const rawCoupons = await getCouponsApi();
        if (isSubscribed && Array.isArray(rawCoupons) && rawCoupons.length > 0) {
          const now = new Date();
          const activeValidCoupons = rawCoupons.filter((c: any) => {
            if (c.isActive === false) return false;
            if (c.expiryDate && new Date(c.expiryDate) < now) return false;
            return true;
          });

          if (activeValidCoupons.length > 0) {
            setApiOffers(activeValidCoupons.map(mapCouponToOffer));
            setIsLoading(false);
            return;
          }
        }

        // Fallback: If no coupons in DB, try fetching active promotional banners
        const rawBanners = await getBannersApi();
        if (isSubscribed && Array.isArray(rawBanners) && rawBanners.length > 0) {
          const activeBanners = rawBanners.filter((b: any) => b.isActive !== false);
          if (activeBanners.length > 0) {
            setApiOffers(activeBanners.map(mapBannerToOffer));
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load offers for modal:", err);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    fetchOffers();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Compute final offers list with Redux & Fallback integration
  const offersToDisplay = useMemo(() => {
    if (apiOffers.length > 0) {
      return apiOffers.slice(0, 4);
    }

    if (Array.isArray(reduxCoupons) && reduxCoupons.length > 0) {
      const now = new Date();
      const valid = reduxCoupons.filter((c: any) => c.isActive !== false && (!c.expiryDate || new Date(c.expiryDate) >= now));
      if (valid.length > 0) {
        return valid.map(mapCouponToOffer).slice(0, 4);
      }
    }

    if (Array.isArray(reduxBanners) && reduxBanners.length > 0) {
      const validBanners = reduxBanners.filter((b: any) => b.isActive !== false);
      if (validBanners.length > 0) {
        return validBanners.map(mapBannerToOffer).slice(0, 4);
      }
    }

    return defaultOffers;
  }, [apiOffers, reduxCoupons, reduxBanners]);

  // Show once per session automatically
  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Global listener to trigger offer modal anytime
  useEffect(() => {
    const handleOpenModal = () => setOpen(true);
    window.addEventListener("open-offer-modal", handleOpenModal);
    return () => window.removeEventListener("open-offer-modal", handleOpenModal);
  }, []);

  const dismiss = (value: boolean) => {
    setOpen(value);
    if (!value) {
      sessionStorage.setItem(STORAGE_KEY, "1");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Coupon Code Copied! 🎟️",
      description: `Code "${code}" is copied to clipboard. Apply it during package booking to enjoy instant discount!`,
    });
    setTimeout(() => setCopiedCode(null), 2400);
  };

  const handleApplyOffer = (offer: OfferItem) => {
    copyCode(offer.code);
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);

    if (offer.packageId) {
      navigate(`/packages/${offer.packageId}?promo=${offer.code}`);
    } else if (offer.link) {
      if (offer.link.startsWith("http")) {
        window.open(offer.link, "_blank");
      } else {
        navigate(offer.link);
      }
    } else {
      navigate(`/packages?promo=${offer.code}`);
    }
  };

  const goToPackages = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
    navigate("/packages");
  };

  return (
    <Dialog open={open} onOpenChange={dismiss}>
      <DialogContent className="max-h-[92svh] max-w-2xl overflow-hidden rounded-3xl sm:rounded-[2rem] border border-white/15 bg-card p-0 shadow-2xl backdrop-blur-2xl text-foreground">
        {/* Luxury Glowing Header Strip */}
        <div className="relative border-b border-white/10 bg-gradient-to-r from-slate-950 via-navy-dark to-slate-900 p-6 sm:p-7 text-white overflow-hidden">
          {/* Ambient Lighting Gradients */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/25 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

          {/* Background Micro Dots */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative z-10 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-[11px] font-extrabold uppercase tracking-wider mb-2.5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Exclusive Seasonal Deals
            </span>
            <DialogTitle className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Travel Smarter, Save Bigger
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Claim live verified promo codes created for your upcoming tour packages & luxury staycations
            </DialogDescription>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 max-h-[calc(92svh-190px)] overflow-y-auto space-y-4 custom-scrollbar">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-xs font-medium">Loading latest verified offers...</p>
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2">
              <AnimatePresence>
                {offersToDisplay.map((offer: OfferItem, i: number) => {
                  const isSinglePackage = offer.scope === "single_package";

                  return (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.08, duration: 0.35 }}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/40 p-4 transition-all hover:border-accent/40 hover:shadow-lg"
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-accent border border-accent/25">
                            <Tag className="h-3 w-3" /> {offer.discount}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium bg-background/60 px-2 py-0.5 rounded-md border border-border/60">
                            <Clock className="h-3 w-3 text-accent" /> {offer.expiry}
                          </span>
                        </div>

                        {/* Title & Scope */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                            {isSinglePackage ? (
                              <span className="inline-flex items-center gap-1 text-primary">
                                <Package className="h-3 w-3" /> Specific Package Deal
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-sky-500">
                                <Globe className="h-3 w-3" /> All Packages
                              </span>
                            )}
                          </div>

                          <h3 className="font-display text-sm sm:text-base font-bold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
                            {offer.title}
                          </h3>

                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {offer.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Code Snippet & Apply Action */}
                      <div className="mt-4 pt-3 border-t border-border/60 space-y-2.5">
                        {/* Code Box */}
                        <div className="flex items-center justify-between rounded-xl border border-dashed border-accent/50 bg-background/80 px-3 py-2">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground block leading-none mb-0.5">
                              Promo Code
                            </span>
                            <span className="font-mono text-xs sm:text-sm font-extrabold tracking-wider text-accent uppercase">
                              {offer.code}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyCode(offer.code)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground text-[11px] font-bold transition-all"
                            title="Copy Promo Code"
                          >
                            {copiedCode === offer.code ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Action CTA Link */}
                        <button
                          type="button"
                          onClick={() => handleApplyOffer(offer)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-semibold transition-all group/btn"
                        >
                          <span>{isSinglePackage ? "View & Book This Package" : "Apply & Browse Packages"}</span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Dialog Action Footer */}
          <div className="mt-4 pt-4 border-t border-border/60 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={goToPackages}
              className="flex-1 rounded-full gradient-accent px-6 py-3 text-xs font-bold text-accent-foreground shadow-md transition-all hover:opacity-90 flex items-center justify-center gap-2"
            >
              <span>Explore All Tour Packages</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => dismiss(false)}
              className="rounded-full border border-border/80 px-6 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            Copied promo codes can be applied directly at package inquiry or booking checkout to redeem discount savings.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferModal;
