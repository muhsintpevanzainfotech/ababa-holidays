import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, Train, Plane, FileText, ArrowRight, Calendar, MapPin, Users, CheckCircle, Search, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeading from "@/components/SectionHeading";
import { useToast } from "@/hooks/use-toast";

const tabs = [
  { id: "bus", label: "Bus", icon: Bus },
  { id: "train", label: "Train", icon: Train },
  { id: "flight", label: "Flight", icon: Plane },
  { id: "visa", label: "Visa", icon: FileText },
] as const;

type TabId = (typeof tabs)[number]["id"];

const popularRoutes = {
  bus: [
    { from: "New York", to: "Washington DC", price: "₹25", duration: "4h 30m" },
    { from: "Los Angeles", to: "San Francisco", price: "₹35", duration: "6h" },
    { from: "Chicago", to: "Detroit", price: "₹20", duration: "5h" },
    { from: "Boston", to: "Philadelphia", price: "₹30", duration: "5h 30m" },
  ],
  train: [
    { from: "Paris", to: "London", price: "₹89", duration: "2h 15m" },
    { from: "Tokyo", to: "Osaka", price: "₹120", duration: "2h 30m" },
    { from: "Zurich", to: "Milan", price: "₹65", duration: "3h 20m" },
    { from: "Berlin", to: "Munich", price: "₹55", duration: "4h" },
  ],
  flight: [
    { from: "New York", to: "London", price: "₹399", duration: "7h 30m" },
    { from: "Dubai", to: "Maldives", price: "₹249", duration: "4h 15m" },
    { from: "Tokyo", to: "Bali", price: "₹299", duration: "7h" },
    { from: "Paris", to: "Santorini", price: "₹189", duration: "3h 30m" },
  ],
};

const visaCountries = [
  { country: "United States", type: "Tourist B1/B2", processing: "5-7 business days", price: "₹160" },
  { country: "United Kingdom", type: "Standard Visitor", processing: "3-4 weeks", price: "₹130" },
  { country: "Schengen (Europe)", type: "Tourist Visa", processing: "15 calendar days", price: "₹90" },
  { country: "Japan", type: "Tourist Visa", processing: "5-7 business days", price: "₹25" },
  { country: "Australia", type: "eVisitor/ETA", processing: "1-2 business days", price: "₹20" },
  { country: "UAE (Dubai)", type: "Tourist Visa", processing: "3-5 business days", price: "₹85" },
];

const TicketVisaPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("flight");
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Searching...", description: "Finding the best options for you!" });
  };

  const handleVisaApply = () => {
    toast({ title: "Application Started", description: "Our visa expert will contact you within 24 hours." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative pt-28 md:pt-32 pb-12 bg-muted/60 border-b border-border/60 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-8 md:pt-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
              Ticket & Visa <span className="text-accent">Services</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">Book bus, train & flight tickets or apply for visas — all in one place.</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground shadow-lg"
                    : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Booking Forms */}
          <AnimatePresence mode="wait">
            {activeTab !== "visa" ? (
              <motion.form
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSearch}
                className="glass-card-dark p-5 md:p-8 max-w-4xl mx-auto"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                  <div>
                    <Label className="text-primary-foreground/60 text-xs mb-1.5 block">From</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                      <Input placeholder="Departure city" className="pl-9 bg-white/10 border-white/10 text-primary-foreground placeholder:text-primary-foreground/30" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-primary-foreground/60 text-xs mb-1.5 block">To</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                      <Input placeholder="Arrival city" className="pl-9 bg-white/10 border-white/10 text-primary-foreground placeholder:text-primary-foreground/30" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-primary-foreground/60 text-xs mb-1.5 block">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                      <Input type="date" className="pl-9 bg-white/10 border-white/10 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-primary-foreground/60 text-xs mb-1.5 block">Passengers</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                      <Input type="number" min={1} defaultValue={1} className="pl-9 bg-white/10 border-white/10 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {activeTab === "flight" && (
                  <div className="flex flex-wrap gap-3 mb-5">
                    {["One Way", "Round Trip", "Multi-City"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs text-primary-foreground/70 cursor-pointer">
                        <input type="radio" name="tripType" defaultChecked={opt === "Round Trip"} className="accent-accent" />
                        {opt}
                      </label>
                    ))}
                    <select className="ml-auto bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-primary-foreground">
                      <option>Economy</option>
                      <option>Business</option>
                      <option>First Class</option>
                    </select>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full gradient-accent text-accent-foreground border-0 hover:opacity-90 gap-2">
                  <Search className="w-4 h-4" /> Search {tabs.find((t) => t.id === activeTab)?.label} Tickets
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="visa"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card-dark p-5 md:p-8 max-w-4xl mx-auto"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                  <div>
                    <Label className="text-primary-foreground/60 text-xs mb-1.5 block">Destination Country</Label>
                    <select className="w-full h-10 px-3 rounded-lg bg-white/10 border border-white/10 text-primary-foreground text-sm">
                      <option value="">Select Country</option>
                      {visaCountries.map((v) => (
                        <option key={v.country} value={v.country}>{v.country}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-primary-foreground/60 text-xs mb-1.5 block">Visa Type</Label>
                    <select className="w-full h-10 px-3 rounded-lg bg-white/10 border border-white/10 text-primary-foreground text-sm">
                      <option>Tourist Visa</option>
                      <option>Business Visa</option>
                      <option>Transit Visa</option>
                      <option>Student Visa</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-primary-foreground/60 text-xs mb-1.5 block">Number of Applicants</Label>
                    <Input type="number" min={1} defaultValue={1} className="bg-white/10 border-white/10 text-primary-foreground" />
                  </div>
                </div>
                <Button onClick={handleVisaApply} size="lg" className="w-full gradient-accent text-accent-foreground border-0 hover:opacity-90 gap-2">
                  <FileText className="w-4 h-4" /> Start Visa Application
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Popular Routes / Visa Countries */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          {activeTab !== "visa" ? (
            <>
              <SectionHeading badge="Popular Routes" title={`Top ${tabs.find((t) => t.id === activeTab)?.label} Routes`} description="Most booked routes with the best prices." />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
                {popularRoutes[activeTab].map((route, i) => (
                  <motion.div
                    key={`${route.from}-${route.to}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-2xl p-5 shadow-card hover-lift"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-foreground">{route.from}</span>
                      <ArrowLeftRight className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="text-sm font-medium text-foreground">{route.to}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Duration</p>
                        <p className="text-sm text-foreground">{route.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-0.5">From</p>
                        <p className="text-lg font-display font-bold text-accent">{route.price}</p>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-4 gradient-accent text-accent-foreground border-0 hover:opacity-90 gap-1 text-xs">
                      Book Now <ArrowRight className="w-3 h-3" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <>
              <SectionHeading badge="Visa Services" title="Popular Visa Destinations" description="Fast processing times and expert assistance for all major countries." />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                {visaCountries.map((visa, i) => (
                  <motion.div
                    key={visa.country}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-2xl p-5 shadow-card hover-lift"
                  >
                    <h3 className="font-display font-semibold text-foreground mb-1">{visa.country}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{visa.type}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-accent" />
                        Processing: {visa.processing}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-accent" />
                        Document review included
                      </div>
                      <div className="flex items-center gap-2 text-xs text-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-accent" />
                        Interview preparation
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-display font-bold text-accent">{visa.price}</span>
                      <Button size="sm" onClick={handleVisaApply} className="gradient-accent text-accent-foreground border-0 hover:opacity-90 text-xs gap-1">
                        Apply <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: CheckCircle, title: "Best Prices", desc: "Price match guarantee" },
              { icon: Calendar, title: "Instant Booking", desc: "Real-time confirmation" },
              { icon: FileText, title: "E-Tickets", desc: "Paperless travel" },
              { icon: Users, title: "24/7 Support", desc: "Always here to help" },
            ].map((feat) => (
              <div key={feat.title} className="text-center">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-3">
                  <feat.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground">{feat.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TicketVisaPage;
