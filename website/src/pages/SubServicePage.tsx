import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Phone, MessageCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeading from "@/components/SectionHeading";
import PackageSlider from "@/components/PackageSlider";
import PackageCard from "@/components/PackageCard";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchSubServiceStart } from "@/store/slices/servicesSlice";
import { fetchPackagesStart } from "@/store/slices/packagesSlice";

const SubServicePage = () => {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { selectedSubService } = useAppSelector((state) => state.services);
  const { packages: reduxPackages } = useAppSelector((state) => state.packages);

  useEffect(() => {
    if (slug) {
      dispatch(fetchSubServiceStart(slug));
    }
    if (!reduxPackages || reduxPackages.length === 0) {
      dispatch(fetchPackagesStart({}));
    }
  }, [slug, dispatch, reduxPackages]);

  const service = selectedSubService;
  const [showAll, setShowAll] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 md:pt-32 pb-20 text-center">
          <h1 className="text-3xl font-display font-bold text-foreground">Service Not Found</h1>
          <Link to="/services"><Button className="mt-4">Back to Services</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Get related packages
  const relatedPackages = Array.isArray(reduxPackages) && reduxPackages.length > 0
    ? service.relatedPackageCategory
      ? reduxPackages.filter((p: any) => {
          const cat = String(p.category?.name || p.category?.title || p.category || "").toLowerCase();
          return cat.includes(String(service.relatedPackageCategory).toLowerCase());
        })
      : reduxPackages.slice(0, 8)
    : [];

  const topRated = (relatedPackages.filter((p: any) => p.topRated || ((p.rating || p.averageRating) && Number(p.rating || p.averageRating) >= 4.5)).length > 0
    ? relatedPackages.filter((p: any) => p.topRated || ((p.rating || p.averageRating) && Number(p.rating || p.averageRating) >= 4.5))
    : relatedPackages).slice(0, 8);

  const popular = (relatedPackages.filter((p: any) => p.featured || p.isFeatured).length > 0
    ? relatedPackages.filter((p: any) => p.featured || p.isFeatured)
    : relatedPackages).slice(0, 8);

  const categories = ["All", ...new Set(relatedPackages.map((p: any) => typeof p.category === "string" ? p.category : p.category?.name || p.category?.title).filter(Boolean))];
  const filteredPackages = filterCategory === "All"
    ? (relatedPackages.length > 0 ? relatedPackages : (Array.isArray(reduxPackages) ? reduxPackages.slice(0, 8) : []))
    : relatedPackages.filter((p: any) => {
        const cat = typeof p.category === "string" ? p.category : p.category?.name || p.category?.title || "";
        return cat === filterCategory;
      });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[45vh] md:h-[55vh]">
        <img src={service.heroImage} alt={service.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/50 to-navy-dark/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto px-4 lg:px-8">
            <Link to="/services" className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-primary-foreground mb-4 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> All Services
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                <service.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h1 className="text-2xl md:text-5xl font-display font-bold text-primary-foreground">{service.title}</h1>
            </div>
            <p className="text-primary-foreground/60 max-w-2xl text-sm md:text-base">{service.longDescription}</p>
          </div>
        </div>
      </div>

      {/* Offer Banner */}
      {service.offerBanner && (
        <section className="py-6 md:py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="gradient-accent rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <Tag className="w-8 h-8 text-accent-foreground" />
                <div>
                  <h3 className="font-display font-bold text-accent-foreground text-lg">{service.offerBanner.title}</h3>
                  <p className="text-accent-foreground/80 text-sm">{service.offerBanner.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 rounded-xl bg-white/20 text-accent-foreground font-mono font-bold text-sm">
                  {service.offerBanner.code}
                </span>
                <span className="px-4 py-2 rounded-xl bg-white/30 text-accent-foreground font-bold text-sm">
                  {service.offerBanner.discount}
                </span>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Sub Services Grid */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="Choose Your Option" title={`${service.title} Categories`} description="Select the option that best fits your needs and budget." />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
            {service.subs.map((sub, i) => (
              <motion.div
                key={sub.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover-lift group"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={sub.image} alt={sub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base md:text-lg font-display font-semibold text-foreground">{sub.name}</h3>
                    <span className="text-accent font-display font-bold text-xs md:text-sm">{sub.price}</span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-4">{sub.description}</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {sub.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-1.5 text-xs text-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/booking/service-${slug}`} className="flex-1">
                      <Button className="w-full gradient-accent text-accent-foreground border-0 hover:opacity-90 gap-1 text-xs md:text-sm">
                        Book Now <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Packages Slider */}
      {topRated.length > 0 && (
        <section className="py-12 lg:py-20 bg-muted/50">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeading badge="⭐ Top Rated" title="Highest Rated Packages" description="Top-rated packages related to this service." />
            <PackageSlider packages={topRated} />
          </div>
        </section>
      )}

      {/* Popular Packages Slider */}
      {popular.length > 0 && (
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeading badge="🔥 Popular" title="Popular Packages" description="Most popular packages for this category." />
            <PackageSlider packages={popular} />
          </div>
        </section>
      )}

      {/* All Related Packages with Filters */}
      <section className="py-12 lg:py-20 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="All Packages" title="Browse All Related Packages" />

          {/* Filter Chips */}
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filterCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory(cat)}
                className={filterCategory === cat ? "gradient-accent text-accent-foreground border-0" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(showAll ? filteredPackages : filteredPackages.slice(0, 6)).map((pkg, i) => (
              <PackageCard key={pkg.id} {...pkg} index={i} />
            ))}
          </div>

          {filteredPackages.length > 6 && !showAll && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" onClick={() => setShowAll(true)} className="gap-2">
                View All ({filteredPackages.length}) <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {filteredPackages.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No packages found for this filter.</p>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="gradient-hero rounded-3xl p-8 md:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(var(--accent) / 0.7), transparent 50%)" }} />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-3">
                Need a Custom {service.title} Package?
              </h2>
              <p className="text-primary-foreground/60 max-w-xl mx-auto mb-6 text-sm md:text-base">
                Contact us for customized solutions tailored to your specific needs and budget.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="gradient-accent text-accent-foreground border-0 hover:opacity-90 gap-2">
                  <MessageCircle className="w-4 h-4" /> Get Custom Quote
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-primary-foreground hover:bg-white/10 gap-2">
                  <Phone className="w-4 h-4" /> Call Us Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SubServicePage;
