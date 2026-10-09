import { useState } from "react";
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
  Globe,
  Award,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const serviceLinks = [
  { label: "Tour Packages", path: "/services?category=Tour+Packages" },
  { label: "Hotel & Resort Booking", path: "/services?category=Hotel+%26+Resourt" },
  { label: "Tourist Bus Rentals", path: "/services?category=Tourist+Bus+Booking" },
  { label: "Wedding Trip Logistics", path: "/services?category=Wedding+Trip+Booking" },
  { label: "Transport & Cabs", path: "/services?category=Transport+Booking" },
  { label: "Hajj & Umrah Packages", path: "/services?category=Hajj+%26+Umrah+Packages" },
  { label: "Flight Tickets & Visas", path: "/services?category=Ticket+%26+Visa+Services" },
];

const topDestinations = [
  { label: "Munnar Tea Hills", path: "/packages?destination=Munnar" },
  { label: "Alleppey Backwaters", path: "/packages?destination=Alleppey" },
  { label: "Wayanad Rainforests", path: "/packages?destination=Wayanad" },
  { label: "Kochi Heritage City", path: "/packages?destination=Kochi" },
  { label: "Dubai & Desert Safari", path: "/packages?destination=Dubai" },
  { label: "Kashmir Snow Valleys", path: "/packages?destination=Kashmir" },
  { label: "Goa Coastal Escapes", path: "/packages?destination=Goa" },
];

const companyLinks = [
  { label: "About dotravels", path: "/about" },
  { label: "AI Smart Trip Planner", path: "/planner" },
  { label: "Verified Fleet & Vendors", path: "/#vendors" },
  { label: "Travel Stories & Blog", path: "/blog" },
  { label: "Saved Wishlist", path: "/wishlist" },
  { label: "Customer Reviews", path: "/#testimonials" },
  { label: "Terms & Privacy Policy", path: "/about" },
];

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com", hoverColor: "hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com", hoverColor: "hover:bg-blue-600 hover:text-white" },
  { icon: Twitter, label: "Twitter / X", href: "https://twitter.com", hoverColor: "hover:bg-slate-800 hover:text-white" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com", hoverColor: "hover:bg-red-600 hover:text-white" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  <span>Travel Deals & AI Itineraries</span>
                </div>
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
                {socialLinks.map((item, index) => {
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
                })}
              </div>
            </div>
          </div>

          {/* COL 2: SERVICES DIRECTORY (2.5 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              <span>Core Services</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-2 text-slate-400 transition-colors duration-200 hover:text-white"
                  >
                    <ArrowRight className="h-3 w-3 text-slate-600 transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3: TOP DESTINATIONS (2.5 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-accent" />
              <span>Top Escapes</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {topDestinations.map((dest) => (
                <li key={dest.label}>
                  <Link
                    to={dest.path}
                    className="group flex items-center gap-2 text-slate-400 transition-colors duration-200 hover:text-white"
                  >
                    <ArrowRight className="h-3 w-3 text-slate-600 transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent" />
                    <span className="truncate">{dest.label}</span>
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
              <a
                href="https://wa.me/919895100000"
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
                    <span className="block font-bold text-xs">+91 98951 00000</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>

              {/* Direct Call */}
              <a
                href="tel:+914711234567"
                className="flex items-center gap-2.5 text-slate-300 transition-colors hover:text-white group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Direct Reservations Hotline</span>
                  <span className="font-semibold text-slate-200 group-hover:text-white">+91 471 123 4567</span>
                </div>
              </a>

              {/* Official Email */}
              <a
                href="mailto:hello@ababatravels.com"
                className="flex items-center gap-2.5 text-slate-300 transition-colors hover:text-white group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-accent group-hover:bg-accent group-hover:text-slate-950 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-slate-400">Official Inquiries & Support</span>
                  <span className="font-semibold text-slate-200 group-hover:text-white truncate block">hello@ababatravels.com</span>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-start gap-2.5 pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                <MapPin className="mt-0.5 h-3.5 w-3.5 text-accent shrink-0" />
                <span>MG Road, North End, Kochi, Kerala 682016, India</span>
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

          <div className="flex items-center gap-5 flex-wrap justify-center">
            {companyLinks.slice(0, 4).map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="hover:text-white transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 transition-all duration-200 hover:bg-accent hover:border-accent hover:text-accent-foreground hover:scale-105 active:scale-95 shadow-md ml-1"
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
