import { useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PackageCard from "./PackageCard";
import {
  FeaturedServiceItem,
  ServicePackageItem,
} from "@/types/travel";
import { getImageUrl } from "@/lib/imageHelper";

interface SingleServiceShowcaseSectionProps {
  service: FeaturedServiceItem;
  packages: ServicePackageItem[];
  index: number;
}

const SingleServiceShowcaseSection = ({
  service,
  packages,
  index,
}: SingleServiceShowcaseSectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      const { scrollLeft } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-5 my-4">
      {/* LEFT COLUMN: Featured Service Card */}
      <div className="shrink-0 w-full sm:w-[310px] xl:w-[325px] flex flex-col py-2.5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: index * 0.04 }}
          className="group relative h-full w-full rounded-[1.2rem] overflow-hidden shadow-md border border-border/60 flex flex-col justify-between p-5 text-white min-h-[415px]"
        >
          {/* Background Image & Dark Gradient Overlay */}
          <img
            src={getImageUrl(service.image, "/favicon.png")}
            alt={service.name || service.title || "Service"}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/favicon.png";
            }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

          {/* Top Content */}
          <div className="relative z-10 space-y-2">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {service.name}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
              {service.description}
            </p>
          </div>

          {/* Middle CTA */}
          <div className="relative z-10 pt-2 pb-12">
            <Link to={service.ctaPath}>
              <Button className="w-full rounded-full border-0 gradient-accent text-accent-foreground font-bold gap-2 text-xs shadow-md hover:opacity-90">
                <span>{service.ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* BOTTOM Card Control Bar: Slide Packages Left & Right */}
          <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/15 px-3 py-1.5 text-white shadow-xl">
            <span className="text-[11px] font-semibold text-slate-200">Package Controls</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Previous packages"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-accent hover:text-accent-foreground active:scale-95"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Next packages"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-accent hover:text-accent-foreground active:scale-95"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: Package Cards Carousel */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2.5 px-1 -mx-1 min-h-[415px]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {packages.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-16 text-center surface-panel rounded-[1.2rem] space-y-2 h-full min-h-[415px]">
              <p className="text-sm font-bold text-foreground">No packages listed yet for {service.name}</p>
              <p className="text-xs text-muted-foreground">Check back soon or explore our main tour package catalog.</p>
              <Link to="/packages">
                <Button variant="outline" size="sm" className="rounded-full text-xs mt-2">Browse All Packages</Button>
              </Link>
            </div>
          ) : (
            packages.map((pkg, pkgIdx) => (
              <div
                key={pkg.id || (pkg as any)._id || pkgIdx}
                className="shrink-0 w-[285px] sm:w-[310px] xl:w-[325px] snap-start flex flex-col h-full min-h-[415px]"
              >
                <PackageCard
                  {...pkg}
                  index={pkgIdx}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import { useAppSelector } from "@/store";

const ServicePackageShowcase = () => {
  const { services: reduxServices, loading: servicesLoading } = useAppSelector((state) => state.services);
  const { packages: reduxPackages } = useAppSelector((state) => state.packages);

  const activeServices: any[] = Array.isArray(reduxServices) ? reduxServices : [];
  const activePackages: any[] = Array.isArray(reduxPackages) ? reduxPackages : [];

  if (servicesLoading) {
    return (
      <section className="py-6 sm:py-8 bg-background border-none select-none">
        <div className="container mx-auto px-4 lg:px-8 space-y-12">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="flex flex-col lg:flex-row items-stretch gap-5 my-4 animate-pulse">
              <div className="shrink-0 w-full sm:w-[310px] xl:w-[325px] h-[415px] rounded-[1.2rem] bg-muted/60" />
              <div className="flex-1 flex gap-4 overflow-x-auto py-2.5">
                {Array.from({ length: 3 }).map((_, pIdx) => (
                  <div key={pIdx} className="shrink-0 w-[285px] sm:w-[310px] xl:w-[325px] h-[415px] rounded-[1.2rem] bg-muted/60" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-8 bg-background border-none select-none">
      <div className="container mx-auto px-4 lg:px-8 space-y-12">
        {activeServices.map((service, index) => {
          const serviceIdStr = String(service.id || service._id || "");
          const servicePkgs = activePackages.filter((pkg: any) => {
            const pkgServiceId = String(pkg.serviceId || pkg.serviceCategory?._id || pkg.serviceCategory || pkg.service?._id || pkg.service || "");
            const pkgCategory = String(pkg.category?.name || pkg.category?.title || pkg.category || "").toLowerCase();
            const serviceName = String(service.name || service.title || "").toLowerCase();
            return (
              (serviceIdStr && pkgServiceId === serviceIdStr) ||
              (serviceName && pkgCategory.includes(serviceName))
            );
          });
          return (
            <SingleServiceShowcaseSection
              key={service.id || service._id || index}
              service={{
                ...service,
                name: service.name || service.title || "Service",
                ctaPath: service.ctaPath || (service.slug ? `/service/${service.slug}` : "/packages"),
                ctaText: service.ctaText || "Explore Packages",
              }}
              packages={servicePkgs}
              index={index}
            />
          );
        })}
      </div>
    </section>
  );
};

export default ServicePackageShowcase;
