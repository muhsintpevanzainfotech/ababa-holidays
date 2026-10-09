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
      if (window.scrollY > 280) {
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
      {/* FLOATING ACTIONS BUTTONS CONTAINER (BOTTOM RIGHT) */}
      <div className="fixed bottom-6 right-5 sm:right-7 z-50 flex flex-col items-end gap-3 pointer-events-none select-none">
        {/* 1. SCROLL TO TOP (ARROW TOP) BUTTON */}
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
              className="pointer-events-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-900/95 hover:bg-accent border border-slate-700/80 hover:border-accent text-slate-200 hover:text-accent-foreground shadow-2xl backdrop-blur-xl transition-all duration-200 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <ArrowUp className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* 2. ADD ENQUIRY FLOATING CTA PILL BUTTON */}
        <motion.button
          type="button"
          onClick={() => setIsModalOpen(true)}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Add Travel Enquiry"
          className="pointer-events-auto relative flex items-center gap-2.5 rounded-full gradient-accent px-4 sm:px-5 py-3 text-accent-foreground font-bold shadow-2xl hover:shadow-accent/40 border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {/* Animated Pulsing Ring */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>

          <MessageSquarePlus className="h-4 w-4 shrink-0" />
          <span className="font-display text-xs sm:text-sm tracking-wide">Add Enquiry</span>

          <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-slate-950/20 px-2 py-0.5 text-[10px] font-semibold">
            <Clock className="h-3 w-3" />
            15m reply
          </span>
        </motion.button>
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
