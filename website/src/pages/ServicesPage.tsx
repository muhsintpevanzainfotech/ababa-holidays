import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturedServicesCarousel from "@/components/FeaturedServicesCarousel";
import ServicePackageShowcase from "@/components/ServicePackageShowcase";
import { useAppDispatch } from "@/store";
import { fetchServicesStart } from "@/store/slices/servicesSlice";
import { fetchPackagesStart } from "@/store/slices/packagesSlice";

const ServicesPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchServicesStart());
    dispatch(fetchPackagesStart({}));
  }, [dispatch]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Circular Featured Services Carousel (Top Section Below Navbar) */}
      <div className="pt-20 sm:pt-24">
        <FeaturedServicesCarousel />
      </div>

      {/* Main Feature Showcase Section (Left Service Card + Right Related Packages Carousel) */}
      <ServicePackageShowcase />

      <Footer />
    </div>
  );
};

export default ServicesPage;
