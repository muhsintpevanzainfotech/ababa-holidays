import { useState, useId, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Users,
  CheckCircle,
  Building2,
  Ship,
  Compass,
  Plane,
  Car,
  Award,
  ArrowLeft,
  Calendar,
  Sparkles,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import SectionHeading from "@/components/SectionHeading";
import { useToast } from "@/hooks/use-toast";

import destKerala from "@/assets/dest-kerala-backwaters.jpg";
import destSantorini from "@/assets/dest-santorini.jpg";
import destMunnar from "@/assets/dest-munnar.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destParis from "@/assets/dest-paris.jpg";
import destBali from "@/assets/dest-bali.jpg";
import destKovalam from "@/assets/dest-kovalam.jpg";
import destWayanad from "@/assets/dest-wayanad.jpg";
import destAthirapally from "@/assets/dest-athirapally.jpg";
import destTokyo from "@/assets/dest-tokyo.jpg";
import serviceBus from "@/assets/service-bus.jpg";
import serviceWedding from "@/assets/service-wedding.jpg";
import serviceTransport from "@/assets/service-transport.jpg";
import serviceHajj from "@/assets/service-hajj.jpg";

export interface VendorDetails {
  id: string;
  name: string;
  category: string;
  tagline: string;
  coverImage: string;
  avatarIcon: any;
  avatarBg: string;
  rating: number;
  reviewsCount: number;
  sold: number;
  priceLevel: string;
  location: string;
  description: string;
  verified: boolean;
  phone: string;
  email: string;
  operatingSince: string;
  fleetSize: string;
  responseTime: string;
  specialties: string[];
  gallery: string[];
}

export const vendorsList: VendorDetails[] = [
  {
    id: "vendor-1",
    name: "Kerala Backwater Cruises",
    category: "Cruises & Houseboats",
    tagline: "Luxury Backwater Stays & Private Day Charters",
    coverImage: destKerala,
    avatarIcon: Ship,
    avatarBg: "bg-blue-600 text-white",
    rating: 5.0,
    reviewsCount: 142,
    sold: 154,
    priceLevel: "₹3,499 - ₹12,999",
    location: "Alappuzha & Kumarakom, Kerala",
    description: "Kerala Backwater Cruises is a premier government-certified houseboat operator with over 12 years of excellence. We offer air-conditioned luxury houseboats with private chefs, upper deck sundecks, and customized overnight itineraries across Punnamada Lake and Kuttanad waterways.",
    verified: true,
    phone: "+91 98470 11223",
    email: "cruises@keralabackwater.com",
    operatingSince: "2012",
    fleetSize: "18 Luxury Houseboats",
    responseTime: "< 15 Mins",
    specialties: ["Honeymoon Cruise", "Kuttanad Day Charter", "Traditional Kerala Meals", "Sunset Photography Tours"],
    gallery: [destKerala, destKovalam, destMunnar, serviceWedding],
  },
  {
    id: "vendor-2",
    name: "Royal Heritage Resorts",
    category: "Luxury Stays & Villas",
    tagline: "Boutique Beach & Tea Estate Villas",
    coverImage: destSantorini,
    avatarIcon: Building2,
    avatarBg: "bg-amber-600 text-white",
    rating: 4.9,
    reviewsCount: 98,
    sold: 94,
    priceLevel: "₹4,999 - ₹18,999",
    location: "Munnar & Kovalam, Kerala",
    description: "Eco-certified luxury heritage resort chain featuring private infinity pool villas in Munnar's tea hills and beachfront private suites along Kovalam coastline.",
    verified: true,
    phone: "+91 94471 88990",
    email: "reservations@royalheritagestays.com",
    operatingSince: "2015",
    fleetSize: "4 Resort Properties",
    responseTime: "< 20 Mins",
    specialties: ["Infinity Pools", "Ayurvedic Wellness Spa", "Private Beach Access", "Tea Plantation Walk"],
    gallery: [destSantorini, destMunnar, destBali, destKovalam],
  },
  {
    id: "vendor-3",
    name: "Munnar Trails Expeditions",
    category: "Trekking & Wildlife Tours",
    tagline: "Guided Mountain Hikes & Eco Safaris",
    coverImage: destMunnar,
    avatarIcon: Compass,
    avatarBg: "bg-emerald-600 text-white",
    rating: 4.8,
    reviewsCount: 210,
    sold: 210,
    priceLevel: "₹1,499 - ₹6,999",
    location: "Idukki & Munnar, Kerala",
    description: "Licensed forest guides and trekking experts providing safe Anamudi peak hikes, Meesapulimala tent camping, and Periyar elephant sanctuary jeep safaris.",
    verified: true,
    phone: "+91 97455 33441",
    email: "treks@munnartrails.com",
    operatingSince: "2016",
    fleetSize: "12 Safari Jeeps",
    responseTime: "< 10 Mins",
    specialties: ["Tent Camping", "Night Safaris", "Waterfall Treks", "Bird Watching"],
    gallery: [destMunnar, destWayanad, destAthirapally, serviceBus],
  },
  {
    id: "vendor-4",
    name: "Skyline Global Air & Visa",
    category: "Flights & Expedited Visas",
    tagline: "International Flight Ticketing & Visa Filing",
    coverImage: destDubai,
    avatarIcon: Plane,
    avatarBg: "bg-indigo-600 text-white",
    rating: 4.9,
    reviewsCount: 310,
    sold: 480,
    priceLevel: "₹2,999 - ₹25,000",
    location: "Kochi International Airport, Kerala",
    description: "Authorized IATA ticketing agency specializing in 24-hour UAE tourist visa processing, Schengen visa assistance, and corporate group flight deals.",
    verified: true,
    phone: "+91 484 2600 700",
    email: "tickets@skylineglobal.com",
    operatingSince: "2010",
    fleetSize: "IATA Direct Partner",
    responseTime: "< 5 Mins",
    specialties: ["Same-Day UAE Visa", "Schengen Filing", "Group Flight Discount", "Travel Insurance"],
    gallery: [destDubai, destTokyo, destParis, destSantorini],
  },
  {
    id: "vendor-5",
    name: "Wayfarer Premium Chauffeurs",
    category: "Airport & Intercity Transport",
    tagline: "Luxury Sedans, SUVs & Tempo Travellers",
    coverImage: destParis,
    avatarIcon: Car,
    avatarBg: "bg-slate-800 text-white",
    rating: 4.7,
    reviewsCount: 180,
    sold: 320,
    priceLevel: "₹1,999 - ₹8,999",
    location: "Kochi, Trivandrum & Kozhikode",
    description: "Uniformed chauffeurs with GPS-enabled luxury sedans, Innova Hycross SUVs, and 26-seater Scania buses for airport transfers and outstation trips across South India.",
    verified: true,
    phone: "+91 99950 44556",
    email: "bookings@wayfarercabs.com",
    operatingSince: "2014",
    fleetSize: "45 Premium Cabs & Buses",
    responseTime: "< 10 Mins",
    specialties: ["Airport Pickups", "Sightseeing Cabs", "English Speaking Drivers", "Outstation Trips"],
    gallery: [serviceBus, serviceTransport, destKerala, destMunnar],
  },
];

const vendorTestimonialsList = [
  {
    name: "Anand & Priya V.",
    date: "Jan 2026",
    rating: 5,
    comment: "Booked our houseboat honeymoon cruise through this partner. The private chef prepared incredible Karimeen Pollichathu, and the sunset views were magical!",
  },
  {
    name: "Rohan Nair",
    date: "Feb 2026",
    rating: 5,
    comment: "Extremely professional team! Drivers arrived 15 minutes before time in a spotless AC Scania coach. Best group bus service in Kerala.",
  },
  {
    name: "Jessica Taylor",
    date: "Dec 2025",
    rating: 4,
    comment: "Prompt communication and transparent pricing. Handled our family resort bookings and airport cab transfers seamlessly.",
  },
];

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchVendorStart } from "@/store/slices/vendorSlice";
import { fetchPackagesStart } from "@/store/slices/packagesSlice";

const VendorStorePage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { vendorDetails } = useAppSelector((state) => state.vendor);
  const { packages: reduxPackages } = useAppSelector((state) => state.packages);

  useEffect(() => {
    if (id) {
      dispatch(fetchVendorStart(id));
    }
    if (!reduxPackages || reduxPackages.length === 0) {
      dispatch(fetchPackagesStart({}));
    }
  }, [id, dispatch, reduxPackages]);

  const rawVendor = vendorDetails || vendorsList.find((v) => v.id === id) || vendorsList[0] || {};
  const vendor = {
    ...rawVendor,
    id: rawVendor._id || rawVendor.id || "vendor-default",
    name: rawVendor.name || rawVendor.businessName || "Ababa Partner Vendor",
    tagline: rawVendor.tagline || rawVendor.description || "Verified Luxury Travel Specialist",
    rating: typeof rawVendor.rating === "number" ? rawVendor.rating : 4.9,
    reviewsCount: rawVendor.reviewsCount || rawVendor.reviews || 128,
    sold: rawVendor.sold || rawVendor.completedBookings || "1,200",
    specialties: Array.isArray(rawVendor.specialties) && rawVendor.specialties.length > 0
      ? rawVendor.specialties
      : ["Houseboat Cruises", "Luxury Resorts", "Pilgrimage Guides", "VIP Tours"],
    avatarIcon: rawVendor.avatarIcon || Ship,
    avatarBg: rawVendor.avatarBg || "bg-sky-500 text-white",
    coverImage: rawVendor.coverImage || destKerala,
    category: rawVendor.category || "Luxury Travel Agency",
    location: rawVendor.location || rawVendor.address || "Kochi, Kerala",
    verified: rawVendor.verified !== false,
    phone: rawVendor.phone || "+91 98951 00000",
    email: rawVendor.email || "partner@ababatravels.com",
    about: rawVendor.about || rawVendor.description || "Official verified partner of Ababa Holidays.",
  };

  const AvatarIcon = vendor.avatarIcon || Ship;
  const { toast } = useToast();
  const formId = useId();

  // Enquiry form state
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryDate, setEnquiryDate] = useState("");
  const [enquiryGuests, setEnquiryGuests] = useState(2);
  const [enquiryPackage, setEnquiryPackage] = useState(vendor.specialties[0] || "General Enquiry");
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  const vendorPackages = Array.isArray(reduxPackages) ? reduxPackages.slice(0, 3) : [];

  const handleEnquirySubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEnquirySubmitted(true);
    toast({
      title: "Enquiry Sent Directly to Vendor",
      description: `Your request was delivered to ${vendor.name}. A representative will contact you shortly.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground select-none">
      <Navbar />

      <main className="pt-20 md:pt-24 pb-16">
        {/* VENDOR HERO BANNER */}
        <div className="relative w-full h-[55vh] sm:h-[62vh] lg:h-[68vh] overflow-hidden bg-slate-950">
          <img
            src={vendor.coverImage}
            alt={vendor.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />

          {/* BREADCRUMB & BACK BUTTON */}
          <div className="absolute top-6 inset-x-0 z-20">
            <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-lg border border-white/15 hover:bg-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-accent" />
                <span>Back to Home</span>
              </Link>

              <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-slate-200 border border-white/15">
                Official Partner Store
              </span>
            </div>
          </div>

          {/* HERO CONTENT OVERLAY */}
          <div className="absolute bottom-6 inset-x-0 z-20">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  {/* AVATAR & BADGES */}
                  <div className="flex items-center gap-3">
                    <div className={`h-14 w-14 rounded-2xl border-2 border-white/30 shadow-xl flex items-center justify-center shrink-0 ${vendor.avatarBg}`}>
                      <AvatarIcon className="h-7 w-7" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {vendor.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 px-3 py-0.5 text-xs font-bold text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" /> Verified Partner
                          </span>
                        )}
                        <span className="rounded-full bg-accent/20 backdrop-blur-md border border-accent/40 px-3 py-0.5 text-xs font-bold text-accent">
                          {vendor.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{vendor.tagline}</p>
                    </div>
                  </div>

                  <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                    {vendor.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-slate-200">
                    <span className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      <span>{vendor.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{vendor.rating.toFixed(1)} ({vendor.reviewsCount} reviews)</span>
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1">
                      <Award className="w-3.5 h-3.5 text-accent" />
                      <span>{vendor.sold}+ Completed Trips</span>
                    </span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 shrink-0">
                  <a href="#enquiry-form">
                    <Button className="rounded-full border-0 gradient-accent px-6 py-3 text-xs sm:text-sm font-bold text-accent-foreground gap-2 shadow-lg hover:opacity-90">
                      <Send className="w-4 h-4" />
                      <span>Enquire Now</span>
                    </Button>
                  </a>

                  <a href={`tel:${vendor.phone}`}>
                    <Button variant="outline" className="rounded-full border-white/20 bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-900 px-5 py-3 text-xs sm:text-sm font-bold gap-2 shadow-lg">
                      <Phone className="w-4 h-4 text-accent" />
                      <span>Call Direct</span>
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="bg-slate-900 text-white border-y border-white/10 py-4">
          <div className="container mx-auto px-4 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-0.5 border-r border-white/10 last:border-0">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Operating Since</p>
              <p className="font-display text-lg font-bold text-accent">{vendor.operatingSince} ({new Date().getFullYear() - Number(vendor.operatingSince)}+ Years)</p>
            </div>
            <div className="space-y-0.5 border-r border-white/10 last:border-0">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Fleet / Properties</p>
              <p className="font-display text-lg font-bold text-white">{vendor.fleetSize}</p>
            </div>
            <div className="space-y-0.5 border-r border-white/10 last:border-0">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Response Time</p>
              <p className="font-display text-lg font-bold text-emerald-400">{vendor.responseTime}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Price Range</p>
              <p className="font-display text-lg font-bold text-white">{vendor.priceLevel}</p>
            </div>
          </div>
        </div>

        {/* MAIN STORE BODY */}
        <div className="container mx-auto px-4 lg:px-8 py-10 sm:py-14 space-y-16">
          {/* ABOUT VENDOR & SPECIALTIES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 surface-panel rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">About {vendor.name}</h2>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                {vendor.description}
              </p>

              <div className="pt-4 space-y-3 border-t border-border/60">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">Core Specialties & Offerings</p>
                <div className="flex flex-wrap gap-2.5">
                  {vendor.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-card border border-border/80 px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-accent" />
                      <span>{spec}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* QUICK VENDOR CONTACT CARD */}
            <div className="glass-card rounded-3xl p-6 space-y-5 border border-border">
              <h3 className="font-display text-lg font-bold text-foreground border-b border-border/60 pb-3">
                Partner Direct Desk
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/60">
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Location</p>
                    <p className="font-semibold text-foreground">{vendor.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/60">
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Phone Helpline</p>
                    <a href={`tel:${vendor.phone}`} className="font-semibold text-foreground hover:underline">
                      {vendor.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/60">
                  <Mail className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Email Enquiry</p>
                    <a href={`mailto:${vendor.email}`} className="font-semibold text-foreground hover:underline">
                      {vendor.email}
                    </a>
                  </div>
                </div>
              </div>

              <a href="#enquiry-form" className="block">
                <Button className="w-full rounded-full border-0 gradient-accent py-3 text-xs font-bold text-accent-foreground shadow-md hover:opacity-90">
                  Send Direct Message
                </Button>
              </a>
            </div>
          </div>

          {/* VENDOR OFFERED PACKAGES */}
          <section className="space-y-6">
            <SectionHeading
              badge="Partner Catalog"
              title={`Packages & Fleet Services by ${vendor.name}`}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendorPackages.map((pkg, idx) => (
                <PackageCard
                  key={pkg.id}
                  {...pkg}
                  index={idx}
                  description=""
                  itinerary={[]}
                  included={[]}
                />
              ))}
            </div>
          </section>

          {/* VENDOR TESTIMONIALS */}
          <section className="surface-panel rounded-3xl p-6 sm:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Client Reviews
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Partner Testimonials & Feedback
                </h2>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3 shadow-sm shrink-0">
                <div className="font-display text-3xl font-bold text-foreground">{vendor.rating.toFixed(1)}</div>
                <div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground">{vendor.reviewsCount} verified reviews</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vendorTestimonialsList.map((test, idx) => (
                <div key={idx} className="rounded-2xl bg-card border border-border/70 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">{test.name}</p>
                      <p className="text-[11px] text-muted-foreground">{test.date} · Verified Traveler</p>
                    </div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                    "{test.comment}"
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* VENDOR CONTACT & ENQUIRY FORM */}
          <section id="enquiry-form" className="scroll-mt-28">
            <div className="surface-panel rounded-3xl p-6 sm:p-10 border border-border shadow-xl space-y-8">
              <div className="max-w-xl space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
                  <Send className="w-3.5 h-3.5" /> Direct Partner Form
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Send Booking Enquiry to {vendor.name}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Fill in your travel dates and requirements below. Your message will be delivered straight to this verified partner.
                </p>
              </div>

              {!enquirySubmitted ? (
                <form onSubmit={handleEnquirySubmit} className="space-y-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`${formId}-enq-name`} className="text-xs font-bold text-foreground">
                        Full Name
                      </Label>
                      <Input
                        id={`${formId}-enq-name`}
                        placeholder="Your full name"
                        value={enquiryName}
                        onChange={(e) => setEnquiryName(e.target.value)}
                        required
                        className="rounded-xl border-border text-xs py-3"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`${formId}-enq-email`} className="text-xs font-bold text-foreground">
                        Email Address
                      </Label>
                      <Input
                        id={`${formId}-enq-email`}
                        type="email"
                        placeholder="you@example.com"
                        value={enquiryEmail}
                        onChange={(e) => setEnquiryEmail(e.target.value)}
                        required
                        className="rounded-xl border-border text-xs py-3"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`${formId}-enq-phone`} className="text-xs font-bold text-foreground">
                        Phone Number
                      </Label>
                      <Input
                        id={`${formId}-enq-phone`}
                        type="tel"
                        placeholder="Your contact number"
                        value={enquiryPhone}
                        onChange={(e) => setEnquiryPhone(e.target.value)}
                        required
                        className="rounded-xl border-border text-xs py-3"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`${formId}-enq-date`} className="text-xs font-bold text-foreground">
                        Preferred Travel Date
                      </Label>
                      <Input
                        id={`${formId}-enq-date`}
                        type="date"
                        value={enquiryDate}
                        onChange={(e) => setEnquiryDate(e.target.value)}
                        required
                        className="rounded-xl border-border text-xs py-3"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`${formId}-enq-guests`} className="text-xs font-bold text-foreground">
                        Number of Guests / Travelers
                      </Label>
                      <select
                        id={`${formId}-enq-guests`}
                        value={enquiryGuests}
                        onChange={(e) => setEnquiryGuests(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-medium text-foreground outline-none shadow-sm"
                      >
                        <option value={1}>1 Person</option>
                        <option value={2}>2 Guests</option>
                        <option value={4}>3-5 Guests</option>
                        <option value={10}>6-15 Group</option>
                        <option value={25}>15+ Large Group / Bus Charter</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`${formId}-enq-package`} className="text-xs font-bold text-foreground">
                        Interested Offering / Package
                      </Label>
                      <select
                        id={`${formId}-enq-package`}
                        value={enquiryPackage}
                        onChange={(e) => setEnquiryPackage(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-medium text-foreground outline-none shadow-sm"
                      >
                        {vendor.specialties.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`${formId}-enq-msg`} className="text-xs font-bold text-foreground">
                      Special Requirements / Message
                    </Label>
                    <Textarea
                      id={`${formId}-enq-msg`}
                      placeholder="Specify your budget, custom itinerary requests, pickup location, or special meal preferences..."
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      rows={4}
                      className="rounded-xl border-border text-xs leading-relaxed"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="rounded-full border-0 gradient-accent px-8 py-3.5 text-xs sm:text-sm font-bold text-accent-foreground shadow-md hover:opacity-90 transition-all gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Enquiry to {vendor.name}</span>
                  </Button>
                </form>
              ) : (
                <div className="py-8 text-center space-y-4 rounded-2xl bg-card border border-border p-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                    <ThumbsUp className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-2xl font-bold text-foreground">Enquiry Received!</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-foreground">{enquiryName}</strong>! Your inquiry for{" "}
                      <strong>{enquiryPackage}</strong> was delivered to <strong>{vendor.name}</strong>. A partner representative will contact you at <strong>{enquiryPhone}</strong> within 15 minutes.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setEnquirySubmitted(false)}
                    className="rounded-full border-0 gradient-accent px-6 py-2.5 text-xs font-bold text-accent-foreground"
                  >
                    Send Another Request
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorStorePage;
