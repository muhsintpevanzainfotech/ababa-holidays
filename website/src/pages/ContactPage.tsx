import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Headphones,
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  ExternalLink,
  ShieldCheck,
  Zap,
  Play,
  Video,
  Star,
  Eye,
  CheckCircle2,
  Share2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { submitContactStart } from "@/store/slices/contactSlice";
import { getImageUrl } from "@/lib/imageHelper";
import { fetchReelsRequest } from "@/store/slices/reelsSlice";
import axiosInstance from "@/api/axiosInstance";

import destKerala from "@/assets/dest-kerala-backwaters.jpg";

export interface CustomContactItem {
  id: string;
  label: string;
  value: string;
}

export interface CustomSocialItem {
  id: string;
  title: string;
  url: string;
}

export interface WebShow {
  id: string;
  title: string;
  duration: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
  instagramUrl?: string;
  views: string;
  rating: number;
  quality: string;
  description: string;
  highlights: string[];
}

const defaultSystemContacts = {
  primaryPhone: "+91 98765 43210",
  supportPhone: "+91 98765 43211",
  emergencyPhone: "+91 99887 76655",
  primaryEmail: "info@ababatravels.com",
  supportEmail: "support@ababatravels.com",
  bookingEmail: "bookings@ababatravels.com",
  address: "Ababa Travels Command Center, MG Road, Fort Kochi, Kerala 682001, India",
  workingHours: "Mon - Sat: 9:00 AM - 8:00 PM IST",
  customContacts: [] as CustomContactItem[],
};

const defaultSystemSocials = {
  facebook: "https://facebook.com/ababatravels",
  instagram: "https://instagram.com/ababatravels",
  twitter: "https://twitter.com/ababatravels",
  youtube: "https://youtube.com/@ababatravels",
  linkedin: "https://linkedin.com/company/ababatravels",
  whatsapp: "https://wa.me/919876543210",
  pinterest: "https://pinterest.com/ababatravels",
  telegram: "https://t.me/ababatravels",
  customLinks: [] as CustomSocialItem[],
};

const ContactPage = () => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { submitting } = useAppSelector((state) => state.contact);
  const { reels, loading: reelsLoading } = useAppSelector((state) => state.reels);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [selectedShow, setSelectedShow] = useState<WebShow | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [systemContacts, setSystemContacts] = useState(defaultSystemContacts);
  const [systemSocials, setSystemSocials] = useState(defaultSystemSocials);
  const sliderRef = useRef<HTMLDivElement>(null);

  const categories = ["All", "Houseboats & Cruises", "Resort Tours", "Pilgrimage Guides", "International VIP"];

  useEffect(() => {
    dispatch(fetchReelsRequest());

    const fetchAdminSettings = async () => {
      try {
        const [contactRes, socialRes] = await Promise.all([
          axiosInstance.get("/settings/contact-details"),
          axiosInstance.get("/settings/social-links"),
        ]);
        if (contactRes.data?.success && contactRes.data.contactDetails) {
          setSystemContacts((prev) => ({ ...prev, ...contactRes.data.contactDetails }));
        }
        if (socialRes.data?.success && socialRes.data.socialLinks) {
          setSystemSocials((prev) => ({ ...prev, ...socialRes.data.socialLinks }));
        }
      } catch (err) {
        console.error("Error fetching official system settings from admin API:", err);
      }
    };
    fetchAdminSettings();
  }, [dispatch]);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const normalizeMediaUrl = (path?: string) => {
    return getImageUrl(path, "");
  };

  const isDirectVideoFile = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".mov") ||
      lower.includes("/uploads/")
    );
  };

  const formatEmbedVideoUrl = (url?: string) => {
    if (!url) return "https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1";
    if (isDirectVideoFile(url)) return url;

    if (url.includes("instagram.com/reel/") || url.includes("instagram.com/p/")) {
      const cleanUrl = url.split("?")[0].replace(/\/$/, "");
      return `${cleanUrl}/embed`;
    }
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  // Convert backend reels from Redux reelsSlice dynamically with full Instagram URL & image correction
  const dynamicReels: WebShow[] = Array.isArray(reels)
    ? reels.map((r: any, idx: number) => {
        const rawVideo = r.video || r.reelUrl || r.url || r.videoUrl || "";
        const videoPath = normalizeMediaUrl(rawVideo);

        const isVideoAnImage =
          typeof rawVideo === "string" &&
          /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(rawVideo);

        const rawThumb =
          r.thumbnail ||
          r.image ||
          r.coverImage ||
          r.poster ||
          (isVideoAnImage ? rawVideo : "");

        let thumbPath = destKerala;
        if (rawThumb) {
          thumbPath = normalizeMediaUrl(rawThumb);
        }

        const rawInsta =
          r.reelUrl ||
          r.instagramUrl ||
          r.url ||
          (typeof rawVideo === "string" && rawVideo.includes("instagram.com") ? rawVideo : "");

        const instaLink =
          rawInsta && (rawInsta.includes("instagram.com") || rawInsta.startsWith("http"))
            ? rawInsta
            : undefined;

        return {
          id: r._id || r.id || `reel-${idx}`,
          title: r.title || "Travel Web Show Reel",
          duration: r.duration || "4:15 min show",
          category: r.category || "Houseboats & Cruises",
          thumbnail: thumbPath,
          videoUrl: videoPath || "https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1",
          instagramUrl: instaLink,
          views: r.views || "16.8K views",
          rating: r.rating || 4.9,
          quality: r.quality || "4K Ultra HD",
          highlights: r.highlights || ["Verified Travel Reel", "Exclusive Accommodations", "Ababa Guided Tour"],
          description: r.description || r.caption || "Watch 4K Ultra HD video walkthroughs of luxury destinations.",
        };
      })
    : [];

  const filteredShows =
    activeCategory === "All"
      ? dynamicReels
      : dynamicReels.filter((show) => show.category === activeCategory);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast({
      title: "Copied to Clipboard! 📋",
      description: `${label}: ${text}`,
    });
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleInquireForShow = (showTitle: string) => {
    setForm((prev) => ({
      ...prev,
      subject: `Inquiry for Web Show: ${showTitle}`,
    }));
    setSelectedShow(null);
    const formElement = document.getElementById("inquiry-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
    toast({
      title: "Inquiry Pre-Filled 📝",
      description: `Form updated for "${showTitle}". Please complete your details below.`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(submitContactStart(form));
    toast({
      title: "Message Sent Successfully! 🎉",
      description: "Thank you for reaching out. Our 24/7 Kerala support desk will contact you shortly.",
    });
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };




  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-24 sm:pt-32 pb-10 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.12),transparent_60%)] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300 border border-sky-500/20 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-sm">
                <Headphones className="h-3.5 w-3.5 text-sky-500" /> 24/7 Official Support Desk
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Support Active
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold text-foreground tracking-tight leading-tight">
              Official System Contact & <span className="gradient-text">Support Numbers</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Connect directly with our official customer assistance desks, WhatsApp support lines, VIP concierge teams, and verified social media channels.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Official System Contact & Support Numbers Grid */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-500">Instant Hotline Channels</span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Official System Numbers</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified System Contacts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Main Support / Primary Hotline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500">
                    <Phone className="w-6 h-6" />
                  </div>
                  <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-bold text-sky-500 uppercase tracking-wider">
                    24/7 Primary Desk
                  </span>
                </div>
                <h3 className="font-display font-bold text-foreground text-base mb-1">Official Contact Hotline</h3>
                <p className="text-base font-extrabold text-foreground tracking-wide font-mono mb-1">
                  {systemContacts.primaryPhone}
                </p>
                <p className="text-xs text-muted-foreground">Main Kerala & International Booking Desk</p>
              </div>

              <div className="mt-5 pt-4 border-t border-border/60 flex items-center gap-2">
                <a href={`tel:${systemContacts.primaryPhone.replace(/\s+/g, "")}`} className="flex-1">
                  <Button size="sm" className="w-full rounded-2xl gradient-accent text-white font-bold text-xs shadow-sm gap-1.5 border-0">
                    <Zap className="w-3.5 h-3.5" /> Call Now
                  </Button>
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(systemContacts.primaryPhone, "Primary Contact Phone")}
                  className="rounded-2xl border-border px-3 text-xs"
                >
                  {copiedItem === "Primary Contact Phone" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </motion.div>

            {/* 2. Official WhatsApp Support */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="group flex flex-col justify-between rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Instant Chat
                  </span>
                </div>
                <h3 className="font-display font-bold text-foreground text-base mb-1">WhatsApp Support Line</h3>
                <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wide font-mono mb-1">
                  {systemContacts.supportPhone || systemContacts.primaryPhone}
                </p>
                <p className="text-xs text-muted-foreground">Instant chat for itineraries & quotes</p>
              </div>

              <div className="mt-5 pt-4 border-t border-emerald-500/20 flex items-center gap-2">
                <a
                  href={
                    systemSocials.whatsapp && systemSocials.whatsapp.startsWith("http")
                      ? systemSocials.whatsapp
                      : `https://wa.me/${(systemContacts.supportPhone || systemContacts.primaryPhone).replace(/[^0-9]/g, "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button size="sm" className="w-full rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm gap-1.5 border-0">
                    <MessageCircle className="w-3.5 h-3.5" /> Chat WhatsApp
                  </Button>
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(systemContacts.supportPhone || systemContacts.primaryPhone, "WhatsApp Support")}
                  className="rounded-2xl border-emerald-500/30 px-3 text-xs"
                >
                  {copiedItem === "WhatsApp Support" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </motion.div>

            {/* 3. Emergency & VIP Support Desk */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                    Emergency Hotline
                  </span>
                </div>
                <h3 className="font-display font-bold text-foreground text-base mb-1">24/7 Emergency Support</h3>
                <p className="text-base font-extrabold text-foreground tracking-wide font-mono mb-1">
                  {systemContacts.emergencyPhone}
                </p>
                <p className="text-xs text-muted-foreground">{systemContacts.workingHours}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-border/60 flex items-center gap-2">
                <a href={`tel:${systemContacts.emergencyPhone.replace(/\s+/g, "")}`} className="flex-1">
                  <Button size="sm" variant="secondary" className="w-full rounded-2xl font-bold text-xs gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Call Helpline
                  </Button>
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(systemContacts.emergencyPhone, "Emergency Phone")}
                  className="rounded-2xl border-border px-3 text-xs"
                >
                  {copiedItem === "Emergency Phone" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </motion.div>

            {/* 4. Official System Email */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500">
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-bold text-sky-500 uppercase tracking-wider">
                    Official Email
                  </span>
                </div>
                <h3 className="font-display font-bold text-foreground text-base mb-1">Official Email Desk</h3>
                <p className="text-sm font-extrabold text-foreground tracking-tight font-mono mb-1 truncate">
                  {systemContacts.primaryEmail}
                </p>
                <p className="text-xs text-muted-foreground">{systemContacts.supportEmail}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-border/60 flex items-center gap-2">
                <a href={`mailto:${systemContacts.primaryEmail}`} className="flex-1">
                  <Button size="sm" variant="secondary" className="w-full rounded-2xl font-bold text-xs gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Send Email
                  </Button>
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(systemContacts.primaryEmail, "Primary Email")}
                  className="rounded-2xl border-border px-3 text-xs"
                >
                  {copiedItem === "Primary Email" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Render Additional Custom Contact Fields if added by admin */}
          {systemContacts.customContacts && systemContacts.customContacts.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3 bg-card p-4 rounded-3xl border border-border/80 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Custom System Contacts:
              </span>
              {systemContacts.customContacts.map((c) => (
                <div key={c.id} className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-2xl border border-border/60 text-xs">
                  <span className="font-bold text-primary">{c.label}:</span>
                  <span className="font-mono text-foreground font-semibold">{c.value}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(c.value, c.label)}
                    className="text-muted-foreground hover:text-foreground ml-1"
                    title="Copy"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Official System Social Media Links Hub */}
      <section className="py-10 bg-muted/40 border-y border-border/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8 text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-500/10 text-sky-500 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Verified Channels
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-foreground tracking-tight">
              Official System Social Media Links
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Follow our verified official handles for travel updates, Kerala houseboat video tours, seasonal offers, and direct chat channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                name: "Instagram",
                handle: "@ababatravels",
                url: systemSocials.instagram || "https://instagram.com/ababatravels",
                icon: Instagram,
                gradient: "from-purple-600 via-pink-500 to-amber-500",
                badge: "Official Profile",
              },
              {
                name: "WhatsApp Support",
                handle: systemContacts.supportPhone || systemContacts.primaryPhone,
                url:
                  systemSocials.whatsapp && systemSocials.whatsapp.startsWith("http")
                    ? systemSocials.whatsapp
                    : `https://wa.me/${(systemContacts.supportPhone || systemContacts.primaryPhone).replace(/[^0-9]/g, "")}`,
                icon: MessageCircle,
                gradient: "from-emerald-600 to-green-500",
                badge: "Instant Chat 24/7",
              },
              {
                name: "Facebook",
                handle: "Ababa Holidays Official",
                url: systemSocials.facebook || "https://facebook.com/ababatravels",
                icon: Facebook,
                gradient: "from-blue-700 to-blue-500",
                badge: "Official Page",
              },
              {
                name: "YouTube",
                handle: "@ababatravels",
                url: systemSocials.youtube || "https://youtube.com/@ababatravels",
                icon: Youtube,
                gradient: "from-red-600 to-rose-500",
                badge: "Tour Videos & Reels",
              },
              {
                name: "Twitter / X",
                handle: "@ababatravels",
                url: systemSocials.twitter || "https://twitter.com/ababatravels",
                icon: Twitter,
                gradient: "from-slate-900 to-slate-700",
                badge: "Live Travel News",
              },
              {
                name: "LinkedIn",
                handle: "Ababa Holidays & Travels",
                url: systemSocials.linkedin || "https://linkedin.com/company/ababatravels",
                icon: Linkedin,
                gradient: "from-sky-700 to-blue-600",
                badge: "Corporate & Partners",
              },
              ...(systemSocials.customLinks || []).map((custom: any) => ({
                name: custom.title,
                handle: custom.url,
                url: custom.url,
                icon: Share2,
                gradient: "from-indigo-600 to-sky-500",
                badge: "Custom Channel",
              })),
            ].map((social, idx) => {
              const SocialIcon = social.icon;
              return (
                <motion.a
                  key={`${social.name}-${idx}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card hover:border-accent/40 flex flex-col justify-between min-h-[170px]"
                >
                  {/* Top Ambient Gradient Accent Line */}
                  <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${social.gradient}`} />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${social.gradient} text-white flex items-center justify-center shadow-md`}>
                        <SocialIcon className="w-5 h-5" />
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>

                    <h3 className="font-display font-bold text-foreground text-sm leading-snug group-hover:text-sky-500 transition-colors">
                      {social.name}
                    </h3>
                    <p className="text-xs font-mono font-medium text-muted-foreground line-clamp-1 mt-0.5">
                      {social.handle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500">
                      {social.badge}
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Official Travel Web Shows & Travel Reels Showcase */}
      <section className="py-14 bg-background border-b border-border/60" id="web-shows-reels">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-extrabold uppercase tracking-wider border border-rose-500/20 shadow-sm">
                <Play className="w-3.5 h-3.5 fill-current" /> Official Web Shows & Travel Reels
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-foreground tracking-tight">
                Featured Travel Web Shows & Reels
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Watch 4K Ultra HD video walkthroughs of luxury Kerala houseboats, Munnar mountain resorts, sacred pilgrimage hotels, and VIP holiday destinations hosted by Ababa Travel experts.
              </p>
            </div>

            {/* Category Filter Tabs & Slider Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border/60">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeCategory === cat
                        ? "bg-card text-foreground shadow-sm border border-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Slider Navigation Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => scrollSlider("left")}
                  className="rounded-2xl h-10 w-10 border-border/80 bg-card shadow-sm hover:bg-accent/10 hover:border-accent/40"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => scrollSlider("right")}
                  className="rounded-2xl h-10 w-10 border-border/80 bg-card shadow-sm hover:bg-accent/10 hover:border-accent/40"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </Button>
              </div>
            </div>
          </div>

          {/* Web Show Reels Row Slider */}
          <div
            ref={sliderRef}
            className="flex items-center gap-5 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
            {reelsLoading ? (
              <div className="w-full text-center py-16 text-muted-foreground text-sm">
                Loading Travel Web Show Reels...
              </div>
            ) : filteredShows.length === 0 ? (
              <div className="w-full text-center py-12 bg-card rounded-3xl border border-border/80 p-8 space-y-3">
                <Video className="w-12 h-12 text-rose-500 mx-auto opacity-80" />
                <h3 className="font-display font-bold text-foreground text-lg">No Travel Reels Uploaded Yet</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Web Show Reels added from Admin or Vendor Dashboard will automatically show up here in real time.
                </p>
              </div>
            ) : (
              filteredShows.map((show, idx) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    if (show.instagramUrl) {
                      window.open(show.instagramUrl, "_blank", "noopener,noreferrer");
                    } else if (show.videoUrl && show.videoUrl.startsWith("http") && !isDirectVideoFile(show.videoUrl)) {
                      window.open(show.videoUrl, "_blank", "noopener,noreferrer");
                    } else {
                      setSelectedShow(show);
                    }
                  }}
                  className="group relative overflow-hidden rounded-3xl border border-border/80 bg-slate-950 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-rose-500/50 cursor-pointer flex flex-col min-w-[240px] sm:min-w-[270px] max-w-[280px] aspect-[9/14] snap-start shrink-0"
                >
                  {/* Reel Video Media */}
                  {isDirectVideoFile(show.videoUrl) ? (
                    <video
                      muted
                      loop
                      autoPlay
                      playsInline
                      src={show.videoUrl}
                      poster={show.thumbnail}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={show.thumbnail}
                      alt={show.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = destKerala;
                      }}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20 group-hover:from-black/95 transition-all duration-300" />

                  {/* Center Hover Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 border border-white/40 text-white backdrop-blur-md shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-500 group-hover:border-rose-400">
                      <Play className="h-6 w-6 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Overlay: Video Title & Enter Watch Button */}
                  <div className="absolute bottom-0 inset-x-0 p-4 z-10 text-white space-y-3">
                    <h3 className="font-display text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-rose-300 transition-colors">
                      {show.title}
                    </h3>

                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all group-hover:scale-[1.02]"
                    >
                      <span>Watch Reel</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Main Form & Location Desk */}
      <section className="py-12 bg-background" id="inquiry-form">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto items-stretch">
            {/* Direct Inquiry Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-card space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-500">Direct Travel Inquiry</span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground tracking-tight">Send Us a Direct Message</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Fill out your travel details and our concierge team will respond within 2 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1.5 block">Full Name *</label>
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="h-11 rounded-2xl border-border bg-muted/40 focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1.5 block">Email Address *</label>
                    <Input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="h-11 rounded-2xl border-border bg-muted/40 focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1.5 block">Phone Number</label>
                    <Input
                      placeholder="+91 98951 00000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="h-11 rounded-2xl border-border bg-muted/40 focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1.5 block">Subject *</label>
                    <Input
                      placeholder="e.g. Kerala Package / Houseboat Inquiry"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      required
                      className="h-11 rounded-2xl border-border bg-muted/40 focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 block">Your Travel Details & Message *</label>
                  <Textarea
                    placeholder="Tell us about your trip dates, group size, budget, and preferred destinations..."
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="rounded-2xl border-border bg-muted/40 focus:border-accent"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-2xl border-0 gradient-accent text-white font-bold gap-2 text-sm shadow-md hover:scale-[1.01] active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "Sending Message..." : "Submit Direct Message"}</span>
                </Button>
              </form>
            </motion.div>

            {/* Map Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 h-full flex flex-col"
            >
              {/* Google Map Box matching full height of form */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-card flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5 text-sky-500" />
                    <h3 className="font-display font-bold text-foreground text-base">Head Office Location</h3>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">Kochi, Kerala</span>
                </div>

                <div className="flex-1 min-h-[300px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-border/60 shadow-inner">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125705.90805177995!2d76.21443491321743!3d9.981635800000008!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d514abec6bf%3A0xbd582ca58458363f!2sKochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "100%" }}
                    allowFullScreen
                    loading="lazy"
                    title="Kochi Head Office Location Map"
                  />
                </div>

                <div className="pt-2 border-t border-border/60">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                    <span>📍</span>
                    <span>{systemContacts.address}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ultra-Modern Web Show Video Player Modal Box */}
      <Dialog open={!!selectedShow} onOpenChange={(open) => !open && setSelectedShow(null)}>
        <DialogContent className="max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-slate-950/95 text-white backdrop-blur-2xl p-0 shadow-2xl">
          {selectedShow && (
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
              {/* Left Column: Video Player Container */}
              <div className="lg:col-span-7 bg-black flex items-center justify-center relative aspect-video lg:aspect-auto overflow-hidden">
                {isDirectVideoFile(selectedShow.videoUrl) ? (
                  <video
                    controls
                    autoPlay
                    src={selectedShow.videoUrl}
                    poster={selectedShow.thumbnail}
                    className="h-full w-full object-contain bg-black"
                  />
                ) : (
                  <iframe
                    src={formatEmbedVideoUrl(selectedShow.videoUrl)}
                    title={selectedShow.title}
                    className="h-full w-full border-0 min-h-[300px] lg:min-h-[480px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}

                {/* Floating Player Quality Badge */}
                <span className="absolute top-4 left-4 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] font-black uppercase text-rose-400 border border-white/20 shadow-md">
                  🎬 {selectedShow.quality} Video Reel
                </span>
              </div>

              {/* Right Column: Modern Glass Details Sidebar */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-gradient-to-b from-slate-900/90 to-slate-950/95 border-t lg:border-t-0 lg:border-l border-white/10">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider border border-rose-500/30">
                      <Video className="w-3.5 h-3.5 text-rose-400" /> {selectedShow.category}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedShow.rating}
                      </span>
                      <span>•</span>
                      <span>{selectedShow.views}</span>
                    </div>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-tight">
                    {selectedShow.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {selectedShow.description}
                  </p>

                  {/* Tour Key Highlights */}
                  {selectedShow.highlights && selectedShow.highlights.length > 0 && (
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                        Tour Key Highlights
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedShow.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Action Controls */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <Button
                    onClick={() => handleInquireForShow(selectedShow.title)}
                    className="w-full sm:flex-1 h-11 rounded-2xl gradient-accent text-white font-bold text-xs gap-2 shadow-lg shadow-sky-500/20 border-0 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Send className="w-4 h-4" /> Inquire About This Tour
                  </Button>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(window.location.href, "Reel Link")}
                      className="rounded-2xl h-11 w-11 border-white/20 bg-white/5 text-white hover:bg-white/15"
                      title="Share Reel Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedShow(null)}
                      className="rounded-2xl h-11 px-4 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


      <Footer />
    </div>
  );
};

export default ContactPage;
