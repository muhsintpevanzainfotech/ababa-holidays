import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Lock,
  User,
  Building2,
  Search,
  CheckCircle2,
  Printer,
  Share2,
  HelpCircle,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Calendar,
  Layers,
  Scale
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PolicySkeleton from "@/components/PolicySkeleton";
import { getPoliciesApi, PolicyItem } from "@/api/endpoints";
import { defaultPolicyData, PolicyDocument } from "@/data/defaultPolicies";
import { useToast } from "@/hooks/use-toast";

export interface PolicyLayoutProps {
  initialType: "Terms & Conditions" | "Refund & Cancellation" | "Privacy Policy";
  initialTarget?: "User" | "Vendor";
}

const policyNavTabs = [
  {
    type: "Terms & Conditions" as const,
    label: "Terms & Conditions",
    path: "/terms",
    icon: Scale,
    description: "Platform usage rules & booking guidelines"
  },
  {
    type: "Refund & Cancellation" as const,
    label: "Refund & Cancellation",
    path: "/refund",
    icon: RotateCcw,
    description: "Refund windows, timelines & cancellation slabs"
  },
  {
    type: "Privacy Policy" as const,
    label: "Privacy Policy",
    path: "/privacy",
    icon: Lock,
    description: "Data security, encryption & privacy controls"
  }
];

export const PolicyLayout: React.FC<PolicyLayoutProps> = ({
  initialType,
  initialTarget = "User"
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const targetFromUrl = searchParams.get("target");
  const validTarget: "User" | "Vendor" =
    targetFromUrl === "Vendor" || targetFromUrl === "vendor"
      ? "Vendor"
      : targetFromUrl === "User" || targetFromUrl === "user"
      ? "User"
      : initialTarget;

  const [activeType, setActiveType] = useState<"Terms & Conditions" | "Refund & Cancellation" | "Privacy Policy">(initialType);
  const [activeTarget, setActiveTarget] = useState<"User" | "Vendor">(validTarget);
  const [loading, setLoading] = useState(true);
  const [apiPolicies, setApiPolicies] = useState<PolicyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string>("");

  // Sync state if URL search params change
  useEffect(() => {
    if (targetFromUrl === "Vendor" || targetFromUrl === "vendor") {
      setActiveTarget("Vendor");
    } else if (targetFromUrl === "User" || targetFromUrl === "user") {
      setActiveTarget("User");
    }
  }, [targetFromUrl]);

  // Fetch policies from backend API with skeleton loading
  useEffect(() => {
    let isMounted = true;
    const fetchPolicyData = async () => {
      setLoading(true);
      try {
        const data = await getPoliciesApi({
          type: activeType,
          target: activeTarget
        });
        if (isMounted) {
          setApiPolicies(data || []);
        }
      } catch (err) {
        console.error("Failed to load policy from API:", err);
      } finally {
        if (isMounted) {
          // Slight debounce for smooth animation
          setTimeout(() => setLoading(false), 280);
        }
      }
    };

    fetchPolicyData();

    return () => {
      isMounted = false;
    };
  }, [activeType, activeTarget]);

  // Handle audience switcher (User vs Vendor)
  const handleTargetChange = (newTarget: "User" | "Vendor") => {
    setActiveTarget(newTarget);
    setSearchParams({ target: newTarget });
  };

  // Get active fallback document
  const defaultDoc: PolicyDocument = useMemo(() => {
    const categoryDocs = defaultPolicyData[activeType] || defaultPolicyData["Terms & Conditions"];
    return categoryDocs[activeTarget] || categoryDocs["User"];
  }, [activeType, activeTarget]);

  // Combined sections (if backend has custom policy items, prioritize them or merge)
  const displayContent = useMemo(() => {
    if (apiPolicies && apiPolicies.length > 0) {
      // Look for a matching policy item
      const exactMatch = apiPolicies.find(
        (p) => p.type === activeType && p.target === activeTarget
      ) || apiPolicies[0];

      if (exactMatch && exactMatch.content) {
        return {
          isCustomHtml: true,
          title: exactMatch.title || defaultDoc.title,
          content: exactMatch.content,
          updatedAt: exactMatch.updatedAt || defaultDoc.effectiveDate,
          sections: defaultDoc.sections
        };
      }
    }

    return {
      isCustomHtml: false,
      title: defaultDoc.title,
      content: "",
      updatedAt: defaultDoc.effectiveDate,
      sections: defaultDoc.sections
    };
  }, [apiPolicies, activeType, activeTarget, defaultDoc]);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return defaultDoc.sections;
    const q = searchQuery.toLowerCase();
    return defaultDoc.sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary?.toLowerCase().includes(q) ||
        sec.content.some((c) => c.toLowerCase().includes(q)) ||
        sec.subsections?.some(
          (sub) =>
            sub.subtitle.toLowerCase().includes(q) ||
            sub.details.toLowerCase().includes(q)
        )
    );
  }, [defaultDoc.sections, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Policy Link Copied!",
      description: "Direct link to this legal document has been copied to your clipboard."
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent/20">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          {/* TOP BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-6 overflow-x-auto">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-muted-foreground">Legal & Compliance</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-accent font-semibold">{activeType}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">
              {activeTarget === "User" ? "Traveler (User)" : "Partner (Vendor)"}
            </span>
          </div>

          {/* DUAL PERSONA SWITCHER & HERO BANNER */}
          <div className="relative rounded-3xl overflow-hidden border border-border/70 bg-gradient-to-br from-card via-card/90 to-card/60 p-6 md:p-10 shadow-xl backdrop-blur-xl mb-8">
            {/* Ambient Background Blur Spot */}
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Top Meta Badges & Quick Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Official Compliance Standard</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted border border-border/60 text-muted-foreground text-xs font-medium">
                    <Calendar className="h-3 w-3" />
                    <span>Effective: {displayContent.updatedAt}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified Active</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all shadow-sm active:scale-95"
                    title="Copy direct link"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all shadow-sm active:scale-95"
                    title="Print legal policy"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Print / PDF</span>
                  </button>
                </div>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground tracking-tight">
                  {displayContent.title}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground max-w-3xl leading-relaxed">
                  {defaultDoc.tagline}
                </p>
              </div>

              {/* AUDIENCE SELECTOR (TRAVELER VS VENDOR PARTNER) */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Audience Persona:
                </span>
                <div className="inline-flex p-1 rounded-2xl bg-muted/70 border border-border/80 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleTargetChange("User")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      activeTarget === "User"
                        ? "bg-card text-foreground shadow-md border border-border/60 scale-[1.02]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <User className="h-4 w-4 text-sky-500" />
                    <span>Traveler / User Policy</span>
                    {activeTarget === "User" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTargetChange("Vendor")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      activeTarget === "Vendor"
                        ? "bg-card text-foreground shadow-md border border-border/60 scale-[1.02]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Building2 className="h-4 w-4 text-accent" />
                    <span>Partner / Vendor Policy</span>
                    {activeTarget === "Vendor" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* POLICY NAVIGATION TABS (Terms, Refund, Privacy) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {policyNavTabs.map((tab) => {
              const Icon = tab.icon;
              const isCurrent = activeType === tab.type;
              return (
                <Link
                  key={tab.type}
                  to={`${tab.path}?target=${activeTarget}`}
                  onClick={() => setActiveType(tab.type)}
                  className={`group flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all shrink-0 shadow-sm ${
                    isCurrent
                      ? "bg-accent/15 border-accent/40 text-accent ring-2 ring-accent/20"
                      : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/60"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isCurrent ? "text-accent" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {/* MAIN POLICY CONTENT OR SKELETON */}
          {loading ? (
            <PolicySkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: POLICY SECTIONS (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Search in Policy Clauses */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search within ${activeType} clauses...`}
                    className="w-full rounded-2xl bg-card border border-border/80 pl-11 pr-4 py-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 shadow-sm transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Summary Banner */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-3.5">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="font-bold text-foreground">Executive Overview</p>
                    <p className="text-muted-foreground leading-relaxed">
                      {defaultDoc.summary}
                    </p>
                  </div>
                </div>

                {/* Custom Backend HTML Content (if provided by CMS/Admin) */}
                {displayContent.isCustomHtml && displayContent.content && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-4 prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: displayContent.content }}
                  />
                )}

                {/* Structured Sections */}
                <div className="space-y-5">
                  {filteredSections.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
                      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                      <h4 className="font-bold text-base text-foreground">No matching clauses found</h4>
                      <p className="text-xs text-muted-foreground">
                        Try searching with different keywords such as "payment", "cancellation", "escrow", or "KYC".
                      </p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="rounded-xl bg-muted px-4 py-2 text-xs font-bold text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                      >
                        Reset Search
                      </button>
                    </div>
                  ) : (
                    filteredSections.map((section, idx) => (
                      <motion.div
                        key={section.id || idx}
                        id={section.id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="rounded-2xl border border-border/70 bg-card p-6 sm:p-7 shadow-sm hover:border-border transition-all space-y-4 scroll-mt-28"
                      >
                        {/* Section Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                          <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                            {section.title}
                          </h3>
                          {section.badge && (
                            <span className="rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-[11px] font-bold text-accent">
                              {section.badge}
                            </span>
                          )}
                        </div>

                        {/* Summary Pill */}
                        {section.summary && (
                          <p className="text-xs font-semibold text-accent/90 italic">
                            Summary: {section.summary}
                          </p>
                        )}

                        {/* Paragraph Blocks */}
                        <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {section.content.map((paragraph, pIdx) => (
                            <p key={pIdx}>{paragraph}</p>
                          ))}
                        </div>

                        {/* Subsections if any */}
                        {section.subsections && section.subsections.length > 0 && (
                          <div className="pt-2 space-y-3">
                            {section.subsections.map((sub, sIdx) => (
                              <div
                                key={sIdx}
                                className="rounded-xl border border-border/60 bg-muted/40 p-4 space-y-1.5"
                              >
                                <h4 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                  <span>{sub.subtitle}</span>
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                                  {sub.details}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Slabs Breakdown Table specifically for Refund & Cancellation */}
                {activeType === "Refund & Cancellation" && activeTarget === "User" && (
                  <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-5 w-5 text-accent" />
                      <h4 className="font-display font-bold text-base text-foreground">
                        Standard Cancellation Refund Matrix
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm text-left">
                        <thead>
                          <tr className="border-b border-border bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                            <th className="py-3 px-4 rounded-l-xl">Notice Period</th>
                            <th className="py-3 px-4">Refund Percentage</th>
                            <th className="py-3 px-4 rounded-r-xl">Processing Mode</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          <tr>
                            <td className="py-3 px-4 font-semibold text-foreground">&gt; 15 Days Before Departure</td>
                            <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">90% Refund</td>
                            <td className="py-3 px-4 text-muted-foreground">Original Payment / Wallet</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-semibold text-foreground">7 to 14 Days</td>
                            <td className="py-3 px-4 text-sky-600 dark:text-sky-400 font-bold">75% Refund</td>
                            <td className="py-3 px-4 text-muted-foreground">Original Payment / Wallet</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-semibold text-foreground">3 to 6 Days (72-144 Hours)</td>
                            <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-bold">50% Refund</td>
                            <td className="py-3 px-4 text-muted-foreground">Original Payment / Wallet</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-semibold text-foreground">&lt; 72 Hours or No-Show</td>
                            <td className="py-3 px-4 text-red-500 font-bold">Non-Refundable</td>
                            <td className="py-3 px-4 text-muted-foreground">Pre-committed partner costs</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: QUICK JUMP, STATUTORY BADGES & SUPPORT (4 Cols) */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
                {/* Table of Contents / Quick Jump */}
                <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-accent" />
                    <h4 className="font-display font-bold text-sm text-foreground">
                      Document Quick Index
                    </h4>
                  </div>
                  <nav className="space-y-1">
                    {defaultDoc.sections.map((sec) => (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        onClick={() => setActiveSectionId(sec.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          activeSectionId === sec.id
                            ? "bg-accent/15 text-accent font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <span className="truncate">{sec.title}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Legal Accreditations & Compliance Badges */}
                <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
                  <h4 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Statutory Compliance</span>
                  </h4>
                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Consumer Protection Act (2019) Compliant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Digital Personal Data Protection (DPDP) Act 2023</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>PCI-DSS Level 1 Encrypted Gateways</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>RBI Escrow Regulated Payout Cycles</span>
                    </li>
                  </ul>
                </div>

                {/* Legal Support & Contact Card */}
                <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card to-muted/40 p-5 space-y-3.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-accent" />
                    <h4 className="font-display font-bold text-sm text-foreground">
                      Have Legal Questions?
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Our Legal and Compliance Desk is available to assist travelers and vendor partners with clarifications.
                  </p>

                  <div className="space-y-2 pt-1 text-xs">
                    <a
                      href="mailto:legal@dotravels.com"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span>legal@dotravels.com</span>
                    </a>
                    <a
                      href="tel:+914711234567"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span>+91 471 123 4567 (Ext. 4)</span>
                    </a>
                  </div>

                  <Link
                    to="/contact"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl gradient-accent px-4 py-2.5 text-xs font-bold text-accent-foreground transition-all hover:opacity-95 active:scale-95 shadow-md mt-2"
                  >
                    <span>Contact Grievance Officer</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PolicyLayout;
