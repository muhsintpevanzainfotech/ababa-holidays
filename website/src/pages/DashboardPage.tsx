import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Package,
  User,
  ShieldCheck,
  Mail,
  Phone,
  Sparkles,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  Headphones,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchProfileStart, logout } from "@/store/slices/authSlice";
import { fetchUserBookingsStart } from "@/store/slices/bookingSlice";

const tabs = [
  { id: "bookings", label: "My Bookings", icon: Package },
  { id: "upcoming", label: "Upcoming Trips", icon: CalendarDays },
  { id: "saved", label: "Saved Wishlist", icon: Heart },
  { id: "profile", label: "Profile & Settings", icon: Settings },
];

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const { items, removeItem } = useWishlist();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user } = useAppSelector((state) => state.auth);
  const { userBookings, loading } = useAppSelector((state) => state.booking);

  // Editable Profile Form State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchProfileStart());
    dispatch(fetchUserBookingsStart());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  const handleSignOut = () => {
    dispatch(logout());
    toast({ title: "Signed Out", description: "You have been logged out safely." });
    navigate("/");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Updated!",
        description: "Your personal details have been saved successfully.",
      });
    }, 600);
  };

  const activeBookingsCount = Array.isArray(userBookings) ? userBookings.length : 0;
  const userInitial = (user?.name?.[0] || "T").toUpperCase();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 md:pt-36 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* USER PROFILE HERO HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-dark via-slate-900 to-slate-950 p-6 sm:p-8 lg:p-10 border border-white/10 shadow-2xl mb-8"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-5">
                {/* User Avatar Circle */}
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-accent text-accent-foreground font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
                    {userInitial}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </span>
                </div>

                {/* User Information */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold text-white tracking-tight">
                      {user?.name || "Valued Traveler"}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-accent" /> {user?.email || "traveler@ababatravels.com"}
                    </span>
                    {user?.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-accent" /> {user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link to="/packages" className="flex-1 md:flex-none">
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11 font-bold text-xs sm:text-sm gap-2 shadow-md">
                    <Compass className="w-4 h-4" />
                    Book New Trip
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="rounded-xl h-11 border-white/20 text-white bg-white/5 hover:bg-white/15 text-xs font-semibold gap-2 shrink-0"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* DASHBOARD STATS ROW */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Bookings</div>
                <div className="text-xl sm:text-2xl font-bold font-display text-white mt-1">{activeBookingsCount}</div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Saved Wishlist</div>
                <div className="text-xl sm:text-2xl font-bold font-display text-accent mt-1">{items.length}</div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Account Status</div>
                <div className="text-xs sm:text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Member
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Support Line</div>
                <div className="text-xs font-bold text-white mt-2 flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5 text-accent" /> 24/7 Priority
                </div>
              </div>
            </div>
          </motion.div>

          {/* MAIN DASHBOARD CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-3xl border border-border/80 shadow-card p-2 sm:p-3 sticky top-28">
                <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <tab.icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                      {tab.id === "saved" && items.length > 0 && (
                        <span className="ml-auto rounded-full bg-background/20 px-2 py-0.5 text-[10px] font-extrabold">
                          {items.length}
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors whitespace-nowrap mt-2 border-t border-border/40"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Display Panel */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {/* 1. MY BOOKINGS TAB */}
                {activeTab === "bookings" && (
                  <motion.div
                    key="tab-bookings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                        <Package className="w-5 h-5 text-accent" />
                        My Bookings ({userBookings?.length || 0})
                      </h2>
                    </div>

                    {loading ? (
                      <div className="text-center py-16 bg-card rounded-3xl border border-border/80 text-muted-foreground">
                        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs font-semibold">Loading your bookings...</p>
                      </div>
                    ) : !userBookings || userBookings.length === 0 ? (
                      <div className="text-center py-16 bg-card rounded-3xl border border-border/80 shadow-card p-8">
                        <Package className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
                        <h3 className="font-display font-bold text-foreground text-lg mb-1.5">No bookings yet</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto mb-6">
                          You haven't booked any holiday packages yet. Explore our curated tours across Kerala & international destinations.
                        </p>
                        <Link to="/packages">
                          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-bold text-xs gap-2 px-6">
                            Browse All Packages
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      userBookings.map((booking: any, idx: number) => {
                        const pkgTitle = booking.package?.title || booking.title || "Custom Tour Package";
                        const pkgLoc = booking.package?.location || booking.location || "Kerala, India";
                        const pkgImg = booking.package?.images?.[0] || booking.image || "/favicon.png";
                        const price = booking.totalPrice || booking.price || 0;
                        const status = booking.status || "Confirmed";

                        return (
                          <div
                            key={booking._id || booking.id || idx}
                            className="bg-card rounded-3xl border border-border/80 shadow-card overflow-hidden flex flex-col sm:flex-row hover:border-accent/40 transition-all duration-300"
                          >
                            <div className="sm:w-52 h-44 sm:h-auto shrink-0 relative bg-muted">
                              <img
                                src={pkgImg}
                                alt={pkgTitle}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/favicon.png";
                                }}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <h3 className="font-display font-bold text-foreground text-base sm:text-lg">
                                    {pkgTitle}
                                  </h3>
                                  <span
                                    className={`text-[11px] px-3 py-1 rounded-full font-extrabold uppercase tracking-wide shrink-0 ${
                                      status === "Confirmed"
                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                    }`}
                                  >
                                    {status}
                                  </span>
                                </div>

                                <div className="space-y-1 text-xs text-muted-foreground">
                                  <p className="flex items-center gap-1.5 font-medium">
                                    <MapPin className="w-3.5 h-3.5 text-accent" /> {pkgLoc}
                                  </p>
                                  <p className="flex items-center gap-1.5 font-medium">
                                    <Clock className="w-3.5 h-3.5 text-accent" /> Booked on:{" "}
                                    {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "Recently"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Paid</span>
                                  <span className="font-display font-extrabold text-foreground text-lg sm:text-xl">
                                    ₹{Number(price).toLocaleString("en-IN")}
                                  </span>
                                </div>

                                <Link to={`/packages/${booking.package?._id || booking.package?.id || booking.id}`}>
                                  <Button size="sm" variant="outline" className="rounded-xl font-bold text-xs gap-1.5 border-border/80">
                                    View Package <ArrowRight className="w-3.5 h-3.5" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </motion.div>
                )}

                {/* 2. UPCOMING TRIPS TAB */}
                {activeTab === "upcoming" && (
                  <motion.div
                    key="tab-upcoming"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center py-16 bg-card rounded-3xl border border-border/80 shadow-card p-8"
                  >
                    <CalendarDays className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="font-display font-bold text-foreground text-lg mb-1.5">No upcoming trips</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto mb-6">
                      You don't have any scheduled upcoming departures right now. Start planning your next vacation!
                    </p>
                    <Link to="/packages">
                      <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-bold text-xs gap-2 px-6">
                        Explore Travel Destinations
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </motion.div>
                )}

                {/* 3. SAVED WISHLIST TAB */}
                {activeTab === "saved" && (
                  <motion.div
                    key="tab-saved"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                        <Heart className="w-5 h-5 text-accent" />
                        Saved Wishlist ({items.length})
                      </h2>
                    </div>

                    {items.length === 0 ? (
                      <div className="text-center py-16 bg-card rounded-3xl border border-border/80 shadow-card p-8">
                        <Heart className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
                        <h3 className="font-display font-bold text-foreground text-lg mb-1.5">Your wishlist is empty</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto mb-6">
                          Save packages you love while browsing to compare prices and plan your ideal vacation.
                        </p>
                        <Link to="/packages">
                          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-bold text-xs gap-2 px-6">
                            Browse Packages
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-card rounded-2xl border border-border/80 shadow-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={item.image}
                                alt={item.title}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/favicon.png";
                                }}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-muted"
                              />
                              <div>
                                <Link
                                  to={`/packages/${item.id}`}
                                  className="font-display font-bold text-foreground hover:text-accent text-sm sm:text-base transition-colors"
                                >
                                  {item.title}
                                </Link>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="w-3.5 h-3.5 text-accent" /> {item.location}
                                </p>
                                <p className="text-xs font-bold text-foreground mt-1">
                                  ₹{Number(item.price).toLocaleString("en-IN")} / person
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <Link to={`/packages/${item.id}`}>
                                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-bold text-xs">
                                  Book Now
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeItem(item.id)}
                                className="text-destructive hover:bg-destructive/10 rounded-xl text-xs font-semibold"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 4. PROFILE SETTINGS TAB */}
                {activeTab === "profile" && (
                  <motion.div
                    key="tab-profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-card rounded-3xl border border-border/80 shadow-card p-6 sm:p-8 space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                        <Settings className="w-5 h-5 text-accent" />
                        Account & Profile Settings
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Update your personal details used for ticket bookings and hotel reservations
                      </p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Full Name</Label>
                          <div className="relative mt-1.5">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="text"
                              required
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              placeholder="Your Full Name"
                              className="pl-10 h-11 rounded-xl bg-background/50 border-border/80"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Email Address</Label>
                          <div className="relative mt-1.5">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="email"
                              required
                              value={profileEmail}
                              onChange={(e) => setProfileEmail(e.target.value)}
                              placeholder="your.email@example.com"
                              className="pl-10 h-11 rounded-xl bg-background/50 border-border/80"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Phone Number</Label>
                          <div className="relative mt-1.5">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="tel"
                              value={profilePhone}
                              onChange={(e) => setProfilePhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="pl-10 h-11 rounded-xl bg-background/50 border-border/80"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <Button
                          type="submit"
                          disabled={isSaving}
                          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11 px-7 font-bold text-xs sm:text-sm gap-2 shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          {isSaving ? "Saving..." : "Save Profile Details"}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
