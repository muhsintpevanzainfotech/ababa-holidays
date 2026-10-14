import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Award,
  Headphones,
  Users,
  Globe,
  MapPin,
  Plane,
  Heart,
  Sparkles,
  CheckCircle2,
  Calendar,
  Compass,
  Bus,
  Hotel,
  ArrowRight,
  TrendingUp,
  Lock,
  Star,
  Quote,
  Clock,
  Car
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeading from "@/components/SectionHeading";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchAboutStart } from "@/store/slices/aboutSlice";
import { getAboutDataApi } from "@/api/endpoints";

import destSantorini from "@/assets/dest-santorini.jpg";
import destBali from "@/assets/dest-bali.jpg";
import destDubai from "@/assets/dest-dubai.jpg";

const timelineMilestones = [
  {
    year: "2018",
    title: "Founding & Humble Beginnings",
    desc: "Started in Kochi, Kerala with a fleet of 5 luxury tempo travellers and a mission to deliver honest, transparent travel experiences across God's Own Country."
  },
  {
    year: "2020",
    title: "Expansion into Multi-Axle Fleet & Weddings",
    desc: "Scaled into large-capacity tourist coach charters, wedding logistics, and corporate pilgrimage trips, setting new benchmarks in passenger comfort and safety."
  },
  {
    year: "2022",
    title: "Hospitality & Resort Partner Network",
    desc: "Partnered directly with over 250+ handpicked boutique resorts, 5-star hotels, and Kerala backwater houseboats to offer all-inclusive curated packages."
  },
  {
    year: "2024",
    title: "AI Smart Trip Planner Launch",
    desc: "Pioneered India's first AI-assisted custom itinerary generator, enabling travelers to craft personalized holiday schedules and get instant quotes in seconds."
  },
  {
    year: "2026",
    title: "Verified Global Travel Ecosystem",
    desc: "Connecting 50,000+ happy travelers with 450+ verified agency partners across Kerala, Dubai, Kashmir, Goa, and holy pilgrimage circuits worldwide."
  }
];

const coreValues = [
  {
    icon: ShieldCheck,
    title: "Trust, Safety & Integrity",
    desc: "Every package, vehicle, and hotel is backed by comprehensive passenger protection, verified licenses, and transparent booking agreements.",
    color: "from-blue-500/20 to-sky-500/20",
    iconColor: "text-sky-500"
  },
  {
    icon: Award,
    title: "Uncompromising Quality",
    desc: "We screen every partner through our strict 5-stage vetting protocol to ensure top-notch vehicle fitness, room hygiene, and courteous service.",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500"
  },
  {
    icon: Sparkles,
    title: "Tech-Driven Convenience",
    desc: "From instant booking confirmations to AI itinerary customization and live GPS tracking, we make travel effortless from start to finish.",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500"
  },
  {
    icon: Headphones,
    title: "24/7 Human Concierge Desk",
    desc: "You are never stranded. Our round-the-clock rapid response team provides instant assistance before, during, and after your trip.",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500"
  }
];

const vettingSteps = [
  {
    step: "01",
    title: "Statutory & KYC Auditing",
    desc: "Mandatory verification of government trade licenses, GSTIN, PAN, and commercial tourism accreditations."
  },
  {
    step: "02",
    title: "Fleet & Property Inspection",
    desc: "On-site checks for air conditioning performance, seat comfort, vehicle speed governors, and hotel hygiene."
  },
  {
    step: "03",
    title: "Driver & Crew Certification",
    desc: "Commercial driving badges, background verifications, defensive driving certifications, and courteous conduct training."
  },
  {
    step: "04",
    title: "Transparent Fixed Pricing",
    desc: "Strict zero-hidden-cost agreements ensuring travelers receive exactly what is promised on their digital voucher."
  },
  {
    step: "05",
    title: "24/7 Roadside & Escrow Backup",
    desc: "Real-time trip monitoring with mandatory 90-minute vehicle replacement guarantees in rare breakdown events."
  }
];

const leadershipTeam = [
  {
    name: "Sarah Mitchell",
    role: "Chief Executive Officer & Founder",
    bio: "15+ years in global hospitality and travel tech. Passionate about empowering local operators with modern digital tools.",
    image: destSantorini
  },
  {
    name: "Ahmed Al-Rashid",
    role: "Director of Operations & Fleet Logistics",
    bio: "Specialist in interstate passenger transport logistics, pilgrim circuit planning, and luxury coach fleet management.",
    image: destDubai
  },
  {
    name: "Emily Chen",
    role: "Head of Customer Experience & AI",
    bio: "Leading customer happiness, grievance resolution, and AI smart planner algorithms for personalized itineraries.",
    image: destBali
  }
];

const trustAccreditations = [
  { label: "Kerala Tourism Accredited", sub: "Official Department Approved" },
  { label: "IATA Certified Partner", sub: "International Air Transport" },
  { label: "PCI-DSS Level 1", sub: "256-Bit SSL Encrypted" },
  { label: "ISO 9001:2015", sub: "Quality Management Certified" },
  { label: "DPDP & GDPR Compliant", sub: "100% Privacy Protected" }
];

const AboutPage = () => {
  const dispatch = useAppDispatch();
  const { aboutData, loading: reduxLoading } = useAppSelector((state) => state.about);
  const [directApiData, setDirectApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchAboutStart());
    getAboutDataApi()
      .then((data) => setDirectApiData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dispatch]);

  const activeData = directApiData || aboutData || {};

  const stats = [
    { value: activeData?.stats?.[0]?.value || "50,000+", label: activeData?.stats?.[0]?.label || "Happy Travelers" },
    { value: activeData?.stats?.[1]?.value || "120+", label: activeData?.stats?.[1]?.label || "Destinations Covered" },
    { value: "450+", label: "Verified Partners" },
    { value: "4.9/5", label: "Customer Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20">
      <Navbar />

      {/* 1. HERO SECTION WITH AMBIENT GLOW MESH */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden border-b border-border/60">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Pioneering Kerala & Global Tourism Since 2018</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground tracking-tight leading-[1.15]"
            >
              We Make Every Journey <span className="gradient-text">Unforgettable</span> & Seamless
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              {activeData?.description ||
                "dotravels is South Asia's next-generation travel ecosystem, bringing together handpicked holiday packages, luxury resort stays, multi-axle tourist coach charters, and holy pilgrimage circuits under one verified, trusted platform."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-4"
            >
              <Link
                to="/packages"
                className="inline-flex items-center gap-2 rounded-2xl gradient-accent px-6 py-3.5 text-xs sm:text-sm font-bold text-accent-foreground shadow-lg hover:opacity-95 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span>Explore Tour Packages</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/planner"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-6 py-3.5 text-xs sm:text-sm font-bold text-foreground hover:bg-muted/70 hover:border-accent/40 transition-all shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-accent" />
                <span>Try AI Smart Planner</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. VERIFIED STATS COUNTERS */}
      <section className="py-8 relative z-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 -mt-14 md:-mt-16">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl border border-border/80 bg-card/95 p-6 md:p-8 text-center shadow-xl backdrop-blur-xl hover:border-accent/40 transition-all hover-lift"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold gradient-text mb-1.5">
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. OUR STORY & FOUNDING VISION */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center max-w-6xl mx-auto">
            {/* Left Visual Composition */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl">
                <img
                  src={destSantorini}
                  alt="Our Story Journey"
                  className="w-full h-80 md:h-96 object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-card/80 backdrop-blur-md border border-border/60 text-xs">
                  <p className="font-bold text-foreground">Verified Travel Network</p>
                  <p className="text-muted-foreground">Connecting over 450+ accredited vendors seamlessly</p>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 w-36 h-36 md:w-48 md:h-48 rounded-3xl overflow-hidden border-4 border-background shadow-2xl hidden sm:block">
                <img src={destBali} alt="Resort Partnership" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            {/* Right Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
                <Compass className="h-3.5 w-3.5" />
                <span>Our Heritage & Vision</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
                From a Small Kochi Fleet to an Award-Winning National Platform
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                What began in 2018 as a passion project to organize Kerala's fragmented tourist transport ecosystem has blossomed into one of South Asia's most reputable travel aggregators.
              </p>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We believe that every holiday is deeply sacred. Whether it's a family discovering the misty hills of Munnar, a wedding party traveling together in a luxury coach, or pilgrims embarking on Hajj and Umrah, we eliminate friction and guarantee peace of mind at every mile.
              </p>

              <div className="pt-2 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-accent font-bold text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>100% Verified</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Every driver, vehicle, and hotel is thoroughly vetted.</p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-accent font-bold text-sm">
                    <CheckCircle2 className="h-4 w-4 text-sky-500" />
                    <span>Fair Pricing</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Direct-from-partner rates with zero hidden surcharges.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. COMPANY MILESTONES & TIMELINE */}
      <section className="py-16 md:py-24 bg-card/40 border-y border-border/60">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading
            badge="Our Journey"
            title="Milestones That Shaped dotravels"
            description="A journey of constant innovation, scaling partnerships, and unwavering customer dedication."
          />

          <div className="max-w-4xl mx-auto mt-12 space-y-6">
            {timelineMilestones.map((m, idx) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6 rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm hover:border-accent/40 transition-all group"
              >
                <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl gradient-accent text-accent-foreground font-display font-bold text-base sm:text-lg shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  {m.year}
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-display font-bold text-base sm:text-lg text-foreground group-hover:text-accent transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CORE COMMITMENTS & VALUES */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading
            badge="Core Commitments"
            title="The Principles That Drive Our Excellence"
            description="Our non-negotiable promises to travelers, partners, and the communities we serve."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
            {coreValues.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:border-accent/40 transition-all hover-lift space-y-4"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-inner`}>
                    <Icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. STRICT 5-STAGE PARTNER VETTING PROTOCOL */}
      <section className="py-16 md:py-24 bg-card/50 border-y border-border/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Partner Quality Assurance</span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">
              Our Strict 5-Tier Partner Vetting Protocol
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Only top-performing travel operators and hotels that pass our comprehensive checks earn the dotravels Verified Partner Badge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {vettingSteps.map((s, idx) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-2xl border border-border/80 bg-card p-5 space-y-2.5 shadow-sm hover:border-accent transition-all"
              >
                <span className="text-2xl font-display font-extrabold text-accent/60">
                  {s.step}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-foreground">{s.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/vendor-register"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-sm"
            >
              <span>Are you a travel operator? Apply to Join as Partner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. LEADERSHIP TEAM */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading
            badge="Leadership"
            title="Meet the Team Behind the Platform"
            description="Dedicated travel leaders, logistic architects, and technology innovators."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
            {leadershipTeam.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl border border-border/80 bg-card p-6 text-center space-y-4 shadow-sm hover-lift"
              >
                <div className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden ring-4 ring-accent/20 shadow-md">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base sm:text-lg text-foreground">{member.name}</h3>
                  <p className="text-xs font-semibold text-accent">{member.role}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TRUST ACCREDITATIONS BADGE STRIP */}
      <section className="py-12 bg-card/60 border-t border-border/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Official Certifications & Security Benchmarks
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {trustAccreditations.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-sm"
              >
                <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                <div className="text-left">
                  <span className="block font-bold text-xs text-foreground">{item.label}</span>
                  <span className="block text-[10px] text-muted-foreground">{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
