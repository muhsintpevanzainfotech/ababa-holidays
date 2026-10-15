import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Compass,
  Headphones,
  Heart,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Phone,
  PhoneCall,
  Search,
  Sparkles,
  Sun,
  User,
  UserPlus,
  X,
  ArrowRight,
  Bus,
  Car,
  Plane,
  Building2,
  Anchor,
  Globe,
  FileCheck,
  Moon as MoonIcon,
  Crown,
  Key,
  Navigation,
  Truck,
  Trees,
  ShieldCheck,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationPanel from "@/components/NotificationPanel";
import { useWishlist } from "@/contexts/WishlistContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { ServiceCategoryItem } from "@/types/travel";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchServicesStart, fetchSubServicesStart } from "@/store/slices/servicesSlice";
import { logout } from "@/store/slices/authSlice";
import { getImageUrl } from "@/lib/imageHelper";
import { useSystemSettings, isAvailable } from "@/hooks/useSystemSettings";
import destKerala from "@/assets/dest-kerala-backwaters.jpg";

const mainLinks = [
  { label: "Service", path: "/services", icon: Briefcase, hasDropdown: true },
  { label: "Packages", path: "/packages", icon: Compass },
  { label: "Partners", path: "/vendors", icon: ShieldCheck },
  { label: "AI Planner", path: "/planner", icon: Sparkles },
  { label: "Blog", path: "/blog", icon: BookOpen },
  { label: "Contact", path: "/contact", icon: PhoneCall },
];

const locationsList = [
  "Use My Location",
  "Kochi, Kerala",
  "Thiruvananthapuram, Kerala",
  "Kozhikode, Kerala",
  "Munnar, Kerala",
  "Wayanad, Kerala",
  "Bengaluru, India",
  "Chennai, India",
  "Mumbai, India",
  "Dubai, UAE",
];

const getIconByName = (name: string) => {
  switch (name) {
    case "Bus":
      return Bus;
    case "Truck":
      return Truck;
    case "Car":
      return Car;
    case "Plane":
      return Plane;
    case "Building2":
      return Building2;
    case "Anchor":
      return Anchor;
    case "Globe":
      return Globe;
    case "FileCheck":
      return FileCheck;
    case "Moon":
      return MoonIcon;
    case "Crown":
      return Crown;
    case "Key":
      return Key;
    case "Navigation":
      return Navigation;
    case "Heart":
      return Heart;
    case "BookOpen":
      return BookOpen;
    case "Trees":
    case "TreeTree":
      return Trees;
    default:
      return Sparkles;
  }
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [mobileServicesExpanded, setMobileServicesExpanded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("Kochi, Kerala");
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { unreadCount } = useNotifications();
  const heroMode = false;

  const dispatch = useAppDispatch();
  const { services: reduxServices, subServices: reduxSubServices } = useAppSelector((state) => state.services);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const isUserLoggedIn = isAuthenticated || Boolean(user) || Boolean(localStorage.getItem("userToken"));

  const { contactDetails, socialLinks } = useSystemSettings();
  const topbarPhone = contactDetails?.primaryPhone || contactDetails?.supportPhone;
  const isPhoneAvailable = isAvailable(topbarPhone);

  const topbarSocials = useMemo(() => {
    const list: Array<{ icon: any; label: string; url: string }> = [];
    if (isAvailable(socialLinks.instagram)) {
      list.push({ icon: Instagram, label: "Instagram", url: socialLinks.instagram! });
    }
    if (isAvailable(socialLinks.facebook)) {
      list.push({ icon: Facebook, label: "Facebook", url: socialLinks.facebook! });
    }
    if (isAvailable(socialLinks.twitter)) {
      list.push({ icon: Twitter, label: "Twitter / X", url: socialLinks.twitter! });
    }
    if (isAvailable(socialLinks.youtube)) {
      list.push({ icon: Youtube, label: "YouTube", url: socialLinks.youtube! });
    }
    if (isAvailable(socialLinks.whatsapp)) {
      list.push({
        icon: MessageCircle,
        label: "WhatsApp",
        url: socialLinks.whatsapp!.startsWith("http")
          ? socialLinks.whatsapp!
          : `https://wa.me/${socialLinks.whatsapp!.replace(/[^0-9]/g, "")}`,
      });
    }
    return list;
  }, [socialLinks]);

  const handleLogout = () => {
    dispatch(logout());
    setAuthOpen(false);
    toast({ title: "Signed Out", description: "You have been logged out safely." });
    navigate("/");
  };

  useEffect(() => {
    dispatch(fetchServicesStart());
    dispatch(fetchSubServicesStart());
  }, [dispatch]);

  const getMediaUrl = (img?: string) => {
    return getImageUrl(img);
  };

  const activeMegaList: ServiceCategoryItem[] =
    Array.isArray(reduxServices) && reduxServices.length > 0
      ? reduxServices.map((srv: any, sIdx: number) => {
          const srvId = String(srv._id || srv.id || `srv-${sIdx}`);
          const srvTitle = String(srv.title || srv.name || "").trim();
          const srvCustomId = String(srv.customId || "").trim();

          const matchingSubs = Array.isArray(reduxSubServices)
            ? reduxSubServices.filter((sub: any) => {
                const parentId = typeof sub.service === "object" && sub.service !== null
                  ? String(sub.service._id || sub.service.id || "")
                  : String(sub.service || "");
                const parentCustomId = typeof sub.service === "object" && sub.service !== null
                  ? String(sub.service.customId || "")
                  : "";
                const parentTitle = typeof sub.service === "object" && sub.service !== null
                  ? String(sub.service.title || sub.service.name || "")
                  : "";

                const subCategory = String(sub.category || "").trim();

                return (
                  (parentId && parentId === srvId) ||
                  (srvCustomId && parentCustomId && parentCustomId === srvCustomId) ||
                  (srvCustomId && parentId === srvCustomId) ||
                  (parentTitle && srvTitle && parentTitle.toLowerCase() === srvTitle.toLowerCase()) ||
                  (subCategory && srvTitle && subCategory.toLowerCase() === srvTitle.toLowerCase())
                );
              })
            : [];

          const finalSubs = matchingSubs.map((sub: any, subIdx: number) => ({
            id: String(sub._id || sub.id || `sub-${subIdx}`),
            name: sub.title || sub.name || "Sub Service Option",
            description: sub.description || sub.tagline || "Verified service booking option",
            badge: sub.customId || sub.badge || "Verified",
            image: getMediaUrl(sub.image || sub.thumbnail || sub.icon || srv.icon || srv.image),
            icon: getMediaUrl(sub.icon || srv.icon),
            iconName: sub.iconName || "Sparkles",
            path: `/services?category=${srvId}&subService=${sub._id || sub.id}`,
          }));

          return {
            id: srvId,
            name: srvTitle || "Travel Service",
            tagline: srv.description || srv.tagline || "Group Excursions & Fleet Rentals",
            image: getMediaUrl(srv.icon || srv.image || srv.thumbnail || srv.coverImage),
            badge: srv.customId || srv.badge || "Verified",
            path: `/services?category=${srvId}`,
            subServices: finalSubs,
          };
        })
      : [];

  const activeCategory = (activeMegaList.length > 0 ? (activeMegaList[activeCategoryIndex] || activeMegaList[0]) : null) as ServiceCategoryItem | null;

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const diff = y - lastScrollY.current;
      setScrolled(y > 16);
      if (y < 80) {
        setNavHidden(false);
      } else if (diff > 8) {
        setNavHidden(true);
      } else if (diff < -8) {
        setNavHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setLocationOpen(false);
    setNotificationOpen(false);
    setAuthOpen(false);
    setServiceDropdownOpen(false);
  }, [location.pathname]);

  const handleMouseEnterService = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setServiceDropdownOpen(true);
  };

  const handleMouseLeaveService = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setServiceDropdownOpen(false);
    }, 200);
  };

  const handleLocationSelect = (selectedLocation: string) => {
    if (selectedLocation === "Use My Location") {
      if (!navigator.geolocation) {
        setCurrentLocation("Location not supported");
        toast({ title: "Location unavailable", description: "Your browser does not support location access." });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          setCurrentLocation("Current Location");
          toast({ title: "Location updated", description: "We will show travel options closest to you." });
        },
        () => {
          setCurrentLocation("Location unavailable");
          toast({ title: "Location denied", description: "Please allow location access or pick a city manually." });
        }
      );
    } else {
      setCurrentLocation(selectedLocation);
    }

    setLocationOpen(false);
  };

  const handleSearchOpen = () => navigate("/search");
  const handleNotifications = () => setNotificationOpen(true);

  const headerSurface = "bg-background/95 text-foreground border-b border-border/60 backdrop-blur-xl shadow-sm";
  const topbarSurface = "bg-slate-900 text-slate-200 border-0 border-none shadow-none";
  const textClass = "text-foreground";
  const iconButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-full border border-current/25 bg-current/10 text-foreground transition-all hover:bg-accent/15 hover:border-accent hover:text-accent shrink-0";

  const hideHeader = navHidden && !mobileOpen;

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hideHeader ? -110 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${headerSurface}`}
      >
        {/* TOPBAR STRIP */}
        <div className={`text-xs transition-colors ${topbarSurface}`}>
          <div className="container mx-auto flex h-9 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLocationOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 font-medium text-slate-200 transition-colors hover:text-white"
                  aria-label="Choose location"
                >
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  <span className="max-w-[148px] truncate sm:max-w-[220px]">{currentLocation}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${locationOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {locationOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setLocationOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute left-0 top-full z-50 mt-2 min-w-[230px] overflow-hidden rounded-2xl border border-border bg-card shadow-card text-foreground"
                      >
                        {locationsList.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleLocationSelect(item)}
                            className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-muted ${
                              item === "Use My Location" ? "font-semibold text-accent" : "text-foreground"
                            }`}
                          >
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>{item}</span>
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {isPhoneAvailable ? (
                <a
                  href={`tel:${topbarPhone!.replace(/\s+/g, "")}`}
                  className="hidden items-center gap-1.5 text-slate-300 transition-colors hover:text-white sm:flex"
                >
                  <span className="text-slate-600">|</span>
                  <Phone className="h-3 w-3 text-accent" />
                  <span>{topbarPhone}</span>
                </a>
              ) : (
                <span className="hidden items-center gap-1.5 text-slate-400 sm:flex">
                  <span className="text-slate-600">|</span>
                  <Phone className="h-3 w-3 text-slate-500" />
                  <span className="text-[11px] italic text-slate-400">Not available</span>
                </span>
              )}

              {/* Official Social Media Links in Topbar */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-slate-600">|</span>
                {topbarSocials.length > 0 ? (
                  topbarSocials.map((s) => {
                    const Icon = s.icon;
                    return (
                      <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="text-slate-400 transition-colors hover:text-accent"
                      >
                        <Icon className="h-3 w-3" />
                      </a>
                    );
                  })
                ) : (
                  <span className="text-[10px] text-slate-500 italic">Social: Not available</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-300">
              <Link
                to="/vendor-register"
                className="hidden sm:inline-flex items-center gap-1.5 text-accent hover:text-white font-semibold text-[11px] transition-colors"
              >
                <Building2 className="h-3 w-3" />
                <span>Become a Partner</span>
              </Link>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="hidden items-center gap-1.5 sm:flex">
                <Headphones className="h-3 w-3 text-accent" />
                <span>24/7 Booking Support</span>
              </span>
              <span className="hidden text-slate-600 sm:inline">|</span>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/20 hover:text-white"
              >
                {theme === "dark" ? <Sun className="h-3 w-3 text-accent" /> : <Moon className="h-3 w-3 text-accent" />}
                <span>{theme === "dark" ? "Light" : "Dark"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN NAVBAR */}
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex min-h-[3.75rem] items-center justify-between gap-3 py-1.5">
            <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="dotravels home">
              <img
                src="/favicon.png"
                alt="dotravels Logo"
                width={36}
                height={36}
                style={{ width: "36px", height: "36px", minWidth: "36px", minHeight: "36px", maxWidth: "36px", maxHeight: "36px", objectFit: "contain" }}
                className="shrink-0 rounded-xl shadow-sm"
              />
              <span className={`font-display text-lg font-bold tracking-tight ${textClass}`}>dotravels</span>
            </Link>

            {/* DESKTOP NAV LINKS WITH SERVICE MEGA DROPDOWN */}
            <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
              <div className="flex flex-nowrap items-center justify-center gap-1 xl:gap-1.5">
                {mainLinks.map((link) => {
                  const active = location.pathname === link.path;
                  const Icon = link.icon;

                  if (link.hasDropdown) {
                    return (
                      <div
                        key={link.label}
                        className="relative"
                        onMouseEnter={handleMouseEnterService}
                        onMouseLeave={handleMouseLeaveService}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setServiceDropdownOpen((prev) => !prev);
                          }}
                          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all xl:px-4 xl:py-2 xl:text-sm ${
                            active || serviceDropdownOpen
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : `${textClass} hover:bg-muted hover:text-foreground`
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{link.label}</span>
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform duration-200 ${
                              serviceDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* DESKTOP MEGA DROPDOWN PANEL */}
                        <AnimatePresence>
                          {serviceDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 12, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.98 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-2 w-[880px] max-w-[94vw] overflow-hidden rounded-3xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-2xl text-foreground select-none before:absolute before:-top-4 before:inset-x-0 before:h-5"
                            >
                              {activeMegaList.length === 0 || !activeCategory ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                                  <h4 className="font-display text-base font-bold text-foreground">Our Travel Services</h4>
                                  <p className="text-xs text-muted-foreground max-w-sm">
                                    Discover bespoke holiday packages, tourist buses, and luxury transport options.
                                  </p>
                                  <Link
                                    to="/services"
                                    onClick={() => setServiceDropdownOpen(false)}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                                  >
                                    <span>Browse All Services</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              ) : (
                                <div className="flex items-stretch gap-5">
                                  {/* LEFT SIDE: MAIN SERVICE CATEGORIES TABS */}
                                  <div className="w-[34%] shrink-0 space-y-1 rounded-2xl bg-muted/50 p-2.5 border border-border/50 max-h-[440px] overflow-y-auto">
                                    <div className="px-3 py-2 border-b border-border/60 mb-1">
                                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Our Travel Services
                                      </p>
                                      <p className="text-xs font-semibold text-foreground">Select a Category</p>
                                    </div>

                                    <div className="space-y-1">
                                      {activeMegaList.map((cat, idx) => {
                                        const isSelected = activeCategoryIndex === idx;
                                        return (
                                          <button
                                            key={cat.id}
                                            type="button"
                                            onMouseEnter={() => setActiveCategoryIndex(idx)}
                                            onClick={() => {
                                              setActiveCategoryIndex(idx);
                                              navigate(cat.path);
                                              setServiceDropdownOpen(false);
                                            }}
                                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${
                                              isSelected
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "text-foreground hover:bg-card hover:shadow-sm"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                              <div
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden border ${
                                                  isSelected
                                                    ? "border-white/40 shadow-sm"
                                                    : "border-border/60"
                                                }`}
                                              >
                                                <img
                                                  src={cat.image || "/favicon.png"}
                                                  alt={cat.name}
                                                  onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/favicon.png";
                                                  }}
                                                  className="h-full w-full object-cover"
                                                />
                                              </div>
                                              <div className="min-w-0">
                                                <p className="truncate text-xs font-bold leading-tight">
                                                  {cat.name}
                                                </p>
                                                <p
                                                  className={`truncate text-[10px] font-medium ${
                                                    isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                                                  }`}
                                                >
                                                  {cat.subServices && cat.subServices.length > 0
                                                    ? `${cat.subServices.length} ${cat.subServices.length === 1 ? "Sub-Service" : "Sub-Services"}`
                                                    : "Not Available"}
                                                </p>
                                              </div>
                                            </div>
                                            <ChevronRight
                                              className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                                                isSelected ? "translate-x-0.5 text-white" : "text-muted-foreground"
                                              }`}
                                            />
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* RIGHT SIDE: SUB-SERVICES SHOWCASE GRID */}
                                  <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                                    <div>
                                      {/* CATEGORY HEADER */}
                                      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="h-10 w-10 overflow-hidden rounded-xl border border-border shadow-sm shrink-0">
                                            <img
                                              src={activeCategory?.image || "/favicon.png"}
                                              alt={activeCategory?.name || "Service"}
                                              onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/favicon.png";
                                              }}
                                              className="h-full w-full object-cover"
                                            />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <h4 className="font-display text-base font-bold text-foreground truncate">
                                                {activeCategory?.name}
                                              </h4>
                                              {activeCategory?.badge && (
                                                <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent shrink-0">
                                                  {activeCategory.badge}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                              {activeCategory?.tagline}
                                            </p>
                                          </div>
                                        </div>

                                        <Link
                                          to={activeCategory?.path || "/services"}
                                          onClick={() => setServiceDropdownOpen(false)}
                                          className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors shrink-0 ml-2"
                                        >
                                          <span>View All</span>
                                          <ArrowRight className="h-3 w-3" />
                                        </Link>
                                      </div>

                                      {/* SUB-SERVICES GRID: ONLY TITLE & ICON */}
                                      {!activeCategory?.subServices || activeCategory.subServices.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/80 bg-muted/20 text-center space-y-2 my-2">
                                          <Sparkles className="h-7 w-7 text-muted-foreground/50" />
                                          <p className="text-xs font-bold text-foreground">Not Available</p>
                                          <p className="text-[11px] text-muted-foreground">No sub-services currently listed for this service category.</p>
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1">
                                          {activeCategory.subServices.map((sub) => {
                                            return (
                                              <Link
                                                key={sub.id}
                                                to={sub.path}
                                                onClick={() => setServiceDropdownOpen(false)}
                                                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/90 p-2.5 shadow-sm transition-all duration-200 hover:border-primary/50 hover:bg-muted/80 hover:shadow-md"
                                              >
                                                {/* SUB SERVICE ICON */}
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/60 text-foreground overflow-hidden group-hover:border-primary/60 group-hover:bg-primary/10 transition-colors">
                                                  <img
                                                    src={sub.icon || sub.image || "/favicon.png"}
                                                    alt=""
                                                    onError={(e) => {
                                                      (e.target as HTMLImageElement).src = "/favicon.png";
                                                    }}
                                                    className="h-5 w-5 object-contain transition-transform duration-300 group-hover:scale-110"
                                                  />
                                                </div>

                                                {/* SUB SERVICE TITLE */}
                                                <div className="min-w-0 flex-1">
                                                  <p className="font-display text-xs font-semibold text-foreground transition-colors group-hover:text-primary truncate">
                                                    {sub.name}
                                                  </p>
                                                </div>

                                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary shrink-0" />
                                              </Link>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    {/* FOOTER CALLOUT BAR */}
                                    <div className="rounded-xl gradient-accent p-3 text-accent-foreground flex items-center justify-between gap-3 shadow-md">
                                      <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 shrink-0 text-accent-foreground animate-pulse" />
                                        <span className="text-xs font-bold">
                                          Need a custom itinerary or group transport?
                                        </span>
                                      </div>
                                      <Link
                                        to="/planner"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setServiceDropdownOpen(false)}
                                        className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white hover:bg-white/30 transition-colors shrink-0"
                                      >
                                        Launch AI Planner →
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      target={link.path === "/planner" ? "_blank" : undefined}
                      rel={link.path === "/planner" ? "noopener noreferrer" : undefined}
                      className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all xl:px-4 xl:py-2 xl:text-sm ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : `${textClass} hover:bg-muted hover:text-foreground`
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <button
                type="button"
                aria-label="Search travel options"
                onClick={handleSearchOpen}
                className={iconButtonClass}
              >
                <Search className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                aria-label="Notifications"
                onClick={handleNotifications}
                className={`relative ${iconButtonClass}`}
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground shadow-sm animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className={`relative ${iconButtonClass}`}
              >
                <Heart className="h-4.5 w-4.5" />
                {items.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {items.length}
                  </span>
                )}
              </Link>
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setAuthOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full p-0.5 text-foreground transition-all hover:opacity-90"
                  aria-label="User account options"
                >
                  {isUserLoggedIn ? (
                    <div className="relative">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-sm shadow-md shrink-0 border-2 border-background">
                        {(user?.name?.[0] || "U").toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-current/25 bg-current/10 shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                  )}

                  <div className="text-left leading-tight hidden sm:block pr-1">
                    <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {isUserLoggedIn ? "Account" : "Welcome"}
                    </span>
                    <span className="flex items-center gap-1 font-display text-xs font-bold tracking-tight">
                      {isUserLoggedIn ? `Hi, ${user?.name?.split(" ")[0] || "Traveler"}` : "Login / Register"}
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${authOpen ? "rotate-180" : ""}`} />
                    </span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 sm:hidden transition-transform duration-200 ${authOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {authOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setAuthOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full z-50 mt-2 min-w-[250px] overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-card text-foreground"
                      >
                        {isUserLoggedIn ? (
                          <>
                            <div className="px-3 py-3 border-b border-border/60 bg-accent/5 rounded-t-xl mb-1 flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-base shadow-sm shrink-0">
                                {(user?.name?.[0] || "U").toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-foreground truncate">{user?.name || "Valued Traveler"}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{user?.email || "traveler@ababatravels.com"}</p>
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[9px] font-bold">
                                  ✓ Verified Account
                                </span>
                              </div>
                            </div>

                            <Link
                              to="/dashboard"
                              onClick={() => setAuthOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                            >
                              <User className="h-4 w-4 text-accent shrink-0" />
                              <div>
                                <span className="block font-semibold leading-snug">My Dashboard</span>
                                <span className="block text-[11px] text-muted-foreground">Manage trips & bookings</span>
                              </div>
                            </Link>

                            <Link
                              to="/wishlist"
                              onClick={() => setAuthOpen(false)}
                              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                            >
                              <div className="flex items-center gap-3">
                                <Heart className="h-4 w-4 text-accent shrink-0" />
                                <div>
                                  <span className="block font-semibold leading-snug">Saved Wishlist</span>
                                  <span className="block text-[11px] text-muted-foreground">Your saved packages</span>
                                </div>
                              </div>
                              {items.length > 0 && (
                                <span className="rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[10px] font-bold">
                                  {items.length}
                                </span>
                              )}
                            </Link>

                            <div className="my-1 border-t border-border/60" />

                            <button
                              type="button"
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                            >
                              <LogOut className="h-4 w-4 text-destructive shrink-0" />
                              <span>Sign Out</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="px-3 py-2 border-b border-border/60 bg-muted/40 rounded-t-xl mb-1">
                              <p className="text-xs font-bold text-foreground">Account & Access</p>
                              <p className="text-[11px] text-muted-foreground">Sign in to manage bookings</p>
                            </div>

                            <Link
                              to="/login"
                              onClick={() => setAuthOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent shrink-0">
                                <LogIn className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="block font-semibold leading-snug">Sign In</span>
                                <span className="block text-[11px] text-muted-foreground">Access saved trips</span>
                              </div>
                            </Link>

                            <Link
                              to="/register"
                              onClick={() => setAuthOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
                                <UserPlus className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="block font-semibold leading-snug">Create Account</span>
                                <span className="block text-[11px] text-muted-foreground">Register as new traveler</span>
                              </div>
                            </Link>

                            <div className="my-1 border-t border-border/60" />

                            <Link
                              to="/dashboard"
                              onClick={() => setAuthOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                              <User className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span>My Dashboard</span>
                            </Link>

                            <Link
                              to="/wishlist"
                              onClick={() => setAuthOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                              <Heart className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span>Saved Wishlist</span>
                            </Link>
                          </>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* MOBILE MENU CONTROLS */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={iconButtonClass}
              >
                {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-accent" /> : <Moon className="h-4.5 w-4.5" />}
              </button>
              <button
                type="button"
                onClick={handleSearchOpen}
                aria-label="Search"
                className={iconButtonClass}
              >
                <Search className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={handleNotifications}
                aria-label="Notifications"
                className={`relative ${iconButtonClass}`}
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground shadow-sm animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className={`relative ${iconButtonClass}`}
              >
                <Heart className="h-4.5 w-4.5" />
                {items.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {items.length}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Toggle menu"
                className={iconButtonClass}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER ACCORDION FOR SERVICES & SUB-SERVICES */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-border bg-background/95 lg:hidden"
            >
              <div className="container mx-auto space-y-3 px-4 py-4 lg:px-8 text-foreground select-none">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={handleSearchOpen}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm font-medium text-foreground"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={handleNotifications}
                    className="relative flex items-center justify-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                  >
                    <Bell className="h-4 w-4 text-accent" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground shadow-sm">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  <Link
                    to="/wishlist"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm font-medium text-foreground"
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </Link>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm font-medium text-foreground"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    Theme
                  </button>
                </div>

                <div className="rounded-3xl surface-panel p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Browse services
                  </p>
                  <div className="space-y-1">
                    {/* ACCORDION SERVICE WITH SUB-SERVICES */}
                    <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setMobileServicesExpanded((prev) => !prev)}
                        className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-foreground"
                      >
                        <div className="flex items-center gap-2.5">
                          <Briefcase className="h-4 w-4 text-accent" />
                          <span>All Services & Sub-Services</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${
                            mobileServicesExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {mobileServicesExpanded && (
                        <div className="border-t border-border/60 p-2 space-y-3 bg-muted/30">
                          {activeMegaList.map((cat) => (
                            <div key={cat.id} className="space-y-1.5">
                              <Link
                                to={cat.path}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-between px-2 py-1 text-xs font-bold text-primary"
                              >
                                <div className="flex items-center gap-2">
                                  <img
                                    src={cat.image || "/favicon.png"}
                                    alt=""
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/favicon.png";
                                    }}
                                    className="h-5 w-5 rounded-md object-cover"
                                  />
                                  <span>{cat.name}</span>
                                </div>
                                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-bold text-accent">
                                  {cat.subServices.length > 0 ? `${cat.subServices.length} options` : "Not Available"}
                                </span>
                              </Link>

                              {cat.subServices.length === 0 ? (
                                <div className="pl-7 py-1.5 text-xs text-muted-foreground italic">
                                  Not Available (No sub-services)
                                </div>
                              ) : (
                                <div className="pl-7 space-y-1">
                                  {cat.subServices.map((sub) => {
                                    return (
                                      <Link
                                        key={sub.id}
                                        to={sub.path}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2.5 rounded-xl bg-card p-2 text-xs text-foreground shadow-sm hover:bg-muted transition-colors"
                                      >
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/60 overflow-hidden bg-muted/40">
                                          <img
                                            src={sub.icon || sub.image || "/favicon.png"}
                                            alt=""
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = "/favicon.png";
                                            }}
                                            className="h-4 w-4 object-contain"
                                          />
                                        </div>
                                        <span className="truncate font-semibold text-xs flex-1">{sub.name}</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {mainLinks
                      .filter((l) => !l.hasDropdown)
                      .map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.label}
                            to={link.path}
                            target={link.path === "/planner" ? "_blank" : undefined}
                            rel={link.path === "/planner" ? "noopener noreferrer" : undefined}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                              location.pathname === link.path
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0 text-accent" />
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login">
                    <Button variant="outline" className="w-full rounded-full gap-2">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="w-full rounded-full gap-2 border-0 bg-accent text-accent-foreground hover:bg-accent/90">
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                </div>

                {/* Mobile Official Contact & Socials Bar */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-accent" />
                    {isPhoneAvailable ? (
                      <a href={`tel:${topbarPhone!.replace(/\s+/g, "")}`} className="font-semibold text-foreground hover:text-accent">
                        {topbarPhone}
                      </a>
                    ) : (
                      <span className="italic text-muted-foreground">Not available</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {topbarSocials.length > 0 ? (
                      topbarSocials.map((s) => {
                        const Icon = s.icon;
                        return (
                          <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent">
                            <Icon className="h-3.5 w-3.5" />
                          </a>
                        );
                      })
                    ) : (
                      <span className="text-[10px] italic">Not available</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <NotificationPanel open={notificationOpen} onOpenChange={setNotificationOpen} />
    </>
  );
};

export default Navbar;
