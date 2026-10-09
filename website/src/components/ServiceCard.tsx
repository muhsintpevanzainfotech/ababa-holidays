import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, type LucideIcon } from "lucide-react";
import { getImageUrl } from "@/lib/imageHelper";

interface ServiceCardProps {
  icon?: LucideIcon | any;
  title: string;
  description: string;
  slug: string;
  image?: string;
  index: number;
}

const ServiceCard = ({ icon: Icon, title, description, slug, image, index }: ServiceCardProps) => {
  const displayImage = getImageUrl(image, "/favicon.png");

  const renderIcon = () => {
    if (Icon && typeof Icon !== "string") {
      return <Icon className="h-5 w-5 text-accent-foreground" />;
    }
    if (typeof Icon === "string" && Icon.trim() !== "") {
      const src = getImageUrl(Icon, "/favicon.png");
      return <img src={src} alt={title} onError={(e) => { (e.target as HTMLImageElement).src = "/favicon.png"; }} className="h-5 w-5 object-contain" />;
    }
    return <img src="/favicon.png" alt={title} className="h-5 w-5 object-contain" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      data-reveal
    >
      <Link to={`/services/${slug}`} className="group block h-full">
        <div className="relative h-full overflow-hidden rounded-[1.75rem] shadow-card">
          <div className="aspect-[4/4.6] overflow-hidden sm:aspect-[4/3]">
            <img
              src={displayImage}
              alt={title}
              onError={(e) => { (e.target as HTMLImageElement).src = "/favicon.png"; }}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/35 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl gradient-accent shadow-card">
              {renderIcon()}
            </div>
            <h3 className="mb-1 font-display text-lg font-semibold text-on-image">{title}</h3>
            <p className="line-clamp-2 text-sm text-on-image-muted">{description}</p>
            <div className="mt-3 flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Explore <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;
