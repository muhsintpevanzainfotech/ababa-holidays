import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
  ShieldCheck,
  CreditCard,
  Headphones,
  ArrowUp,
  ArrowRight,
  Send,
  Sparkles,
  MessageCircle,
  Award,
  CheckCircle2,
  Lock,
  Building2,
  Link2,
  Linkedin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchServicesStart } from "@/store/slices/servicesSlice";
import { getServicesApi } from "@/api/endpoints";
import { useSystemSettings, isAvailable } from "@/hooks/useSystemSettings";

const fallbackServiceLinks = [
  { label: "Tour Packages", path: "/services?category=Tour+Packages", id: "s-1" },
  { label: "Hotel & Resort Booking", path: "/services?category=Hotel+%26+Resourt", id: "s-2" },
  { label: "Tourist Bus Rentals", path: "/services?category=Tourist+Bus+Booking", id: "s-3" },
  { label: "Wedding Trip Logistics", path: "/services?category=Wedding+Trip+Booking", id: "s-4" },
  { label: "Transport & Cabs", path: "/services?category=Transport+Booking", id: "s-5" },
  { label: "Hajj & Umrah Packages", path: "/services?category=Hajj+%26+Umrah+Packages", id: "s-6" },
  { label: "Flight Tickets & Visas", path: "/services?category=Ticket+%26+Visa+Services", id: "s-7" },
];

const quickLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "AI Smart Trip Planner", path: "/planner" },
  { label: "Service", path: "/services" },
  { label: "Packages", path: "/packages" },
  { label: "Contact", path: "/contact" },
  { label: "Terms & Conditions", path: "/terms" },
  { label: "Refund & Cancellation", path: "/refund" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Partner Terms", path: "/terms?target=Vendor" },
];

const companyLinks = [
  { label: "About dotravels", path: "/about" },
  { label: "AI Smart Trip Planner", path: "/planner" },
  { label: "Verified Travel Partners", path: "/vendors" },
  { label: "Travel Stories & Blog", path: "/blog" },
  { label: "Saved Wishlist", path: "/wishlist" },
  { label: "Customer Reviews", path: "/#testimonials" },
  { label: "Terms & Conditions", path: "/terms" },
  { label: "Refund & Cancellation", path: "/refund" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Partner Terms & SLA", path: "/terms?target=Vendor" },
];




const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [apiServices, setApiServices] = useState<any[]>([]);
  const { toast } = useToast();

  const dispatch = useAppDispatch();
  const { services: reduxServices } = useAppSelector(
    (state) => state.services
  );

  const { contactDetails, socialLinks: systemSocials } = useSystemSettings();

  const activeSocialList = useMemo(() => {
    const list: Array<{ icon: any; label: string; href: string; hoverColor: string }> = [];
    if (isAvailable(systemSocials.instagram)) {
      list.push({ icon: Instagram, label: "Instagram", href: systemSocials.instagram!, hoverColor: "hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white" });
    }
    if (isAvailable(systemSocials.facebook)) {
      list.push({ icon: Facebook, label: "Facebook", href: systemSocials.facebook!, hoverColor: "hover:bg-blue-600 hover:text-white" });
    }
    if (isAvailable(systemSocials.twitter)) {
      list.push({ icon: Twitter, label: "Twitter / X", href: systemSocials.twitter!, hoverColor: "hover:bg-slate-800 hover:text-white" });
    }
    if (isAvailable(systemSocials.youtube)) {
      list.push({ icon: Youtube, label: "YouTube", href: systemSocials.youtube!, hoverColor: "hover:bg-red-600 hover:text-white" });
    }
    if (isAvailable(systemSocials.whatsapp)) {
      list.push({ icon: MessageCircle, label: "WhatsApp", href: systemSocials.whatsapp!.startsWith("http") ? systemSocials.whatsapp! : `https://wa.me/${systemSocials.whatsapp!.replace(/[^0-9]/g, "")}`, hoverColor: "hover:bg-emerald-600 hover:text-white" });
    }
    if (isAvailable(systemSocials.linkedin)) {
      list.push({ icon: Linkedin, label: "LinkedIn", href: systemSocials.linkedin!, hoverColor: "hover:bg-sky-600 hover:text-white" });
    }
    if (Array.isArray(systemSocials.customLinks)) {
      systemSocials.customLinks.forEach((c) => {
        if (isAvailable(c.url)) {
          list.push({ icon: Link2, label: c.title || "Custom", href: c.url, hoverColor: "hover:bg-indigo-600 hover:text-white" });
        }
      });
    }
    return list;
  }, [systemSocials]);

  // Support details availability
  const isWhatsappAvailable = isAvailable(systemSocials.whatsapp) || isAvailable(contactDetails.supportPhone) || isAvailable(contactDetails.primaryPhone);
  const whatsappNumber = isAvailable(contactDetails.supportPhone)
    ? contactDetails.supportPhone!
    : isAvailable(contactDetails.primaryPhone)
    ? contactDetails.primaryPhone!
    : isAvailable(systemSocials.whatsapp)
    ? systemSocials.whatsapp!
    : "Not available";
  const whatsappUrl = isAvailable(systemSocials.whatsapp) && systemSocials.whatsapp!.startsWith("http")
    ? systemSocials.whatsapp!
    : isAvailable(contactDetails.supportPhone || contactDetails.primaryPhone)
    ? `https://wa.me/${(contactDetails.supportPhone || contactDetails.primaryPhone)!.replace(/[^0-9]/g, "")}`
    : "#";

  const directPhone = contactDetails.primaryPhone || contactDetails.supportPhone;
  const isPhoneAvailable = isAvailable(directPhone);

  const officialEmail = contactDetails.primaryEmail || contactDetails.supportEmail;
  const isEmailAvailable = isAvailable(officialEmail);

  const officialAddress = contactDetails.address;
  const isAddressAvailable = isAvailable(officialAddress);

  // Fetch services from Redux and direct API on mount
  useEffect(() => {
    if (!reduxServices || reduxServices.length === 0) {
      dispatch(fetchServicesStart());
    }
  }, [dispatch, reduxServices]);

  useEffect(() => {
    let isMounted = true;
    const loadServices = async () => {
      try {
        const rawServices = await getServicesApi();
        if (isMounted && Array.isArray(rawServices) && rawServices.length > 0) {
          setApiServices(rawServices);
        }
      } catch {
        // Fallback gracefully to default links
      }
    };

    if (!reduxServices || reduxServices.length === 0) {
      loadServices();
    }

    return () => {
      isMounted = false;
    };
  }, [reduxServices]);

  // Compute active dynamic services list from API
  const activeServices = useMemo(() => {
    const list = reduxServices && reduxServices.length > 0 ? reduxServices : apiServices;
    if (Array.isArray(list) && list.length > 0) {
      const active = list.filter((s: any) => s.isActive !== false);
      if (active.length > 0) {
        return active.map((s: any, idx: number) => ({
          label: s.title || s.name || `Service ${idx + 1}`,
          path: `/services?category=${encodeURIComponent(s.title || s.name)}`,
          id: s._id || s.customId || `service-${idx}`,
        }));
      }
    }
    return fallbackServiceLinks;
  }, [reduxServices, apiServices]);



  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail("");
      toast({
        title: "Welcome to dotravels VIP Club! 🎉",
        description: "You've successfully subscribed to our secret travel deals and seasonal discounts.",
      });
    }, 600);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-slate-950 text-slate-300 overflow-hidden select-none border-t border-slate-900">
      {/* BACKGROUND AMBIENT GLOW MESH */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 translate-x-1/3 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* TOP VIP NEWSLETTER & AI PLANNER CALLOUT BANNER */}
        <div className="pt-10 pb-12 border-b border-slate-800/80">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/80 border border-slate-800/90 p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl">
            {/* Subtle Gradient Ring Accent */}
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-accent/15 rounded-full blur-2xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left text */}
              <div className="lg:col-span-7 space-y-2.5">
                <Link
                  to="/vendor-register"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider hover:bg-accent/25 hover:border-accent/50 transition-all duration-200 group"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Become A Partner</span>
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Get exclusive discounts & customized holiday plans
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                  Join 45,000+ travelers receiving weekly flash sales, verified Kerala itinerary guides, and VIP bus rental perks directly to their inbox.
                </p>
              </div>

              {/* Right Newsletter Form */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <form onSubmit={handleSubscribe} className="relative flex items-center">
                  <div className="relative w-full">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="w-full rounded-full bg-slate-950/80 border border-slate-700/80 pl-11 pr-32 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-inner"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full gradient-accent px-4 sm:px-5 py-2 text-xs font-bold text-accent-foreground shadow-md transition-all hover:opacity-95 hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <span>{isSubscribing ? "Joining..." : "Subscribe"}</span>
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
                <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400 px-2">
                  <Lock className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span>We protect your privacy. Zero spam. Unsubscribe anytime.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN 5-COLUMN FOOTER NAVIGATION & DIRECTORY */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 py-12 border-b border-slate-800/80">
          {/* COL 1: BRAND IDENTITY & REPUTATION (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group" aria-label="dotravels home">
              <div className="relative">
                <img
                  src="/favicon.png"
                  alt="dotravels Logo"
                  width={42}
                  height={42}
                  style={{ width: "42px", height: "42px", minWidth: "42px", minHeight: "42px", maxWidth: "42px", maxHeight: "42px", objectFit: "contain" }}
                  className="shrink-0 rounded-2xl shadow-lg border border-slate-800 transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-950">
                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                </span>
              </div>
              <div>
                <span className="font-display text-2xl font-bold text-white tracking-tight leading-none block">
                  dotravels
                </span>
                <span className="text-[10px] font-semibold text-accent uppercase tracking-wider block mt-0.5">
                  Verified Travel Network
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-400 max-w-sm">
              Your premier next-gen travel portal offering handpicked Kerala holiday packages, luxury resorts, multi-axle tourist coach charters, holy pilgrimages, and expedited visa services.
            </p>

            {/* Live Agents Online Indicator Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 text-xs text-emerald-400 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-[11px]">Travel Specialists Active & Ready to Assist</span>
            </div>

            {/* Social Links with Interactive Floating Effects */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Connect With Us</p>
              <div className="flex flex-wrap gap-2.5">
                {activeSocialList.length > 0 ? (
                  activeSocialList.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={index}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 transition-all duration-300 shadow-sm hover:scale-110 hover:shadow-lg ${item.hoverColor}`}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-500 italic">Not available</span>
                )}
              </div>
            </div>
          </div>

          {/* COL 2: SERVICES DIRECTORY FROM SERVICE API (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              <span>Core Services</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {activeServices.map((service) => (
                <li key={service.id || service.label}>
                  <Link
                    to={service.path}
                    className="group flex items-center gap-2 text-slate-400 transition-colors duration-200 hover:text-white"
                  >
                    <ArrowRight className="h-3 w-3 text-slate-600 transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent shrink-0" />
                    <span className="truncate">{service.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3: QUICK LINKS (2.5 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white flex items-center gap-2">
              <Link2 className="h-4 w-4 text-accent" />
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    target={link.path === "/planner" ? "_blank" : undefined}
                    rel={link.path === "/planner" ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-2 text-slate-400 transition-colors duration-200 hover:text-white"
                  >
                    <ArrowRight className="h-3 w-3 text-slate-600 transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 4: SUPPORT DESK & DIRECT CONTACT CARD (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white flex items-center gap-2">
              <Headphones className="h-4 w-4 text-accent" />
              <span>24/7 Helpline Desk</span>
            </h4>

            <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-4 space-y-3.5 text-xs shadow-xl backdrop-blur-md">
              {/* WhatsApp Fast CTA */}
              {isWhatsappAvailable ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-emerald-600/15 border border-emerald-500/30 p-2.5 text-emerald-400 transition-all hover:bg-emerald-600/25 hover:border-emerald-500"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-medium text-emerald-300 uppercase tracking-wider">Fast WhatsApp Help</span>
                      <span className="block font-bold text-xs">{whatsappNumber}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <div className="flex items-center justify-between rounded-xl bg-slate-900/60 border border-slate-800 p-2.5 text-slate-500">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-600">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">Fast WhatsApp Help</span>
                      <span className="block font-bold text-xs text-slate-500">Not available</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Call */}
              {isPhoneAvailable ? (
                <a
                  href={`tel:${directPhone!.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2.5 text-slate-300 transition-colors hover:text-white group"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Direct Reservations Hotline</span>
                    <span className="font-semibold text-slate-200 group-hover:text-white">{directPhone}</span>
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-2.5 text-slate-500">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-600">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Direct Reservations Hotline</span>
                    <span className="font-semibold text-slate-500">Not available</span>
                  </div>
                </div>
              )}

              {/* Official Email */}
              {isEmailAvailable ? (
                <a
                  href={`mailto:${officialEmail}`}
                  className="flex items-center gap-2.5 text-slate-300 transition-colors hover:text-white group"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-accent group-hover:bg-accent group-hover:text-slate-950 transition-colors">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] text-slate-400">Official Inquiries & Support</span>
                    <span className="font-semibold text-slate-200 group-hover:text-white truncate block">{officialEmail}</span>
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-2.5 text-slate-500">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-600">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] text-slate-500">Official Inquiries & Support</span>
                    <span className="font-semibold text-slate-500 truncate block">Not available</span>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-start gap-2.5 pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                <MapPin className="mt-0.5 h-3.5 w-3.5 text-accent shrink-0" />
                <span>{isAddressAvailable ? officialAddress : "Not available"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRUST ACCREDITATION & PAYMENT CHIPS STRIP */}
        <div className="py-6 border-b border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-medium text-slate-300">100% Safe & Verified Bookings</span>
            </div>
            <span className="hidden sm:inline text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-sky-400 shrink-0" />
              <span className="font-medium text-slate-300">256-Bit SSL Secured Checkout</span>
            </div>
            <span className="hidden sm:inline text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="font-medium text-slate-300">Instant Customer Care</span>
            </div>
          </div>

          {/* Payment Chips */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {["UPI", "RuPay", "Visa", "Mastercard", "NetBanking", "Stripe"].map((method) => (
              <span
                key={method}
                className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-300 shadow-sm"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & JUMP TO TOP BAR */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} <span className="font-semibold text-slate-200">dotravels</span>. All rights reserved. Crafted for seamless journeys.
          </p>

          <div className="flex items-center gap-4 sm:gap-5 flex-wrap justify-center text-[11px] sm:text-xs">
            <Link to="/about" className="hover:text-white transition-colors duration-150">
              About
            </Link>
            <span className="text-slate-700">·</span>
            <Link to="/terms" className="hover:text-white transition-colors duration-150">
              Terms & Conditions
            </Link>
            <span className="text-slate-700">·</span>
            <Link to="/refund" className="hover:text-white transition-colors duration-150">
              Refund & Cancellation
            </Link>
            <span className="text-slate-700">·</span>
            <Link to="/privacy" className="hover:text-white transition-colors duration-150">
              Privacy Policy
            </Link>
            <span className="text-slate-700">·</span>
            <Link to="/terms?target=Vendor" className="hover:text-accent transition-colors duration-150 font-medium">
              Partner Terms
            </Link>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 transition-all duration-200 hover:bg-accent hover:border-accent hover:text-accent-foreground hover:scale-105 active:scale-95 shadow-md ml-2"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
