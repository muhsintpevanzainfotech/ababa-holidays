import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  BadgeCheck,
  MapPin,
  Briefcase,
  Layers,
  CreditCard,
  FileText,
  DollarSign,
  Package,
  Compass,
  Car,
  Globe,
  Check,
  Image as ImageIcon,
  UploadCloud,
  X,
  Camera,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/store";
import { loginSuccess } from "@/store/slices/authSlice";
import { registerVendorApi, verifyOtpApi, requestForgotOtpApi } from "@/api/endpoints";
import OtpInput from "@/components/auth/OtpInput";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const vendorTypes = [
  { value: "Tour Operator", label: "Tour Operator / DMC" },
  { value: "Hotelier", label: "Hotel, Resort & Homestay Partner" },
  { value: "Fleet Operator", label: "Tourist Coach & Cab Fleet Partner" },
  { value: "Wedding Logistics", label: "Wedding & Event Logistics Specialist" },
  { value: "Pilgrimage Specialist", label: "Hajj, Umrah & Pilgrimage Organizer" },
  { value: "Activity Provider", label: "Houseboat, Cruise & Adventure Activity Host" },
  { value: "Agency", label: "Travel Agency / General Corporate Partner" },
  { value: "Individual", label: "Independent Tour Guide / Specialist" },
];

const availableServices = [
  { id: "Tour Packages", label: "Tour Packages", icon: Package },
  { id: "Hotel & Resort", label: "Hotel & Resort Stays", icon: Building2 },
  { id: "Tourist Bus Booking", label: "Tourist Bus / Coach Charter", icon: Compass },
  { id: "Wedding Trip Booking", label: "Wedding & Event Transport", icon: Sparkles },
  { id: "Transport Booking", label: "Cabs & Chauffeur Fleet", icon: Car },
  { id: "Hajj & Umrah Packages", label: "Hajj & Umrah Services", icon: Globe },
  { id: "Houseboat & Cruise", label: "Houseboat & Yacht Rentals", icon: Compass },
  { id: "Ticket & Visa Services", label: "Flight Tickets & Visas", icon: Globe },
];

const VendorRegisterPage = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [searchParams] = useSearchParams();

  // Form State - Business Details
  const [companyName, setCompanyName] = useState("");
  const [vendorType, setVendorType] = useState("Tour Operator");
  const [businessLicense, setBusinessLicense] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Tour Packages",
  ]);

  // Media / Visual Branding
  const [coverBannerFile, setCoverBannerFile] = useState<File | null>(null);
  const [coverBannerPreview, setCoverBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Contact Info
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Address
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("Kochi");
  const [state, setState] = useState("Kerala");
  const [country, setCountry] = useState("India");
  const [pincode, setPincode] = useState("");

  // Optional Tax & Bank
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountName, setAccountName] = useState("");

  // Terms agreement
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // OTP Verification
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  // Resend Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((s) => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleCoverBannerSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file (PNG, JPG, WEBP)", variant: "destructive" });
      return;
    }
    setCoverBannerFile(file);
    setCoverBannerPreview(URL.createObjectURL(file));
  };

  const handleLogoSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file (PNG, JPG, WEBP)", variant: "destructive" });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const getPasswordStrength = () => {
    if (!password) return { label: "", score: 0, color: "bg-border" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { label: "Weak", score, color: "bg-red-500" };
    if (score <= 4) return { label: "Medium", score, color: "bg-amber-500" };
    return { label: "Strong", score, color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  // Step 1: Submit Vendor Registration with Multipart Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      toast({ title: "Company / Business Name is required", variant: "destructive" });
      return;
    }

    if (!contactName.trim() || !email.trim() || !phone.trim() || !password) {
      toast({ title: "Please fill in all primary contact fields", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters long", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (!agreedToTerms) {
      toast({ title: "Please accept partner terms & conditions", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("role", "Vendor");
      formData.append("name", contactName.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("phone", phone.trim());
      formData.append("password", password);
      formData.append("companyName", companyName.trim());
      formData.append("vendorType", vendorType);
      if (businessLicense.trim()) formData.append("businessLicense", businessLicense.trim());
      formData.append("selectedServices", JSON.stringify(selectedServices));
      formData.append(
        "address",
        JSON.stringify({
          addressLine1: addressLine1.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          pincode: pincode.trim(),
        })
      );

      if (gstNumber.trim()) {
        formData.append("gst", JSON.stringify({ number: gstNumber.trim().toUpperCase() }));
      }
      if (panNumber.trim()) {
        formData.append("tin", JSON.stringify({ number: panNumber.trim().toUpperCase() }));
      }
      if (bankName.trim() || accountNumber.trim()) {
        formData.append(
          "bankDetails",
          JSON.stringify({
            bankName: bankName.trim(),
            accountNumber: accountNumber.trim(),
            ifsc: ifsc.trim().toUpperCase(),
            accountName: accountName.trim() || companyName.trim(),
          })
        );
      }

      // Append visual branding files
      if (coverBannerFile) {
        formData.append("coverBanner", coverBannerFile);
      }
      if (logoFile) {
        formData.append("avatar", logoFile);
        formData.append("logo", logoFile);
      }

      const res = await registerVendorApi(formData);

      setStep(2);
      setCountdown(60);

      toast({
        title: "Partner Registration Submitted! 🚀",
        description:
          res.message ||
          `We've sent a 6-digit verification code to ${email}. Verify your email to activate your vendor dashboard.`,
      });
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message || "Failed to create vendor account. Please verify details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || otpCode;
    if (finalCode.length < 6) {
      toast({ title: "Please enter the complete 6-digit OTP", variant: "destructive" });
      return;
    }

    setIsVerifying(true);

    try {
      const res = await verifyOtpApi({ email: email.trim().toLowerCase(), otp: finalCode });

      if (res.token && res.user) {
        dispatch(
          loginSuccess({
            token: res.token,
            user: res.user,
          })
        );
      }

      toast({
        title: "Account Activated! 🎉",
        description: "Welcome to the dotravels Travel Partner Network!",
      });

      // Redirect vendor to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err: any) {
      toast({
        title: "OTP Verification Failed",
        description: err.message || "Invalid or expired OTP. Please check and try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      await requestForgotOtpApi({ email });
      setCountdown(60);
      toast({
        title: "New OTP Sent",
        description: `Verification code sent to ${email}`,
      });
    } catch (err: any) {
      toast({
        title: "Resend Failed",
        description: err.message || "Could not resend OTP.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative overflow-hidden">
      {/* Dynamic Ambient Background Glow Elements */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[350px] h-[350px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="relative z-10 pt-24 sm:pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          {/* Header Switcher / Quick Navigation */}
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Looking to book personal trips or family vacations?</span>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-background/80 border border-border/80 text-xs font-bold text-foreground hover:text-accent hover:border-accent transition-all shadow-sm"
            >
              <User className="h-3.5 w-3.5" />
              <span>Register as Traveler</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Form-Only Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-border/80 bg-card/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative"
          >
            {/* Header / Title */}
            <div className="text-center mb-8 pb-6 border-b border-border/60">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-extrabold uppercase tracking-wider mb-3">
                <Building2 className="h-3.5 w-3.5" />
                <span>Partner Onboarding Portal</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {step === 1 ? "Register as a Travel Partner" : "Verify Your Partner Account"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
                {step === 1
                  ? "Join South India's premier verified travel marketplace. Create your vendor profile to list tour packages, bus fleets, luxury stays, and transport services."
                  : `Enter the 6-digit verification code sent to ${email} to activate your partner profile.`}
              </p>
            </div>

            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* SECTION 1: BUSINESS IDENTITY */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-border/40 pb-2">
                    <Briefcase className="h-4 w-4" />
                    <span>1. Business Details & Identity</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Company Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="companyName" className="text-xs font-semibold">
                        Company / Agency / Brand Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Royal Kerala Holidays & Travels Pvt Ltd"
                          className="pl-10 h-11 rounded-xl text-xs sm:text-sm bg-background/50 border-border/80 focus:border-accent"
                          required
                        />
                      </div>
                    </div>

                    {/* Vendor Type */}
                    <div className="space-y-1.5">
                      <Label htmlFor="vendorType" className="text-xs font-semibold">
                        Primary Category <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="vendorType"
                        value={vendorType}
                        onChange={(e) => setVendorType(e.target.value)}
                        className="w-full h-11 rounded-xl border border-border/80 bg-background/50 px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
                      >
                        {vendorTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Trade License */}
                    <div className="space-y-1.5">
                      <Label htmlFor="businessLicense" className="text-xs font-semibold">
                        Govt Reg / Trade License No. (Optional)
                      </Label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="businessLicense"
                          value={businessLicense}
                          onChange={(e) => setBusinessLicense(e.target.value)}
                          placeholder="e.g. KL-2024-TR-9884"
                          className="pl-10 h-11 rounded-xl text-xs sm:text-sm uppercase bg-background/50 border-border/80"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: BRAND VISUALS (COVER BANNER & LOGO) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-border/40 pb-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>2. Brand Visuals (Cover & Logo)</span>
                  </div>

                  <div className="space-y-4">
                    {/* Cover Banner Upload */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">Cover Banner (Store Header)</Label>
                        <span className="text-[11px] text-muted-foreground">Recommended: 1200 × 400px</span>
                      </div>

                      <div className="relative rounded-2xl border-2 border-dashed border-border hover:border-accent/60 transition-colors p-4 bg-muted/20 text-center overflow-hidden">
                        {coverBannerPreview ? (
                          <div className="relative h-40 w-full rounded-xl overflow-hidden group">
                            <img
                              src={coverBannerPreview}
                              alt="Cover Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label
                                htmlFor="coverBannerUpload"
                                className="px-3.5 py-1.5 rounded-lg bg-white text-slate-950 font-bold text-xs cursor-pointer hover:bg-white/90 transition-all shadow-md"
                              >
                                Change Image
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setCoverBannerFile(null);
                                  setCoverBannerPreview(null);
                                }}
                                className="p-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-all shadow-md"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="coverBannerUpload"
                            className="cursor-pointer flex flex-col items-center justify-center py-5 space-y-2 group"
                          >
                            <div className="h-12 w-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors">
                                Click or Drag to upload Cover Banner
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                PNG, JPG, WEBP up to 5MB
                              </p>
                            </div>
                          </label>
                        )}
                        <input
                          id="coverBannerUpload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleCoverBannerSelect(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-14 w-14 rounded-2xl bg-card border-2 border-border/80 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground">Agency Logo / Avatar</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            Displayed on vendor card & service store
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <label
                          htmlFor="logoUpload"
                          className="px-3.5 py-2 rounded-xl bg-background border border-border/80 text-xs font-bold text-foreground hover:text-accent hover:border-accent cursor-pointer transition-all shadow-sm"
                        >
                          {logoPreview ? "Change Logo" : "Upload Logo"}
                        </label>
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setLogoFile(null);
                              setLogoPreview(null);
                            }}
                            className="p-2 rounded-xl border border-border/80 text-muted-foreground hover:text-rose-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <input
                          id="logoUpload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleLogoSelect(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: SERVICES OFFERED */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                      <Layers className="h-4 w-4" />
                      <span>3. Authorized Services Provided</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Select all that apply</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {availableServices.map((srv) => {
                      const isChecked = selectedServices.includes(srv.id);
                      const Icon = srv.icon;
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => toggleService(srv.id)}
                          className={`flex flex-col items-start gap-2 p-3 rounded-2xl border text-left text-xs transition-all ${
                            isChecked
                              ? "bg-accent/15 border-accent text-accent font-bold shadow-sm ring-1 ring-accent/30"
                              : "bg-muted/20 border-border/70 text-muted-foreground hover:border-accent/40"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className={`p-1.5 rounded-lg ${isChecked ? "bg-accent/20 text-accent" : "bg-card text-muted-foreground"}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${
                                isChecked
                                  ? "bg-accent text-accent-foreground border-accent"
                                  : "border-muted-foreground/30 bg-background"
                              }`}
                            >
                              {isChecked && <Check className="h-2.5 w-2.5" />}
                            </div>
                          </div>
                          <span className="truncate text-xs leading-snug">{srv.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 4: CONTACT & CREDENTIALS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-border/40 pb-2">
                    <User className="h-4 w-4" />
                    <span>4. Account & Contact Credentials</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Authorized Person Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="contactName" className="text-xs font-semibold">
                        Authorized Contact Person / Owner Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="contactName"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="pl-10 h-11 rounded-xl text-xs sm:text-sm bg-background/50 border-border/80 focus:border-accent"
                          required
                        />
                      </div>
                    </div>

                    {/* Business Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold">
                        Official Business Email <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="partner@company.com"
                          className="pl-10 h-11 rounded-xl text-xs sm:text-sm bg-background/50 border-border/80 focus:border-accent"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone / WhatsApp */}
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-semibold">
                        WhatsApp / Mobile Number <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98470 12345"
                          className="pl-10 h-11 rounded-xl text-xs sm:text-sm bg-background/50 border-border/80 focus:border-accent"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-semibold">
                        Dashboard Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create strong password"
                          className="pl-10 pr-10 h-11 rounded-xl text-xs sm:text-sm bg-background/50 border-border/80 focus:border-accent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {password && (
                        <div className="flex items-center gap-2 pt-1">
                          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full ${strength.color} transition-all duration-300`}
                              style={{ width: `${(strength.score / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {strength.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="pl-10 h-11 rounded-xl text-xs sm:text-sm bg-background/50 border-border/80 focus:border-accent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: OPERATIONAL HUB LOCATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent border-b border-border/40 pb-2">
                    <MapPin className="h-4 w-4" />
                    <span>5. Operating Location & Address</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5 sm:col-span-3">
                      <Label htmlFor="addressLine1" className="text-xs font-semibold">
                        Office / Hub Address
                      </Label>
                      <Input
                        id="addressLine1"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="Building name, street, commercial zone"
                        className="h-11 rounded-xl text-xs sm:text-sm bg-background/50 border-border/80"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-semibold">
                        City / Hub <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Kochi, Munnar, Calicut"
                        className="h-11 rounded-xl text-xs sm:text-sm bg-background/50 border-border/80"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-xs font-semibold">
                        State
                      </Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Kerala"
                        className="h-11 rounded-xl text-xs sm:text-sm bg-background/50 border-border/80"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pincode" className="text-xs font-semibold">
                        PIN Code
                      </Label>
                      <Input
                        id="pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="682001"
                        className="h-11 rounded-xl text-xs sm:text-sm bg-background/50 border-border/80"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 6: TAX & SETTLEMENT INFO (COLLAPSIBLE / OPTIONAL) */}
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowBankDetails(!showBankDetails)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-accent" />
                      <span className="text-xs font-bold text-foreground">
                        6. Tax & Payout Account (Optional)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold">
                        Can fill later
                      </span>
                    </div>
                    {showBankDetails ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {showBankDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-border/40"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="gstNumber" className="text-xs font-semibold">
                          GST Number
                        </Label>
                        <Input
                          id="gstNumber"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          placeholder="32AAAAA0000A1Z5"
                          className="h-11 rounded-xl text-xs sm:text-sm uppercase bg-background/50 border-border/80"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="panNumber" className="text-xs font-semibold">
                          Business / Individual PAN
                        </Label>
                        <Input
                          id="panNumber"
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value)}
                          placeholder="ABCDE1234F"
                          className="h-11 rounded-xl text-xs sm:text-sm uppercase bg-background/50 border-border/80"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bankName" className="text-xs font-semibold">
                          Bank Name
                        </Label>
                        <Input
                          id="bankName"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. HDFC Bank, SBI, Federal Bank"
                          className="h-11 rounded-xl text-xs sm:text-sm bg-background/50 border-border/80"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="accountNumber" className="text-xs font-semibold">
                          Account Number
                        </Label>
                        <Input
                          id="accountNumber"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Account Number for Payouts"
                          className="h-11 rounded-xl text-xs sm:text-sm bg-background/50 border-border/80"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="pt-2 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
                    required
                  />
                  <Label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground font-normal">
                    I confirm all business details and uploaded media are accurate. I accept dotravels'{" "}
                    <Link to="/terms?target=Vendor" className="text-accent font-bold hover:underline">
                      Partner Terms & Conditions
                    </Link>
                    ,{" "}
                    <Link to="/refund?target=Vendor" className="text-accent font-bold hover:underline">
                      Cancellation Protocol
                    </Link>
                    , and{" "}
                    <Link to="/privacy?target=Vendor" className="text-accent font-bold hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl gradient-accent text-accent-foreground font-extrabold text-sm shadow-xl shadow-accent/20 gap-2 hover:opacity-95 transition-all"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Submitting Partner Onboarding...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Partner Registration</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                {/* Footer Link to Login */}
                <div className="text-center text-xs text-muted-foreground pt-2">
                  <span>Already have an active partner account? </span>
                  <Link
                    to="/login?role=vendor"
                    className="text-accent hover:underline font-bold"
                  >
                    Sign In to Partner Portal
                  </Link>
                </div>
              </form>
            ) : (
              /* STEP 2: OTP VERIFICATION */
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-3xl bg-accent/15 text-accent flex items-center justify-center mx-auto shadow-inner border border-accent/30">
                  <ShieldCheck className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Enter Verification Code
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    We dispatched a 6-digit activation code to{" "}
                    <strong className="text-foreground">{email}</strong>. Enter it below to launch your partner dashboard.
                  </p>
                </div>

                {/* OTP Input */}
                <div className="py-4 flex justify-center">
                  <OtpInput
                    length={6}
                    value={otpCode}
                    onChange={setOtpCode}
                    onComplete={handleVerifyOtp}
                    autoFocus
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2 max-w-md mx-auto">
                  <Button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={isVerifying || otpCode.length < 6}
                    className="w-full h-12 rounded-2xl gradient-accent text-accent-foreground font-extrabold text-sm shadow-xl shadow-accent/20 gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Activating Dashboard...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Verify & Launch Dashboard</span>
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Edit Information
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0}
                      className={`font-bold ${
                        countdown > 0
                          ? "text-muted-foreground cursor-not-allowed"
                          : "text-accent hover:underline"
                      }`}
                    >
                      {countdown > 0 ? `Resend Code in ${countdown}s` : "Resend Verification Code"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorRegisterPage;
