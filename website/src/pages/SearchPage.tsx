import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  MapPin,
  Tag,
  ArrowRight,
  Compass,
  Briefcase,
  Layers,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store";
import { performSearchStart } from "@/store/slices/searchSlice";
import { getServicesApi, getPackagesApi } from "@/api/endpoints";

type FilterTab = "all" | "packages" | "services";
type SortOption = "relevance" | "price-asc" | "price-desc";

const POPULAR_SEARCHES = [
  "Kerala Backwaters",
  "Munnar",
  "Wayanad",
  "Houseboat",
  "Honey Moon",
  "Ayurveda",
  "International",
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  // Dynamic API state
  const [apiPackages, setApiPackages] = useState<any[]>([]);
  const [apiServices, setApiServices] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  const dispatch = useAppDispatch();
  const { searchResults, loading: reduxLoading } = useAppSelector((state) => state.search);

  // Sync state with URL params
  useEffect(() => {
    const qFromUrl = searchParams.get("q") || "";
    if (qFromUrl !== query) {
      setQuery(qFromUrl);
    }
  }, [searchParams]);

  // Update URL params when query changes
  const updateQueryParam = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.trim()) {
      setSearchParams({ q: newQuery });
    } else {
      setSearchParams({});
    }
  };

  // Dispatch Redux search and fetch real-time backend data
  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      setApiLoading(true);
      try {
        const [pkgs, srvs] = await Promise.all([
          getPackagesApi({ search: query }),
          getServicesApi(),
        ]);
        if (isSubscribed) {
          setApiPackages(Array.isArray(pkgs) ? pkgs : []);
          setApiServices(Array.isArray(srvs) ? srvs : []);
        }
      } catch {
        if (isSubscribed) {
          setApiPackages([]);
          setApiServices([]);
        }
      } finally {
        if (isSubscribed) setApiLoading(false);
      }
    };

    if (query.trim()) {
      dispatch(performSearchStart(query));
    }
    fetchData();

    return () => {
      isSubscribed = false;
    };
  }, [query, dispatch]);

  // Package results dynamically from API
  const filteredPackages = useMemo(() => {
    const packageList = Array.isArray(apiPackages) ? apiPackages : [];

    if (!query.trim()) return packageList;
    const q = query.toLowerCase();

    let list = packageList.filter((p) => {
      const title = (p.title || p.name || "").toLowerCase();
      const loc = (p.location || p.destination || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      return title.includes(q) || loc.includes(q) || cat.includes(q) || desc.includes(q);
    });

    // Sorting logic
    if (sortBy === "price-asc") {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    return list;
  }, [query, apiPackages, sortBy]);

  // Service results dynamically from API
  const filteredServices = useMemo(() => {
    const serviceList = Array.isArray(apiServices) ? apiServices : [];

    if (!query.trim()) return serviceList;
    const q = query.toLowerCase();

    return serviceList.filter((s) => {
      const title = (s.title || s.name || "").toLowerCase();
      const desc = (s.description || "").toLowerCase();
      const subs = Array.isArray(s.subs)
        ? s.subs.some((sub: any) => (sub.name || sub.title || "").toLowerCase().includes(q))
        : false;
      return title.includes(q) || desc.includes(q) || subs;
    });
  }, [query, apiServices]);

  const totalResults = filteredPackages.length + filteredServices.length;
  const isLoading = apiLoading || reduxLoading;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      {/* Hero Search Header */}
      <section className="relative pt-28 md:pt-36 pb-12 md:pb-16 bg-gradient-to-b from-card via-background to-background border-b border-border/60 overflow-hidden">
        {/* Ambient Blur Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[350px] h-[250px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Kerala & Worldwide Destinations</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-extrabold text-foreground tracking-tight mb-6">
              Search Travel Experiences
            </h1>

            {/* Main Search Input Box */}
            <div className="relative shadow-2xl rounded-3xl bg-card border border-border/80 p-2 sm:p-2.5 flex items-center gap-2 transition-all focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15">
              <div className="pl-3.5 flex items-center text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>

              <Input
                type="text"
                value={query}
                onChange={(e) => updateQueryParam(e.target.value)}
                placeholder="Search by destination (Munnar, Wayanad), service, or package name..."
                className="border-0 bg-transparent shadow-none h-11 md:h-13 text-sm sm:text-base focus-visible:ring-0 placeholder:text-muted-foreground/70"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => updateQueryParam("")}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <Button
                type="button"
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl h-11 md:h-12 px-5 sm:px-7 font-bold text-xs sm:text-sm shrink-0 gap-2 shadow-md shadow-accent/20"
              >
                <Search className="w-4 h-4 hidden sm:block" />
                Search
              </Button>
            </div>

            {/* Popular Quick Pills */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-accent" /> Popular:
              </span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => updateQueryParam(term)}
                  className={`px-3 py-1 rounded-full border transition-all ${
                    query.toLowerCase() === term.toLowerCase()
                      ? "bg-accent text-accent-foreground border-accent font-semibold shadow-sm"
                      : "bg-card/80 border-border/70 text-muted-foreground hover:text-foreground hover:border-accent/40"
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>

            <p className="text-muted-foreground text-xs sm:text-sm mt-4 font-medium">
              {isLoading ? (
                <span className="inline-flex items-center gap-2 text-accent">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  Searching real-time database...
                </span>
              ) : query.trim() ? (
                <>Found <strong className="text-foreground font-bold">{totalResults}</strong> matching result{totalResults !== 1 ? "s" : ""} for "<span className="text-accent font-semibold">{query}</span>"</>
              ) : (
                <>Showing all <strong className="text-foreground font-bold">{totalResults}</strong> available experiences</>
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Results Container */}
      <main className="flex-1 py-10 md:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Controls Bar: Filter Tabs & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-border/60">
            {/* Filter Pills */}
            <div className="flex items-center bg-muted/70 p-1 rounded-2xl border border-border/40 overflow-x-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "all"
                    ? "bg-background text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-accent" />
                All ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab("packages")}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "packages"
                    ? "bg-background text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-accent" />
                Packages ({filteredPackages.length})
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "services"
                    ? "bg-background text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-accent" />
                Services ({filteredServices.length})
              </button>
            </div>

            {/* Sort Control */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-card border border-border/80 text-foreground text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-accent"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* 1. SERVICES SECTION */}
          {(activeTab === "all" || activeTab === "services") && filteredServices.length > 0 && (
            <div className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-display font-bold text-foreground">
                      Services & Experiences
                    </h2>
                    <p className="text-xs text-muted-foreground">Tailored travel services offered by Ababa Holidays</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                  {filteredServices.length} Found
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredServices.map((service, i) => {
                  const sImg = service.image || service.coverImage || service.iconImage || "/favicon.png";
                  const subCount = Array.isArray(service.subs) ? service.subs.length : (service.subServicesCount || 0);

                  return (
                    <motion.div
                      key={service.slug || service.id || i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={`/services/${service.slug || service.id}`}
                        className="group block bg-card rounded-2xl overflow-hidden border border-border/80 hover:border-accent/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
                      >
                        <div className="relative h-40 overflow-hidden bg-muted">
                          <img
                            src={sImg}
                            alt={service.title || service.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/favicon.png";
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          {subCount > 0 && (
                            <span className="absolute top-3 right-3 bg-background/90 backdrop-blur-md text-foreground font-bold text-[10px] px-2.5 py-1 rounded-full border border-border/60 shadow-sm">
                              {subCount} Sub-Services
                            </span>
                          )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-display font-bold text-foreground text-sm group-hover:text-accent transition-colors line-clamp-1 mb-1">
                              {service.title || service.name}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {service.description || "Comprehensive travel service designed to deliver exceptional experiences."}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-accent">
                            <span>Explore Details</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. PACKAGES SECTION */}
          {(activeTab === "all" || activeTab === "packages") && filteredPackages.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-display font-bold text-foreground">
                      Holiday & Tour Packages
                    </h2>
                    <p className="text-xs text-muted-foreground">Handpicked tour itineraries with guide, stay & transport</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                  {filteredPackages.length} Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPackages.map((pkg, i) => (
                  <PackageCard key={pkg.id || pkg._id || i} {...pkg} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* 3. NO RESULTS EMPTY STATE */}
          {totalResults === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto py-16 text-center bg-card/50 backdrop-blur-md rounded-3xl border border-border/80 p-8 shadow-card"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-2">No exact matches found</h2>
              <p className="text-muted-foreground text-xs sm:text-sm mb-6 leading-relaxed">
                We couldn't find any packages or services matching "<span className="text-foreground font-semibold">{query}</span>". Try searching for popular Kerala destinations like Munnar or Wayanad.
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {POPULAR_SEARCHES.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateQueryParam(p)}
                    className="px-3 py-1.5 rounded-xl bg-accent/10 text-accent text-xs font-semibold hover:bg-accent hover:text-accent-foreground transition-all"
                  >
                    Search "{p}"
                  </button>
                ))}
              </div>

              <Link to="/packages">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-bold text-xs gap-2 px-6">
                  Browse All Packages
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
