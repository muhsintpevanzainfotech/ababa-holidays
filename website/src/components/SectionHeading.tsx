import { motion } from "framer-motion";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  center?: boolean;
}

const SectionHeading = ({ badge, title, description, center = true }: SectionHeadingProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mb-10 md:mb-14 ${center ? "text-center" : ""}`}
    >
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300 border border-sky-500/20 text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-md shadow-sm">
          {badge}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-foreground tracking-tight mb-3 leading-tight">
        {title}
      </h2>
      {description && <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">{description}</p>}
    </motion.div>
  );
};

export default SectionHeading;
