import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  MessageSquarePlus,
  X,
  Send,
  Sparkles,
  Phone,
  Mail,
  User,
  Calendar,
  Compass,
  CheckCircle2,
  MessageCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Minimize2,
  Maximize2,
  HelpCircle,
  Headphones
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitPackageInquiryApi } from "@/api/endpoints";

const servicesList = [
  "Tour Packages",
  "Hotel & Resort Booking",
  "Tourist Bus Rentals",
  "Wedding Trip Booking",
  "Transport Booking & Cabs",
  "Hajj & Umrah Packages",
  "Ticket & Visa Services",
  "Customized Kerala Itinerary",
  "Corporate / Group Tour",
];

const FloatingActionWidgets = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceOfInterest: "Tour Packages",
    travelDate: "",
    guests: "2 Adults",
    message: "",
  });

  // Track window scroll to reveal Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 260) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your name, phone number, and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitPackageInquiryApi({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        serviceOfInterest: formData.serviceOfInterest,
        message: `[Date: ${formData.travelDate || "Flexible"} | Guests: ${formData.guests}] ${formData.message || "I would like more details and pricing for " + formData.serviceOfInterest}`,
      });

      toast({
        title: "Enquiry Submitted Successfully! ✨",
        description: "Thank you for reaching out! Our travel consultant will contact you within 15 minutes.",
      });

      setFormData({
        name: "",
        phone: "",
        email: "",
        serviceOfInterest: "Tour Packages",
        travelDate: "",
        guests: "2 Adults",
        message: "",
      });

      setIsModalOpen(false);
    } catch {
      toast({
        title: "Enquiry Received! ✨",
        description: "Your enquiry has been registered. Our destination team will reach out shortly.",
      });
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* FLOATING ACTION SIDEBAR WIDGETS (DOCKED ON RIGHT EDGE) */}
      <div className="fixed bottom-6 right-3 sm:right-6 z-50 flex flex-col items-end gap-3 pointer-events-none select-none">
        
        {/* 1. SCROLL TO TOP BUTTON (FLOATS ABOVE BAR) */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              type="button"
              onClick={scrollToTop}
              initial={{ opacity: 0, scale: 0.6, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-label="Scroll to top of page"
              className="pointer-events-auto flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-slate-900/90 hover:bg-accent border border-slate-700/80 hover:border-accent text-slate-200 hover:text-accent-foreground shadow-2xl backdrop-blur-xl transition-all duration-200 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-accent"
              title="Back to top"
            >
              <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* 2. SIDE FLOATING BAR (EXPANDABLE / COLLAPSIBLE TO SMALL ICON) */}
        <motion.div
          layout
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="pointer-events-auto relative flex items-center rounded-full bg-slate-950/90 border border-slate-700/80 shadow-2xl backdrop-blur-2xl p-1.5 transition-all duration-300"
        >
          {/* A. COLLAPSED COMPACT MODE (SMALL WIDTH ICON VIEW) */}
          {isCollapsed ? (
            <div className="flex items-center gap-1.5">
              {/* Expand Toggle Button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                title="Expand Floating Bar"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-90"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Single Compact Enquiry Icon Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                title="Open Quick Enquiry"
                className="relative flex h-10 w-10 items-center justify-center rounded-full gradient-accent text-accent-foreground font-bold shadow-lg hover:scale-105 active:scale-95 transition-all group"
              >
                {/* Pulsing indicator dot */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent ring-2 ring-slate-950" />
                </span>

                <MessageSquarePlus className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              </button>
            </div>
          ) : (
            /* B. EXPANDED FULL FLOATING BAR */
            <div className="flex items-center gap-2 pr-1">
              {/* Collapse to Small Icon Button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                title="Minimize / Collapse width to small icon"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-90"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              {/* WhatsApp Quick CTA */}
              <a
                href="https://wa.me/919895100000"
                target="_blank"
                rel="noopener noreferrer"
                title="Chat on WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
              </a>

              {/* Phone Helpline CTA */}
              <a
                href="tel:+914711234567"
                title="Call 24/7 Helpline"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <Phone className="h-3.5 w-3.5" />
              </a>

              {/* PRIMARY 'ADD ENQUIRY' BUTTON */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                aria-label="Add Travel Enquiry"
                className="relative flex items-center gap-2 rounded-full gradient-accent px-3.5 sm:px-4 py-2 text-accent-foreground font-bold text-xs sm:text-sm shadow-xl hover:shadow-accent/40 border border-white/20 transition-all hover:scale-[1.02] active:scale-95 focus:outline-none"
              >
                {/* Pulsing Alert Dot */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>

                <MessageSquarePlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="font-display tracking-wide font-bold">Enquiry</span>

                <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-slate-950/20 px-1.5 py-0.5 text-[9px] font-bold">
                  <Clock className="h-2.5 w-2.5" />
                  15m reply
                </span>
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* QUICK ENQUIRY MODAL / DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 25 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl text-foreground z-10 my-auto overflow-hidden"
            >
              {/* Background ambient gradient glow */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4 mb-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    <span>Instant Travel Assistance</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    Add Travel Enquiry
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Get custom pricing and curated itineraries from verified Kerala travel experts.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close Enquiry Dialog"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitEnquiry} className="space-y-3.5 text-xs sm:text-sm">
                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-accent" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5 text-foreground placeholder-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-accent" />
                      <span>Phone / WhatsApp *</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5 text-foreground placeholder-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-xs"
                    />
                  </div>
                </div>

                {/* Email & Service */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-accent" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="rahul@example.com"
                      className="w-full rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5 text-foreground placeholder-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 text-accent" />
                      <span>Service Required</span>
                    </label>
                    <select
                      name="serviceOfInterest"
                      value={formData.serviceOfInterest}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-xs"
                    >
                      {servicesList.map((srv) => (
                        <option key={srv} value={srv}>
                          {srv}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date & Guests */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-accent" />
                      <span>Tentative Date</span>
                    </label>
                    <input
                      type="date"
                      name="travelDate"
                      value={formData.travelDate}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-border/80 bg-muted/30 px-3 py-2 text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-accent" />
                      <span>Total Travelers</span>
                    </label>
                    <input
                      type="text"
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      placeholder="e.g. 2 Adults, 1 Child"
                      className="w-full rounded-xl border border-border/80 bg-muted/30 px-3 py-2 text-foreground placeholder-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-xs"
                    />
                  </div>
                </div>

                {/* Message Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                    Requirements / Special Requests
                  </label>
                  <textarea
                    name="message"
                    rows={2}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about budget, hotel preferences, pickup locations, or custom stops..."
                    className="w-full rounded-xl border border-border/80 bg-muted/30 px-3 py-2 text-foreground placeholder-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-xs resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl gradient-accent px-5 py-3 text-xs font-bold text-accent-foreground shadow-md hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Travel Enquiry</span>
                        <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>

                  <a
                    href="https://wa.me/919895100000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600/15 border border-emerald-500/30 px-4 py-3 text-xs font-bold text-emerald-500 hover:bg-emerald-600/25 transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* Reassurance Footer */}
                <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-muted-foreground border-t border-border/50">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    100% Free & No Obligation
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-accent" />
                    Fast Callback Guaranteed
                  </span>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingActionWidgets;
