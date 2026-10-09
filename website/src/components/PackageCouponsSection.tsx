import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Tag,
  Copy,
  Check,
  ArrowRight,
  Gift,
  Clock,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCouponsApi } from "@/api/endpoints";

export interface CouponItem {
  id: string;
  code: string;
  discountTitle: string;
  description: string;
  discountTag: string;
  minBooking?: string;
  expiryDate?: string;
  badge?: string;
}

const PackageCouponsSection = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchCoupons = async () => {
      setIsLoading(true);
      try {
        const raw = await getCouponsApi();
        if (isMounted && Array.isArray(raw) && raw.length > 0) {
          const mapped: CouponItem[] = raw.map((c: any, idx: number) => ({
            id: c._id || `c-api-${idx}`,
            code: c.code || `OFFER${idx + 1}`,
            discountTitle:
              c.discountType === "percentage"
                ? `${c.discountValue}% OFF Package Booking`
                : `Flat ₹${c.discountValue} OFF`,
            description: c.package?.title
              ? `Valid specifically for ${c.package.title}`
              : "Applicable across all tour packages and holiday bookings.",
            discountTag:
              c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`,
            minBooking: c.minBookingAmount ? `Min Spend ₹${c.minBookingAmount}` : "No Min Spend",
            expiryDate: c.expiryDate
              ? `Expires ${new Date(c.expiryDate).toLocaleDateString()}`
              : "Limited Period",
            badge: c.scope === "single_package" ? "📦 Special Package Deal" : "🎟️ Site Coupon",
          }));
          setCoupons(mapped);
        } else {
          if (isMounted) setCoupons([]);
        }
      } catch {
        if (isMounted) setCoupons([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCoupons();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Coupon Code Copied! 🎟️",
      description: `Code "${code}" copied to clipboard. Apply it during package booking to redeem discount.`,
    });
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // If loading or no real coupon codes exist in database, return null cleanly
  if (isLoading || coupons.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-background relative overflow-hidden" data-reveal>
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-navy-dark border border-white/15 p-6 sm:p-10 lg:p-12 shadow-2xl"
        >
          {/* Ambient Lighting Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/15 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-[110px] pointer-events-none" />

          {/* Header Section */}
          <div className="relative z-10 max-w-3xl mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider mb-3">
              <Gift className="w-3.5 h-3.5" />
              <span>Active Package Coupons</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
              Exclusive Package Coupon Codes
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Copy active coupon codes created by Ababa Holidays admin team to redeem instant savings on your tour package bookings.
            </p>
          </div>

          {/* Coupons Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {coupons.map((coupon, i) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-accent/50 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                      {coupon.badge || "🎟️ Coupon"}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Percent className="w-3 h-3" /> {coupon.discountTag}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-white text-base leading-snug group-hover:text-accent transition-colors mb-1.5">
                    {coupon.discountTitle}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {coupon.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/10">
                  {/* Coupon Code Copy Box */}
                  <div className="flex items-center justify-between bg-black/40 p-2 sm:p-2.5 rounded-xl border border-dashed border-accent/50">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none mb-0.5">Coupon Code</span>
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-accent uppercase tracking-wider">
                        {coupon.code}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code)}
                      className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold transition-all flex items-center gap-1 shadow-sm shrink-0"
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                    <span>{coupon.minBooking}</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3 h-3 text-accent" /> {coupon.expiryDate}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Action Footer */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Tag className="w-4 h-4 text-accent shrink-0" />
              <span>Copy code and apply on booking checkout to receive instant discount.</span>
            </div>

            <Link to="/packages">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-bold text-xs gap-2 px-6 h-10 shadow-md">
                Browse All Packages <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PackageCouponsSection;
