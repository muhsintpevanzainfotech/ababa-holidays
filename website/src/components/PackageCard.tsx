import { useId, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Clock, MapPin, Heart, Check, CalendarDays, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWishlist } from "@/contexts/WishlistContext";
import { getPackagePricing } from "@/lib/pricing";
import { getImageUrl } from "@/lib/imageHelper";

interface PackageCardProps {
  id?: string;
  _id?: string;
  image?: string;
  images?: string[];
  title?: string;
  packageName?: string;
  name?: string;
  location?: string;
  destination?: string;
  price?: number;
  originalPrice?: number;
  discountPrice?: number;
  duration?: string;
  rating?: number;
  averageRating?: number;
  reviews?: number;
  reviewCount?: number;
  category?: any;
  featured?: boolean;
  isFeatured?: boolean;
  index?: number;
  description?: string;
  packageDescription?: string;
  itinerary?: any[];
  included?: string[];
  inclusions?: string[];
}

import { useAppDispatch } from "@/store";
import { toggleWishlistItem } from "@/store/slices/wishlistSlice";
import { submitPackageInquiryStart } from "@/store/slices/packagesSlice";

const PackageCard = (props: PackageCardProps) => {
  const {
    id,
    _id,
    image,
    images,
    title,
    packageName,
    name,
    location,
    destination,
    price = 0,
    originalPrice,
    discountPrice,
    duration,
    rating,
    averageRating,
    reviews,
    reviewCount,
    category,
    featured,
    isFeatured,
    index = 0,
    description,
    packageDescription,
    itinerary,
    included,
    inclusions,
  } = props;

  const pkgId = id || _id || "";
  const pkgTitle = title || packageName || name || "Exclusive Tour Package";
  const rawImage = image || (Array.isArray(images) && images.length > 0 ? images[0] : "") || "/favicon.png";
  const pkgImage = getImageUrl(rawImage);
  const pkgLocation = location || destination || "Popular Destination";
  const pkgPrice = price || discountPrice || originalPrice || 0;
  const pkgOriginalPrice = originalPrice || price || 0;
  const pkgDuration = duration || "3 Days / 2 Nights";
  const pkgRating = Number(rating || averageRating || 5);
  const pkgReviews = reviews ?? reviewCount ?? 12;
  const pkgCategory = typeof category === "string" ? category : category?.name || category?.title || "Tour";
  const isPkgFeatured = Boolean(featured || isFeatured);
  const pkgDesc = description || packageDescription || "";
  const pkgInclusions = included || inclusions || [];

  const dispatch = useAppDispatch();
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(pkgId);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [requestReady, setRequestReady] = useState(false);
  const [travelers, setTravelers] = useState(2);
  const formId = useId();
  const pricing = getPackagePricing({
    id: pkgId,
    image: pkgImage,
    title: pkgTitle,
    location: pkgLocation,
    price: pkgPrice,
    originalPrice: pkgOriginalPrice,
    duration: pkgDuration,
    rating: pkgRating,
    reviews: pkgReviews,
    category: pkgCategory,
    featured: isPkgFeatured,
    description: pkgDesc,
    itinerary: itinerary || [],
    included: pkgInclusions,
    gallery: images || [],
  });
  const today = new Date();
  const earliestDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleItem({
      id: pkgId,
      image: pkgImage,
      title: pkgTitle,
      location: pkgLocation,
      price: pkgPrice,
      originalPrice: pkgOriginalPrice,
      duration: pkgDuration,
      rating: pkgRating,
      category: pkgCategory,
      featured: isPkgFeatured,
    });
    dispatch(toggleWishlistItem(pkgId));
  };

  const handleBookingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(submitPackageInquiryStart({ packageId: pkgId, packageTitle: pkgTitle, travelers }));
    setRequestReady(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="h-full flex flex-col"
      data-reveal
    >
      <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Link to={`/packages/${pkgId}`} aria-label={`View ${pkgTitle} details`} className="absolute inset-0 z-0">
              <img
                src={pkgImage}
                alt={pkgTitle}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/favicon.png";
                }}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
              />
            </Link>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute left-3 right-3 top-3 z-10 flex items-start justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {isPkgFeatured && (
                  <div className="rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-accent-foreground shadow-md backdrop-blur-md">
                    Featured
                  </div>
                )}
                {pricing.discountPercent && (
                  <div className="rounded-full bg-rose-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md backdrop-blur-md">
                    {pricing.discountPercent}% OFF
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={handleWishlistToggle}
                className={`h-9 w-9 rounded-full backdrop-blur-md border border-white/20 transition-all ${inWishlist ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-black/40 text-white hover:bg-black/70"}`}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
              </Button>
            </div>

            <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 rounded-2xl border border-white/15 bg-black/60 p-3 backdrop-blur-md">
              <div className="min-w-0">
                <div className="mb-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                  <span className="truncate">{pkgLocation}</span>
                </div>
                <Link to={`/packages/${pkgId}`} className="font-display text-base font-bold text-white transition-colors group-hover:text-sky-300 line-clamp-1">
                  {pkgTitle}
                </Link>
              </div>
              <div className="shrink-0 flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{pkgRating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                <Clock className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                <span>{pkgDuration}</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>{pkgReviews ? `${pkgReviews} reviews` : "Verified Stay"}</span>
              </span>
            </div>

            {pkgDesc && (
              <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{pkgDesc}</p>
            )}

            {itinerary && Array.isArray(itinerary) && itinerary.length > 0 && (
              <div className="mb-4 space-y-1.5 rounded-2xl bg-muted/50 p-3 border border-border/50">
                {itinerary.slice(0, 2).map((item: any, i: number) => {
                  const text = typeof item === "string" ? item.replace(/^Day \d+:\s*/, "") : item?.title || item?.description || `Day ${i + 1}`;
                  return (
                    <p key={i} className="flex items-start gap-2 text-xs font-medium leading-relaxed text-foreground/90">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span className="line-clamp-1">{text}</span>
                    </p>
                  );
                })}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-4">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">From</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-extrabold text-foreground">₹{pricing.price.toLocaleString()}</span>
                  {pricing.listPrice > pricing.price && <span className="text-xs text-muted-foreground line-through">₹{pricing.listPrice.toLocaleString()}</span>}
                </div>
              </div>

              <Button size="sm" className="rounded-full border-0 gradient-accent px-5 py-2.5 font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all" onClick={() => { setRequestReady(false); setBookingOpen(true); }}>
                Book Now <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
      </div>

      <Dialog open={bookingOpen} onOpenChange={(open) => { setBookingOpen(open); if (!open) setRequestReady(false); }}>
        <DialogContent className="max-h-[92svh] max-w-xl overflow-y-auto rounded-xl border-border bg-card">
          {!requestReady ? (
            <>
              <DialogHeader className="pr-7 text-left">
                <DialogTitle className="font-display text-2xl">Book {pkgTitle}</DialogTitle>
                <DialogDescription>{pkgLocation} · {pkgDuration} · ₹{pricing.price} per person</DialogDescription>
              </DialogHeader>

              <div className="flex items-center justify-between gap-3 border-y border-border py-3 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Choose your travel date</span>
                <span className="font-semibold text-foreground">₹{pricing.price} / person</span>
              </div>

              <form className="space-y-4" onSubmit={handleBookingSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label htmlFor={`${formId}-name`} className="space-y-2 text-foreground">
                    <span>Full name</span>
                    <Input id={`${formId}-name`} name="name" autoComplete="name" placeholder="Your name" required />
                  </Label>
                  <Label htmlFor={`${formId}-email`} className="space-y-2 text-foreground">
                    <span>Email address</span>
                    <Input id={`${formId}-email`} name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
                  </Label>
                  <Label htmlFor={`${formId}-phone`} className="space-y-2 text-foreground">
                    <span>Phone number</span>
                    <Input id={`${formId}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="Your phone number" required />
                  </Label>
                  <Label htmlFor={`${formId}-date`} className="space-y-2 text-foreground">
                    <span>Travel date</span>
                    <Input id={`${formId}-date`} name="date" type="date" min={earliestDate} required />
                  </Label>
                  <Label htmlFor={`${formId}-travelers`} className="space-y-2 text-foreground sm:col-span-2">
                    <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Travelers</span>
                    <Input id={`${formId}-travelers`} name="travelers" type="number" min={1} max={20} value={travelers} onChange={(event) => setTravelers(Math.min(20, Math.max(1, Number(event.target.value) || 1)))} required />
                  </Label>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated total · {travelers} {travelers === 1 ? "traveler" : "travelers"}</p>
                    <p className="font-display text-xl font-bold text-foreground">₹{pricing.price * travelers}</p>
                  </div>
                  <Button type="submit" className="gradient-accent border-0 text-accent-foreground">Continue</Button>
                </div>
              </form>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="h-6 w-6" /></div>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Booking details ready</DialogTitle>
                <DialogDescription className="mx-auto max-w-sm">Your {pkgTitle} request is ready for review. No reservation or payment has been submitted.</DialogDescription>
              </DialogHeader>
              <div className="my-5 rounded-lg bg-muted p-4 text-left text-sm">
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Trip total</span><span className="font-semibold text-foreground">₹{pricing.price * travelers}</span></div>
                {pricing.offerCode && <div className="mt-2 flex justify-between gap-3"><span className="text-muted-foreground">Offer applied</span><span className="font-semibold text-primary">{pricing.offerCode}</span></div>}
              </div>
              <Button onClick={() => setBookingOpen(false)} className="w-full">Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PackageCard;
