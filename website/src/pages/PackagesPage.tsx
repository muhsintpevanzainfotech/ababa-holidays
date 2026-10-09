import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Compass,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Award,
  Heart,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import PackageSlider from "@/components/PackageSlider";
import PackageCouponsSection from "@/components/PackageCouponsSection";
import SectionHeading from "@/components/SectionHeading";
import { getPackagePricing } from "@/lib/pricing";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchPackagesStart } from "@/store/slices/packagesSlice";

const categories = ["All", "Beach", "Culture", "Luxury", "Adventure", "Romantic", "Cruise"];
const locations = [
  "All",
  "Kerala, India",
  "India",
  "Greece",
  "Indonesia",
  "UAE",
  "Switzerland",
  "Maldives",
  "France",
  "Japan",
  "Peru",
];
const sortOptions = [
  "Default",
  "Price: Low to High",
  "Price: High to Low",
  "Rating",
  "Duration",
];

const quickSearchTags = [
  "Alleppey Houseboat",
  "Munnar Hills",
  "Wayanad Wildlife",
  "Dubai Luxury",
  "Bali Resorts",
];

const PackagesPage = () => {
  const dispatch = useAppDispatch();
  const { packages: reduxPackages, loading } = useAppSelector((state) => state.packages);

  useEffect(() => {
    dispatch(fetchPackagesStart({}));
  }, [dispatch]);

  const activePackagesList = useMemo(() => {
    return Array.isArray(reduxPackages) ? reduxPackages : [];
  }, [reduxPackages]);

  const maxPackagePrice = useMemo(() => {
    if (!activePackagesList || activePackagesList.length === 0) return 50000;
    return Math.max(
      ...activePackagesList.map((pkg: any) => getPackagePricing(pkg).price || 5000)
    );
  }, [activePackagesList]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLocation, setActiveLocation] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Default");
  const [priceLimit, setPriceLimit] = useState([maxPackagePrice]);
  const [minRating, setMinRating] = useState([4.0]);

  // Sync priceLimit if maxPackagePrice changes dynamically
  useEffect(() => {
    setPriceLimit([maxPackagePrice]);
  }, [maxPackagePrice]);

  const topRated = useMemo(() => {
    const rated = activePackagesList.filter((p: any) => p.topRated || ((p.rating || p.averageRating) && Number(p.rating || p.averageRating) >= 4.5));
    return (rated.length > 0 ? rated : activePackagesList).slice(0, 8);
  }, [activePackagesList]);

  const popular = useMemo(() => {
    const pop = activePackagesList.filter((p: any) => p.featured || p.isFeatured);
    return (pop.length > 0 ? pop : activePackagesList).slice(0, 8);
  }, [activePackagesList]);

  const filteredPackages = useMemo(() => {
    let filtered = activePackagesList.filter((pkg: any) => {
      const catName = typeof pkg.category === "string"
        ? pkg.category
        : pkg.category?.name || pkg.category?.title || pkg.serviceCategory?.name || pkg.serviceCategory?.title || "";
      const matchCat = activeCategory === "All" || catName.toLowerCase().includes(activeCategory.toLowerCase());

      const pkgLoc = pkg.location || pkg.destination || "";
      const searchLoc = activeLocation === "Kerala, India" ? "Kerala" : activeLocation;
      const matchLoc = activeLocation === "All" || pkgLoc.toLowerCase().includes(searchLoc.toLowerCase());

      const title = pkg.title || pkg.packageName || pkg.name || "";
      const desc = pkg.description || pkg.packageDescription || "";
      const matchSearch =
        searchTerm === "" ||
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkgLoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        desc.toLowerCase().includes(searchTerm.toLowerCase());

      const pkgPricing = getPackagePricing(pkg);
      const matchPrice = priceLimit[0] ? pkgPricing.price <= priceLimit[0] : true;
      const pkgRating = Number(pkg.rating || pkg.averageRating || 5);
      const matchRating = pkgRating >= (minRating[0] || 1);

      return matchCat && matchLoc && matchSearch && matchPrice && matchRating;
    });

    if (sortBy === "Price: Low to High") {
      filtered = [...filtered].sort(
        (a, b) => getPackagePricing(a).price - getPackagePricing(b).price
      );
    } else if (sortBy === "Price: High to Low") {
      filtered = [...filtered].sort(
        (a, b) => getPackagePricing(b).price - getPackagePricing(a).price
      );
    } else if (sortBy === "Rating") {
      filtered = [...filtered].sort((a, b) => Number(b.rating || b.averageRating || 0) - Number(a.rating || a.averageRating || 0));
    } else if (sortBy === "Duration") {
      filtered = [...filtered].sort(
        (a, b) => parseInt(a.duration || "0") - parseInt(b.duration || "0")
      );
    }

    return filtered;
  }, [activePackagesList, activeCategory, activeLocation, minRating, priceLimit, searchTerm, sortBy]);

  const clearFilters = () => {
    setActiveCategory("All");
    setActiveLocation("All");
    setSearchTerm("");
    setSortBy("Default");
    setPriceLimit([maxPackagePrice]);
    setMinRating([4.0]);
  };

  const hasActiveFilters =
    activeCategory !== "All" ||
    activeLocation !== "All" ||
    searchTerm !== "" ||
    sortBy !== "Default" ||
    priceLimit[0] < maxPackagePrice ||
    minRating[0] > 4.0;

  const filterControls = (
    <div className="space-y-6">
      {/* Top Search & Dropdowns Row */}
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by package name, destination, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 rounded-2xl border-border bg-background pl-11 shadow-sm text-sm focus:border-accent"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-accent pointer-events-none z-10" />
          <select
            value={activeLocation}
            onChange={(e) => setActiveLocation(e.target.value)}
            className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-accent shadow-sm cursor-pointer appearance-none"
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location === "All" ? "All Destinations" : location}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <SlidersHorizontal className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-accent shadow-sm cursor-pointer appearance-none"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                Sort: {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sliders & Action Row */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
        <div className="rounded-2xl border border-border/80 bg-background p-4 shadow-sm">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Budget Limit</span>
            <span className="text-xs font-mono font-extrabold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
              Up to ₹{priceLimit[0].toLocaleString()}
            </span>
          </div>
          <Slider value={priceLimit} min={1000} max={maxPackagePrice} step={500} onValueChange={setPriceLimit} />
        </div>

        <div className="rounded-2xl border border-border/80 bg-background p-4 shadow-sm">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Min Rating</span>
            <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              {minRating[0].toFixed(1)}+ Stars
            </span>
          </div>
          <Slider value={minRating} min={3.5} max={5} step={0.1} onValueChange={setMinRating} />
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="h-12 rounded-2xl border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-bold text-xs gap-1.5 shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Categories Horizontal Selector */}
      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">Categories:</span>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              activeCategory === category
                ? "gradient-accent text-white shadow-md scale-105"
                : "bg-muted text-muted-foreground hover:bg-card hover:text-foreground border border-border/60"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Showcase Header */}
      <section className="pt-24 sm:pt-32 pb-10 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.12),transparent_65%)] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.85fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-extrabold uppercase tracking-widest border border-accent/20 backdrop-blur-md shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-accent" /> Verified Kerala & Global Vacations
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 100% Guaranteed Price
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-foreground tracking-tight leading-tight">
                Discover Extraordinarily <span className="gradient-text">Curated Experiences</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                Explore handpicked Kerala backwater houseboats, tea estate hill resorts, beachfront retreats, and luxury international holidays with complete pricing transparency.
              </p>

              {/* Quick Search Chips */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Trending:</span>
                {quickSearchTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchTerm(tag)}
                    className="rounded-full bg-card border border-border/80 px-3 py-1 text-xs font-semibold text-foreground hover:border-accent hover:text-accent transition-colors shadow-sm"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Metrics Dashboard Glass Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3.5 rounded-3xl border border-border/80 bg-card p-6 shadow-card text-foreground"
            >
              <div className="space-y-1 p-3 rounded-2xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2 text-accent">
                  <Compass className="h-5 w-5" />
                  <span className="text-2xl font-display font-extrabold">{activePackagesList.length}+</span>
                </div>
                <p className="text-xs font-bold text-foreground">Verified Packages</p>
                <p className="text-[11px] text-muted-foreground">Handpicked tour packages</p>
              </div>

              <div className="space-y-1 p-3 rounded-2xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2 text-amber-500">
                  <Star className="h-5 w-5 fill-amber-500" />
                  <span className="text-2xl font-display font-extrabold">4.9 ★</span>
                </div>
                <p className="text-xs font-bold text-foreground">Traveler Rating</p>
                <p className="text-[11px] text-muted-foreground">Verified guest reviews</p>
              </div>

              <div className="space-y-1 p-3 rounded-2xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2 text-emerald-500">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-2xl font-display font-extrabold">100%</span>
                </div>
                <p className="text-xs font-bold text-foreground">Verified Support</p>
                <p className="text-[11px] text-muted-foreground">Local concierge desk</p>
              </div>

              <div className="space-y-1 p-3 rounded-2xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2 text-sky-500">
                  <Award className="h-5 w-5" />
                  <span className="text-2xl font-display font-extrabold">Best Rate</span>
                </div>
                <p className="text-xs font-bold text-foreground">Zero Hidden Fees</p>
                <p className="text-[11px] text-muted-foreground">Instant quotation</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Catalog Content */}
      <main className="container mx-auto px-4 lg:px-8 pb-20 space-y-12">
        {/* Top-Rated Slider */}
        {topRated.length > 0 && (
          <section className="space-y-4">
            <PackageSlider packages={topRated} badge="⭐ Top Rated" title="Highest Rated Experiences" loading={loading} />
          </section>
        )}

        {/* Trending Slider */}
        {popular.length > 0 && (
          <section className="space-y-4">
            <PackageSlider packages={popular} badge="🔥 Popular" title="Trending Packages Right Now" loading={loading} />
          </section>
        )}

        {/* Filter Console & All Packages Catalog */}
        <section className="space-y-6 pt-6 border-t border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Full Travel Directory</span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground tracking-tight">
                Browse All Tour Packages
              </h2>
            </div>

            {/* Mobile Filter Dialog Trigger */}
            <div className="lg:hidden">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full gap-2 font-bold text-xs">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filter Packages ({filteredPackages.length})</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl rounded-3xl border-border bg-card p-6">
                  <DialogHeader className="text-left mb-2">
                    <DialogTitle className="font-display text-2xl font-bold">Package Filters</DialogTitle>
                    <DialogDescription>Adjust your destination, budget limit, and minimum rating.</DialogDescription>
                  </DialogHeader>
                  {filterControls}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Desktop Floating Filter Console */}
          <div className="hidden lg:block rounded-3xl border border-border/80 bg-card p-6 shadow-card">
            {filterControls}
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground font-medium pt-2">
            <p>
              Showing <span className="font-bold text-foreground font-mono">{filteredPackages.length}</span> package
              {filteredPackages.length !== 1 ? "s" : ""} • Budget up to{" "}
              <span className="font-bold text-accent font-mono">₹{priceLimit[0].toLocaleString()}</span> • Rating{" "}
              <span className="font-bold text-amber-500 font-mono">{minRating[0].toFixed(1)}+</span>
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
              >
                Clear Filters ×
              </button>
            )}
          </div>

          {/* Packages Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-[400px] rounded-3xl bg-muted/60 animate-pulse border border-border/40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPackages.map((pkg: any, i: number) => {
                const pkgPricing = getPackagePricing(pkg);
                return (
                  <PackageCard
                    key={pkg.id || pkg._id || i}
                    id={pkg.id || pkg._id}
                    image={pkg.image || pkg.coverImage || "/favicon.png"}
                    title={pkg.title || "Travel Package"}
                    location={pkg.location || "Kerala, India"}
                    price={pkgPricing.price}
                    originalPrice={pkgPricing.listPrice}
                    duration={pkg.duration || "3 Days / 2 Nights"}
                    rating={pkg.rating || 4.8}
                    reviews={pkg.reviews || 24}
                    category={pkg.category || "Holiday"}
                    featured={pkg.featured || pkg.topRated}
                    index={i}
                    description={pkg.description || "Unforgettable guided travel experience with Ababa Holidays."}
                    itinerary={Array.isArray(pkg.itinerary) ? pkg.itinerary : ["Day 1: Arrival & Transfer", "Day 2: Sightseeing & Tour", "Day 3: Departure"]}
                    included={Array.isArray(pkg.included) ? pkg.included : ["Stay", "Breakfast", "Sightseeing"]}
                  />
                );
              })}
            </div>
          )}

          {/* Empty Filter State */}
          {!loading && filteredPackages.length === 0 && (
            <div className="rounded-3xl border border-border/80 bg-card p-12 text-center space-y-4 shadow-sm my-6">
              <div className="w-14 h-14 rounded-full bg-accent/15 text-accent mx-auto flex items-center justify-center">
                <Compass className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">No Packages Match Your Filters</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                We couldn't find any tour packages matching your search criteria. Try expanding your budget slider or clearing specific filters.
              </p>
              <Button onClick={clearFilters} className="rounded-full gradient-accent text-white font-bold text-xs gap-2">
                <RefreshCw className="h-3.5 w-3.5" /> Reset All Filters
              </Button>
            </div>
          )}
        </section>
      </main>

      <PackageCouponsSection />

      <Footer />
    </div>
  );
};

export default PackagesPage;
