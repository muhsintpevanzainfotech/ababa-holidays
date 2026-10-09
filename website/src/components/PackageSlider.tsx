import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";
import PackageCard from "./PackageCard";
import { PackageData } from "@/types/travel";

interface PackageSliderProps {
  packages: PackageData[] | any[];
  title?: string;
  badge?: string;
  loading?: boolean;
}

const PackageSlider = ({ packages, title, badge, loading }: PackageSliderProps) => {
  if (loading) {
    return (
      <div className="relative">
        {(title || badge) && (
          <div className="mb-6 flex items-center gap-3">
            {badge && (
              <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                {badge}
              </span>
            )}
            {title && <h3 className="font-display text-xl font-bold text-foreground md:text-2xl">{title}</h3>}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-[390px] rounded-3xl bg-muted/60 animate-pulse border border-border/40" />
          ))}
        </div>
      </div>
    );
  }

  if (!packages || packages.length === 0) return null;

  return (
    <div className="relative" data-reveal>
      {(title || badge) && (
        <div className="mb-6 flex items-center gap-3">
          {badge && (
            <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              {badge}
            </span>
          )}
          {title && <h3 className="font-display text-xl font-bold text-foreground md:text-2xl">{title}</h3>}
        </div>
      )}
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1.08}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        breakpoints={{
          480: { slidesPerView: 1.2 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="package-swiper !pb-12"
      >
        {packages.map((pkg, i) => (
          <SwiperSlide key={pkg.id || pkg._id || i} className="h-auto">
            <PackageCard {...pkg} index={i} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PackageSlider;
