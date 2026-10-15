import { useEffect } from "react";
import { Shield, Headphones, Award, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBannerCarousel from "@/components/PromoBannerCarousel";
import PackageSlider from "@/components/PackageSlider";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import SectionHeading from "@/components/SectionHeading";
import OfferModal from "@/components/OfferModal";
import TopVendorsSection from "@/components/TopVendorsSection";
import FeaturedServicesCarousel from "@/components/FeaturedServicesCarousel";
import PackageCouponsSection from "@/components/PackageCouponsSection";
import AIPlannerPreview from "@/components/planner/AIPlannerPreview";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchHomeDataStart } from "@/store/slices/homeSlice";

import destSantorini from "@/assets/dest-santorini.jpg";
import destBali from "@/assets/dest-bali.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destSwitzerland from "@/assets/dest-switzerland.jpg";
import destMaldives from "@/assets/dest-maldives.jpg";
import destParis from "@/assets/dest-paris.jpg";
import destTokyo from "@/assets/dest-tokyo.jpg";
import destKerala from "@/assets/dest-kerala-backwaters.jpg";
import destMunnar from "@/assets/dest-munnar.jpg";
import destKovalam from "@/assets/dest-kovalam.jpg";
import vendorPartnerBg from "@/assets/vendor-partner-bg.jpg";

const destinations = [
  { name: "Kerala", country: "India", image: destKerala, packages: 8 },
  { name: "Munnar", country: "Kerala", image: destMunnar, packages: 4 },
  { name: "Kovalam", country: "Kerala", image: destKovalam, packages: 3 },
  { name: "Santorini", country: "Greece", image: destSantorini, packages: 24 },
  { name: "Bali", country: "Indonesia", image: destBali, packages: 18 },
  { name: "Dubai", country: "UAE", image: destDubai, packages: 32 },
  { name: "Paris", country: "France", image: destParis, packages: 21 },
  { name: "Tokyo", country: "Japan", image: destTokyo, packages: 16 },
  { name: "Switzerland", country: "Europe", image: destSwitzerland, packages: 15 },
  { name: "Maldives", country: "South Asia", image: destMaldives, packages: 20 },
];

const Index = () => {
  const dispatch = useAppDispatch();
  const { featuredPackages, popularDestinations, testimonials: reduxTestimonials, loading } = useAppSelector((state) => state.home);

  const topRatedPackages = Array.isArray(featuredPackages) && featuredPackages.length > 0
    ? (featuredPackages.filter((p: any) => p.topRated || (p.rating && p.rating >= 4.8) || (p.averageRating && p.averageRating >= 4.8)).length > 0
        ? featuredPackages.filter((p: any) => p.topRated || (p.rating && p.rating >= 4.8) || (p.averageRating && p.averageRating >= 4.8))
        : featuredPackages.slice(0, 8))
    : [];

  const popularPackages = Array.isArray(featuredPackages) && featuredPackages.length > 0
    ? (featuredPackages.filter((p: any) => p.featured || p.isFeatured).length > 0
        ? featuredPackages.filter((p: any) => p.featured || p.isFeatured)
        : featuredPackages.slice(0, 8))
    : [];

  useEffect(() => {
    dispatch(fetchHomeDataStart());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PromoBannerCarousel />
      <FeaturedServicesCarousel />

      <OfferModal />


      <section className="bg-background py-8 lg:py-12" data-reveal>
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="⭐ Top Rated" title="Highest Rated Packages" description="Our most loved packages with the best ratings from travelers." />
          <PackageSlider packages={topRatedPackages} loading={loading} />
          <div className="mt-6 text-center">
            <Link to="/packages">
              <Button variant="outline" size="lg" className="gap-2 rounded-full">View All Packages <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-background py-8 lg:py-12" data-reveal>
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="🔥 Popular" title="Trending Travel Experiences" description="Discover our most popular packages loved by thousands of travelers worldwide." />
          <PackageSlider packages={popularPackages} loading={loading} />
        </div>
      </section>

      <TopVendorsSection />

      <AIPlannerPreview />

      <section className="py-6 md:py-8" data-reveal>
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
          >
            <img src={vendorPartnerBg} alt="Become a vendor" className="h-48 w-full object-cover md:h-64" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy-dark/85 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-xl px-6 md:px-12">
                <span className="mb-3 inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent">🏪 VENDOR NETWORK</span>
                <h3 className="mb-2 font-display text-xl font-bold text-on-image md:text-3xl">Become a Verified Travel Partner</h3>
                <p className="mb-4 hidden text-sm text-on-image-muted sm:block">List your tour packages, hotels, buses, or transport services to reach thousands of travelers daily with zero listing fees.</p>
                <Link to="/vendor-register">
                  <Button className="gradient-accent border-0 text-accent-foreground hover:opacity-90 font-semibold gap-2">Become a Vendor</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-background py-8 lg:py-12" data-reveal>
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="Top Destinations" title="Popular Destinations" description="Explore trending destinations loved by travelers around the globe." />
          <div className="grid grid-cols-2 gap-3 md:gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {destinations.map((dest, i) => (
              <motion.div key={dest.name} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl hover-lift">
                <img src={dest.image} alt={dest.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy-dark/20 to-transparent" />
                <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
                  <h3 className="font-display text-sm font-semibold text-on-image md:text-lg">{dest.name}</h3>
                  <p className="text-xs text-on-image-muted md:text-sm">{dest.packages} packages</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsCarousel testimonials={reduxTestimonials} loading={loading} />

      <section className="bg-background py-8 lg:py-12" data-reveal>
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="Why Us" title="Why Choose dotravels" />
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {[
              { icon: Shield, title: "Trusted & Secure", desc: "Your bookings are protected with our secure platform" },
              { icon: Award, title: "Best Price Guarantee", desc: "We match any price — guaranteed lowest rates" },
              { icon: Headphones, title: "24/7 Support", desc: "Round-the-clock assistance for all your needs" },
              { icon: Clock, title: "Easy Booking", desc: "Book your dream trip in just a few clicks" },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="surface-panel p-4 text-center md:p-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 md:mb-4 md:h-14 md:w-14">
                  <item.icon className="h-6 w-6 text-accent md:h-7 md:w-7" />
                </div>
                <h3 className="mb-1 font-display text-sm font-semibold text-foreground md:mb-2 md:text-base">{item.title}</h3>
                <p className="text-xs text-muted-foreground md:text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12" data-reveal>
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="gradient-hero relative overflow-hidden rounded-3xl p-8 text-center md:p-14">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--accent)), transparent 50%), radial-gradient(circle at 80% 50%, hsl(var(--primary)), transparent 50%)" }} />
            <div className="relative z-10">
              <h2 className="mb-3 font-display text-2xl font-bold text-on-image md:mb-4 md:text-4xl">Ready to Start Your Journey?</h2>
              <p className="mx-auto mb-6 max-w-xl text-sm text-on-image-muted md:mb-8 md:text-base">Join thousands of happy travelers. Book your dream vacation today and get exclusive deals.</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/packages"><Button size="lg" className="gradient-accent border-0 px-8 text-base text-accent-foreground hover:opacity-90">Explore Packages</Button></Link>
                <Link to="/contact"><Button size="lg" variant="outline" className="border-on-image/25 bg-on-image/5 px-8 text-base text-on-image hover:bg-on-image/15 hover:text-on-image">Contact Us</Button></Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <PackageCouponsSection />

      <Footer />
    </div>
  );
};

export default Index;
