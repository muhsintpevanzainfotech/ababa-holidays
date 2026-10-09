import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  X,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchVendorsStart } from "@/store/slices/vendorSlice";
import { getImageUrl } from "@/lib/imageHelper";

export interface Vendor {
  id: string;
  name: string;
  category?: string;
  tagline?: string;
  coverImage?: string;
  image?: string;
  avatarIcon?: any;
  avatarBg?: string;
  rating?: number;
  sold?: number;
  priceLevel?: string;
  location?: string;
  description?: string;
  verified?: boolean;
  phone?: string;
  email?: string;
  specialties?: string[];
}

const TopVendorsSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [wishlistState, setWishlistState] = useState<Record<string, boolean>>({});
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const { toast } = useToast();

  const dispatch = useAppDispatch();
  const { vendors: reduxVendors, loading } = useAppSelector((state) => state.vendor);

  useEffect(() => {
    if (!reduxVendors || reduxVendors.length === 0) {
      dispatch(fetchVendorsStart());
    }
  }, [dispatch, reduxVendors]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const toggleWishlist = (vendor: Vendor, e: React.MouseEvent) => {
    e.stopPropagation();
    const vendorId = vendor.id || (vendor as any)._id;
    const currentState = !!wishlistState[vendorId];
    const newState = !currentState;
    setWishlistState((prev) => ({ ...prev, [vendorId]: newState }));

    toast({
      title: newState ? "Vendor Saved to Wishlist" : "Removed from Wishlist",
      description: newState
        ? `${vendor.name} has been added to your saved partners.`
        : `${vendor.name} was removed from saved partners.`,
    });
  };

  const activeVendors: Vendor[] = reduxVendors || [];

  return (
    <section className="py-8 lg:py-12 bg-background border-none select-none" data-reveal>
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header Row with Slider Navigation Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Partners
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">
              Top Vendors & Travel Partners
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Connect directly with top-rated resort chains, houseboat operators, and verified local travel partners.
            </p>
          </div>

          {/* Slider Prev / Next Circular Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Previous Vendors"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all hover:bg-muted hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Next Vendors"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all hover:bg-muted hover:scale-105 active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Skeleton Loader or Vendor Grid */}
        {loading ? (
          <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="w-[280px] sm:w-[320px] h-[390px] shrink-0 rounded-3xl bg-muted/60 animate-pulse border border-border/40"
              />
            ))}
          </div>
        ) : activeVendors.length === 0 ? (
          <div className="w-full py-12 px-6 rounded-3xl border border-dashed border-border text-center surface-panel space-y-2">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-display text-base font-bold text-foreground">No Verified Vendors Listed Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Check back soon as new verified travel agencies and resorts register on our platform.
            </p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollBehavior: "smooth" }}
          >
            {activeVendors.map((vendor, index) => {
              const vendorId = vendor.id || (vendor as any)._id || `v-${index}`;
              const vendorName = vendor.name || (vendor as any).companyName || "Travel Partner";
              const coverImg = getImageUrl(vendor.coverImage || vendor.image, "/favicon.png");

              const categoryText = vendor.category || "Travel Service";
              const locationText = vendor.location || "South India";
              const ratingVal = vendor.rating ? Number(vendor.rating).toFixed(1) : "4.9";
              const toursSold = vendor.sold || (vendor as any).totalTours || 120;
              const priceLevel = vendor.priceLevel || "$$";
              const isWishlisted = !!wishlistState[vendorId];

              const AvatarIcon = vendor.avatarIcon || Building2;
              const avatarBgClass = vendor.avatarBg || "bg-amber-600 text-white";

              return (
                <motion.div
                  key={vendorId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="w-[280px] sm:w-[320px] shrink-0 snap-start rounded-3xl bg-card border border-border/70 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Banner & Floating Avatar */}
                  <div className="relative p-3 pb-0">
                    <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-muted">
                      <img
                        src={coverImg}
                        alt={vendorName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/favicon.png";
                        }}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {(vendor.verified ?? true) && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/15">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          Verified Partner
                        </span>
                      )}
                    </div>

                    {/* Overlapping Avatar Logo Badge */}
                    <div className="absolute left-6 -bottom-5 flex items-center justify-center">
                      <div
                        className={`h-12 w-12 rounded-2xl border-2 border-card shadow-lg flex items-center justify-center ${avatarBgClass}`}
                      >
                        <AvatarIcon className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Card Body Content */}
                  <div className="p-5 pt-8 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-display text-lg font-extrabold text-foreground leading-snug line-clamp-1 group-hover:text-sky-500 transition-colors">
                          {vendorName}
                        </h3>
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(vendor, e)}
                          aria-label="Save to Wishlist"
                          className={`p-2 rounded-full border border-border/70 transition-colors ${
                            isWishlisted
                              ? "bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/40 dark:border-rose-900"
                              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      <p className="text-xs font-medium text-muted-foreground line-clamp-1 mb-3">
                        {categoryText} • {locationText}
                      </p>
                    </div>

                    {/* Metrics Pill Grid (RATING | TOURS | PRICE) */}
                    <div className="grid grid-cols-3 rounded-2xl bg-muted/60 p-3 text-center divide-x divide-border/60 border border-border/40">
                      <div className="flex flex-col items-center justify-center px-1">
                        <div className="flex items-center gap-1 font-display text-sm font-bold text-foreground">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{ratingVal}</span>
                        </div>
                        <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mt-0.5">
                          RATING
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center px-1">
                        <span className="font-display text-sm font-bold text-foreground">
                          {toursSold}
                        </span>
                        <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mt-0.5">
                          TOURS
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center px-1">
                        <span className="font-display text-sm font-bold text-sky-500">
                          {priceLevel}
                        </span>
                        <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mt-0.5">
                          PRICE
                        </span>
                      </div>
                    </div>

                    {/* Primary Action Button: "Go to Explore" */}
                    <Link to={`/vendor/${vendorId}`} className="block w-full">
                      <Button
                        type="button"
                        className="w-full h-11 rounded-2xl gradient-accent text-white font-bold text-xs sm:text-sm shadow-md transition-all gap-1.5 hover:scale-[1.02] active:scale-95 border-0"
                      >
                        <span>Explore Partner</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vendor Details Popup Modal */}
      <AnimatePresence mode="wait">
        {selectedVendor && (
          <div key="vendor-popup-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVendor(null)}
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
                  src={getImageUrl(selectedVendor.coverImage || selectedVendor.image, "/favicon.png")}
                  alt={selectedVendor.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/favicon.png";
                  }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <button
                  type="button"
                  onClick={() => setSelectedVendor(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="absolute bottom-4 left-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-accent text-accent-foreground border-0 text-[10px] uppercase font-bold">
                      {selectedVendor.category || "Vendor"}
                    </Badge>
                    {(selectedVendor.verified ?? true) && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified Partner
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl font-bold">{selectedVendor.name}</h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    About Partner
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedVendor.description || "Top rated verified partner serving quality holiday & travel experiences."}
                  </p>
                </div>

                {/* Specialties */}
                {selectedVendor.specialties && selectedVendor.specialties.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Key Offerings & Specialties
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVendor.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground border border-border/60"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Contact Info */}
                <div className="rounded-2xl bg-muted/60 p-4 space-y-2.5 text-sm">
                  {selectedVendor.location && (
                    <div className="flex items-center gap-3 text-foreground">
                      <MapPin className="h-4 w-4 text-accent shrink-0" />
                      <span>{selectedVendor.location}</span>
                    </div>
                  )}
                  {selectedVendor.phone && (
                    <div className="flex items-center gap-3 text-foreground">
                      <Phone className="h-4 w-4 text-accent shrink-0" />
                      <a href={`tel:${selectedVendor.phone}`} className="hover:underline">
                        {selectedVendor.phone}
                      </a>
                    </div>
                  )}
                  {selectedVendor.email && (
                    <div className="flex items-center gap-3 text-foreground">
                      <Mail className="h-4 w-4 text-accent shrink-0" />
                      <a href={`mailto:${selectedVendor.email}`} className="hover:underline">
                        {selectedVendor.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    to={`/vendor/${selectedVendor.id || (selectedVendor as any)._id}`}
                    onClick={() => setSelectedVendor(null)}
                    className="flex-1"
                  >
                    <Button
                      type="button"
                      className="w-full h-12 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2 shadow-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Explore Partner Store
                    </Button>
                  </Link>

                  {selectedVendor.phone && (
                    <a href={`tel:${selectedVendor.phone}`} className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-2xl gap-2 font-semibold"
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
    </section>
  );
};

export default TopVendorsSection;
