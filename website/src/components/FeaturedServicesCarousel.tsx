import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Globe,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store";
import { fetchServicesStart } from "@/store/slices/servicesSlice";
import { getImageUrl } from "@/lib/imageHelper";

const FeaturedServicesCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { services: reduxServices, loading } = useAppSelector((state) => state.services);

  useEffect(() => {
    if (!reduxServices || reduxServices.length === 0) {
      dispatch(fetchServicesStart());
    }
  }, [dispatch, reduxServices]);

  // Continuous Owl Carousel smooth infinite sliding effect (pauses on hover)
  useEffect(() => {
    if (isHovered || !reduxServices || reduxServices.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const step = 200;

        if (scrollLeft + step >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollTo({ left: scrollLeft + step, behavior: "smooth" });
        }
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [isHovered, reduxServices]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      const { scrollLeft } = scrollRef.current;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      className="py-4 lg:py-6 bg-background border-none select-none overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-reveal
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Clean Navigation Arrows */}
        <div className="flex items-center justify-end gap-2 mb-3">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Previous Services"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:border-accent active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Next Services"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:border-accent active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Continuous Category Icon Carousel Grid */}
        {loading || !reduxServices || reduxServices.length === 0 ? (
          /* SKELETON LOADER (7 items in a row) */
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 pt-1 scrollbar-hide">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div
                key={idx}
                className="shrink-0 flex flex-col items-center animate-pulse w-[40%] sm:w-[26%] md:w-[18%] lg:w-[calc((100%-6*1rem)/7)] min-w-[100px] lg:min-w-0"
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted/60 border border-border/40 mb-2" />
                <div className="h-3.5 w-16 sm:w-20 bg-muted/60 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 pt-1 scrollbar-hide snap-x snap-mandatory cursor-grab active:cursor-grabbing"
            style={{ scrollBehavior: "smooth" }}
          >
            {reduxServices.map((item, index) => {
              const itemTitle = item.title || item.name || "Service";
              const itemImage = getImageUrl(item.image, "/favicon.png");
              const iconSrc = item.icon && typeof item.icon === "string" && item.icon.trim() !== ""
                ? getImageUrl(item.icon, null as any)
                : null;

              const Icon = item.icon && typeof item.icon !== "string" ? item.icon : Globe;
              const path = item.path || (item.slug ? `/service/${item.slug}` : `/packages`);
              const iconBg = item.iconBg || "bg-accent/15 border-accent/30";
              const iconColor = item.iconColor || "text-accent";

              return (
                <motion.div
                  key={item.id || item._id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => navigate(path)}
                  className="group shrink-0 snap-start flex flex-col items-center cursor-pointer w-[40%] sm:w-[26%] md:w-[18%] lg:w-[calc((100%-6*1rem)/7)] min-w-[100px] lg:min-w-0"
                >
                  {/* View Icon Container */}
                  <div className="relative mb-2 flex items-center justify-center">
                    <div
                      className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 bg-card p-0.5 shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-card ${iconBg}`}
                    >
                      {/* Background Image Accent */}
                      <img
                        src={itemImage}
                        alt={itemTitle}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/favicon.png";
                        }}
                        className="h-full w-full rounded-full object-cover opacity-35 group-hover:opacity-50 transition-opacity duration-500 group-hover:scale-110"
                      />

                      {/* Centered Large Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-card/90 backdrop-blur-md shadow-md transition-transform duration-300 group-hover:scale-105">
                          {iconSrc ? (
                            <img
                              src={iconSrc}
                              alt={itemTitle}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/favicon.png";
                              }}
                              className="h-6 w-6 object-contain"
                            />
                          ) : item.icon && typeof item.icon !== "string" ? (
                            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
                          ) : (
                            <img src="/favicon.png" alt={itemTitle} className="h-6 w-6 object-contain" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badge Pill */}
                    {item.badge && (
                      <span className="absolute -top-1 right-0 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-accent-foreground shadow-sm uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Category Title */}
                  <div className="text-center w-full px-1">
                    <h3 className="font-display text-xs sm:text-sm font-bold text-foreground group-hover:text-accent transition-colors duration-200 line-clamp-1">
                      {itemTitle}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedServicesCarousel;
