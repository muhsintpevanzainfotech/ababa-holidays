import { Star, Quote, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/imageHelper";

interface TestimonialCardProps {
  name?: string;
  customerName?: string;
  role?: string;
  customerDesignation?: string;
  content?: string;
  message?: string;
  comment?: string;
  rating?: number;
  image?: string;
  avatar?: string;
  index: number;
}

const TestimonialCard = ({
  name,
  customerName,
  role,
  customerDesignation,
  content,
  message,
  comment,
  rating,
  image,
  avatar,
  index,
}: TestimonialCardProps) => {
  const displayName = customerName || name || "Valued Traveler";
  const displayRole = customerDesignation || role || "Verified Traveler";
  const displayContent = content || message || comment || "Wonderful experience with dotravels!";
  const displayRating = rating ? Number(rating) : 5;

  const rawImg = image || avatar;
  const avatarSrc = rawImg ? getImageUrl(rawImg, null as any) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative h-full rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between overflow-hidden"
    >
      {/* Subtle Gradient Hover Backdrop & Quote Watermark */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <Quote className="absolute right-4 top-4 h-16 w-16 text-primary/5 group-hover:text-accent/15 transition-colors duration-500 pointer-events-none" />

      {/* Card Top: Rating Pill Badge */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-3 py-1 text-xs font-bold text-amber-500 shadow-sm">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < displayRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="ml-1 text-[11px] font-extrabold">{displayRating.toFixed(1)}</span>
        </div>

        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
          Verified Review
        </span>
      </div>

      {/* Review Content Quote */}
      <div className="relative z-10 flex-1 mb-6">
        <p className="text-foreground/90 text-sm leading-relaxed font-normal italic line-clamp-4">
          "{displayContent}"
        </p>
      </div>

      {/* Card Footer: User Profile & Verified Badge */}
      <div className="relative z-10 flex items-center gap-3.5 pt-4 border-t border-border/60">
        <div className="relative shrink-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={displayName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/favicon.png";
              }}
              className="w-11 h-11 rounded-full object-cover border-2 border-accent/40 shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-11 h-11 rounded-full gradient-accent flex items-center justify-center text-accent-foreground font-display font-bold text-sm shadow-sm transition-transform duration-300 group-hover:scale-105">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 h-4 w-4 fill-emerald-500 text-white shadow-sm" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-display text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors duration-200">
            {displayName}
          </h4>
          <p className="text-xs text-muted-foreground truncate font-medium">{displayRole}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
