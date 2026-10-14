import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import SectionHeading from "./SectionHeading";
import TestimonialCard from "./TestimonialCard";

interface TestimonialsCarouselProps {
  testimonials: any[];
  loading?: boolean;
}

const defaultTestimonials = [
  {
    name: "Sarah Johnson",
    role: "Adventure Traveler",
    content: "dotravels made our family trip to Bali absolutely magical. Every detail was perfectly handled!",
    rating: 5,
  },
  {
    name: "Ahmed Hassan",
    role: "Business Traveler",
    content: "Their Hajj package was incredibly well-organized. The entire experience was seamless and spiritually fulfilling.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Kerala Explorer",
    content: "The Complete Kerala package was beyond our expectations. Backwaters, Munnar, Thekkady — every place was stunning!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Global Voyager",
    content: "Seamless flight booking, fast visa processing, and excellent 24/7 customer support throughout our European tour!",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "Honeymooner",
    content: "Our Maldives honeymoon resort stay was picture perfect. Outstanding service and unbelievable member rates!",
    rating: 5,
  },
];

const TestimonialsCarousel = ({ testimonials, loading }: TestimonialsCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const listToRender = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  // Continuous auto-slider (pauses on hover)
  useEffect(() => {
    if (isHovered || loading || listToRender.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const step = 320;

        if (scrollLeft + step >= maxScroll - 15) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollTo({ left: scrollLeft + step, behavior: "smooth" });
        }
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [isHovered, loading, listToRender]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      const { scrollLeft } = scrollRef.current;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      className="bg-background py-8 lg:py-12 select-none overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-reveal
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header Bar with Title and Slider Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <SectionHeading
            badge="Official Success Stories"
            title="What Travelers Say"
            description="Real stories from real travelers who explored the world with us."
          />

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto mb-4 sm:mb-6">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Previous Testimonials"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-sm transition-all duration-200 hover:gradient-accent hover:text-accent-foreground hover:border-transparent hover:shadow-md hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Next Testimonials"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-sm transition-all duration-200 hover:gradient-accent hover:text-accent-foreground hover:border-transparent hover:shadow-md hover:scale-105 active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel Content */}
        {loading ? (
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="w-[300px] sm:w-[350px] h-52 shrink-0 rounded-3xl bg-muted/60 animate-pulse border border-border/40"
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 pt-1 scrollbar-hide snap-x snap-mandatory cursor-grab active:cursor-grabbing"
            style={{ scrollBehavior: "smooth" }}
          >
            {listToRender.map((item: any, index: number) => (
              <div
                key={item.id || item._id || index}
                className="w-[300px] sm:w-[350px] shrink-0 snap-start flex flex-col"
              >
                <TestimonialCard {...item} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
