import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Copy, Check, Clock, Tag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STORAGE_KEY = "gth_offer_modal_seen";

import { useAppSelector } from "@/store";

const defaultOffers = [
  { id: "kerala", title: "Kerala Special 🌿", subtitle: "Flat 30% off on all Kerala packages", code: "KERALA30", discount: "30% OFF", expiry: "Apr 30, 2026" },
  { id: "honeymoon", title: "Honeymoon Special 💕", subtitle: "Free spa package with couple tours", code: "LOVE2026", discount: "FREE SPA", expiry: "Apr 15, 2026" },
];

const OfferModal = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const navigate = useNavigate();
  const { offerBanners } = useAppSelector((state) => state.home);

  useEffect(() => {
    // Show once per session
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (value: boolean) => {
    setOpen(value);
    if (!value) sessionStorage.setItem(STORAGE_KEY, "1");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2200);
  };

  const featured = offerBanners && offerBanners.length > 0 ? offerBanners : defaultOffers;

  const goToPackages = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
    navigate("/packages");
  };

  return (
    <Dialog open={open} onOpenChange={dismiss}>
      <DialogContent className="max-h-[92svh] max-w-xl overflow-hidden rounded-3xl border border-border/80 bg-card p-0 shadow-2xl backdrop-blur-2xl text-foreground">
        {/* Header Strip */}
        <div className="relative border-b border-border/60 bg-gradient-to-r from-slate-900 via-navy-dark to-slate-900 p-6 sm:p-8 text-white overflow-hidden">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative z-10 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Exclusive Seasonal Deals
            </span>
            <DialogTitle className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Travel Smarter, Save Bigger
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs sm:text-sm text-slate-300">
              Claim promo codes for your upcoming tour packages & luxury staycations
            </DialogDescription>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="grid gap-3.5 sm:grid-cols-2">
            {featured.map((offer: any, i: number) => {
              const offerId = offer.id || offer._id || `offer-${i}`;
              const discountText = offer.discount || offer.discountText || "20% OFF";
              const expiryText = offer.expiry || offer.validUntil || "Limited Time";
              const titleText = offer.title || offer.bannerTitle || "Exclusive Travel Offer";
              const subtitleText = offer.subtitle || offer.description || "Special discount on tour packages";
              const promoCode = offer.code || offer.couponCode || offer.promoCode || "TRAVEL2026";

              return (
                <motion.div
                  key={offerId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-muted/30 p-4 transition-all hover:border-accent/40 hover:bg-muted/60"
                >
                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-accent border border-accent/25">
                        <Tag className="h-3 w-3" /> {discountText}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                        <Clock className="h-3 w-3" /> {expiryText}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-foreground leading-snug">
                      {titleText}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {subtitleText}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyCode(promoCode)}
                    className="mt-4 flex w-full items-center justify-between rounded-xl border border-dashed border-accent/50 bg-background px-3.5 py-2 text-left transition-colors hover:border-accent"
                  >
                    <span className="font-mono text-xs font-bold tracking-wider text-accent">
                      {promoCode}
                    </span>
                    {copied === promoCode ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                        <Check className="h-3.5 w-3.5" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-accent">
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </span>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Dialog Action Buttons */}
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={goToPackages}
              className="flex-1 rounded-full bg-accent px-6 py-3 text-xs font-bold text-accent-foreground shadow-md transition-all hover:bg-accent/90 flex items-center justify-center gap-2"
            >
              <span>Explore All Packages</span>
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
            Promo code is copied to clipboard and applied at package checkout.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferModal;
