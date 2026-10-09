import { useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Award, Headphones, Users, Globe, MapPin, Plane, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeading from "@/components/SectionHeading";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchAboutStart } from "@/store/slices/aboutSlice";

import destSantorini from "@/assets/dest-santorini.jpg";
import destBali from "@/assets/dest-bali.jpg";
import destDubai from "@/assets/dest-dubai.jpg";

const stats = [
  { value: "50K+", label: "Happy Travelers" },
  { value: "120+", label: "Destinations" },
  { value: "8+", label: "Years Experience" },
  { value: "24/7", label: "Customer Support" },
];

const values = [
  { icon: Shield, title: "Trust & Safety", desc: "Every booking is secure and backed by our comprehensive protection policies." },
  { icon: Award, title: "Quality First", desc: "We partner only with verified, top-rated hotels, airlines, and local operators." },
  { icon: Heart, title: "Passion for Travel", desc: "Our team of travel enthusiasts crafts every experience with love and care." },
  { icon: Headphones, title: "Always Here for You", desc: "Round-the-clock support so you're never alone, no matter where you are." },
];

const team = [
  { name: "Sarah Mitchell", role: "CEO & Founder", image: destSantorini },
  { name: "Ahmed Al-Rashid", role: "Head of Operations", image: destDubai },
  { name: "Emily Chen", role: "Customer Experience Lead", image: destBali },
];

const AboutPage = () => {
  const dispatch = useAppDispatch();
  const { aboutData, loading } = useAppSelector((state) => state.about);

  useEffect(() => {
    dispatch(fetchAboutStart());
  }, [dispatch]);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 md:pt-32">
        <div className="bg-background py-16 md:py-24 border-none">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/15 text-accent text-xs font-bold mb-4">About Us</span>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
                We Make Travel <span className="text-accent">Unforgettable</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Since 2018, dotravels has been helping travelers discover the world's most extraordinary destinations with personalized, hassle-free experiences.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 -mt-16 md:-mt-20 relative z-10">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 md:p-8 text-center">
                <div className="text-2xl md:text-4xl font-display font-bold gradient-text mb-1">{stat.value}</div>
                <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative">
                <img src={destSantorini} alt="Our story" className="rounded-3xl w-full h-64 md:h-80 object-cover" />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-background">
                  <img src={destBali} alt="Travel" className="w-full h-full object-cover" />
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-3">Our Story</span>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">From a Small Idea to a Global Platform</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                What started as a passion project by a group of travel enthusiasts has grown into one of the most trusted travel booking platforms. We believe travel should be accessible, seamless, and deeply personal.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Today, we serve over 50,000 travelers annually, offering curated packages across 120+ destinations. Our team of local experts ensures every trip is authentic and unforgettable.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="Our Values" title="What Drives Us" description="The principles that guide everything we do." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 max-w-5xl mx-auto">
            {values.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl p-6 text-center hover-lift">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading badge="Our Team" title="Meet the People Behind the Magic" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {team.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden mb-4 ring-4 ring-accent/20">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-display font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
