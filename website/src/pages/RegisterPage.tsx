import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/store";
import { loginSuccess } from "@/store/slices/authSlice";
import { registerApi, verifyOtpApi, requestForgotOtpApi } from "@/api/endpoints";
import OtpInput from "@/components/auth/OtpInput";

const RegisterPage = () => {
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  // Resend timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Password strength calculation
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

  // Step 1: Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    if (password !== confirmPw) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await registerApi({ name, email, phone, pass: password });
      setStep(2);
      setCountdown(60);
      toast({
        title: "Registration Submitted!",
        description: `We've sent a 6-digit verification code to ${email}`,
      });
    } catch (err: any) {
      toast({
        title: "Registration Error",
        description: err.message || "Failed to create account. Email may already be registered.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (countdown > 0 || !email) return;
    setIsLoading(true);
    try {
      await requestForgotOtpApi({ email });
      setCountdown(60);
      toast({
        title: "New Verification Code Sent",
        description: `Check your inbox at ${email} for the new 6-digit OTP.`,
      });
    } catch (err: any) {
      toast({
        title: "Resend Failed",
        description: err.message || "Failed to send new code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP & Auto Sign In
  const handleVerifyOtp = async (e?: React.FormEvent, codeToSubmit?: string) => {
    if (e) e.preventDefault();
    const code = codeToSubmit || otpCode;
    if (!code || code.length < 6) {
      toast({ title: "Please enter the full 6-digit code", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtpApi({ email, otp: code });
      const token = res.accessToken || res.token || "demo-jwt-token-xyz123";
      const user = {
        id: res._id || "u-102",
        name: res.name || name,
        email: res.email || email,
        phone: phone || res.phone,
        role: res.role || "user",
      };

      dispatch(loginSuccess({ token, user }));
      toast({
        title: "Account Verified Successfully! 🎉",
        description: `Welcome to dotravels, ${user.name}! Your account is ready.`,
      });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message || "Invalid or expired OTP code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background Lighting Elements */}
      <div className="absolute top-1/3 right-1/4 w-[480px] h-[480px] bg-accent/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[360px] h-[360px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10 my-6"
      >
        {/* Header Branding */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-xl blur-md group-hover:blur-lg transition-all" />
              <img
                src="/favicon.png"
                alt="dotravels Logo"
                width={44}
                height={44}
                style={{ width: "44px", height: "44px", minWidth: "44px", minHeight: "44px", objectFit: "contain" }}
                className="relative shrink-0 rounded-xl shadow-md p-1 bg-background border border-border/60"
              />
            </div>
            <span className="text-2xl font-display font-extrabold tracking-tight text-foreground group-hover:text-accent transition-colors">
              dotravels
            </span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join 50,000+ Happy Travelers</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
            {step === 1 ? "Create Your Account" : "Verify Your Email OTP"}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm max-w-sm mx-auto">
            {step === 1
              ? "Start exploring Kerala, international tours, and bespoke holiday packages"
              : `Enter the 6-digit code sent to ${email} to complete your registration`}
          </p>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              step === 1
                ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                : "bg-accent/20 text-accent"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-background/30 flex items-center justify-center text-[10px]">1</span>
            Account Info
          </div>
          <div className="w-6 h-[2px] bg-border" />
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              step === 2
                ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-background/30 flex items-center justify-center text-[10px]">2</span>
            OTP Verification
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-card/90 backdrop-blur-xl border border-border/80 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* STEP 1: Registration Details */}
            {step === 1 && (
              <motion.form
                key="step-1"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-4"
              >
                <div>
                  <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Full Name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="pl-10 h-11 rounded-xl bg-background/50 border-border/80 focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Email Address</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="pl-10 h-11 rounded-xl bg-background/50 border-border/80 focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Phone Number</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="pl-10 h-11 rounded-xl bg-background/50 border-border/80 focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 rounded-xl bg-background/50 border-border/80 focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`flex-1 h-full transition-all duration-300 ${
                              lvl <= strength.score ? strength.color : "bg-muted-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground">{strength.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Confirm Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPw ? "text" : "password"}
                      required
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 h-11 rounded-xl bg-background/50 border-border/80 focus:border-accent"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 rounded-xl gap-2 font-bold text-sm shadow-lg shadow-accent/20 transition-all mt-3"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Continue to OTP Verification
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.form>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between bg-accent/5 p-3.5 rounded-2xl border border-accent/20 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ShieldCheck className="w-4.5 h-4.5 text-accent shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">OTP Sent to</div>
                      <div className="truncate text-foreground font-semibold">{email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-accent text-xs font-bold hover:underline shrink-0 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Edit
                  </button>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider block text-center mb-1.5">
                    Enter 6-Digit Code
                  </Label>
                  <OtpInput
                    value={otpCode}
                    onChange={setOtpCode}
                    disabled={isLoading}
                    onComplete={(code) => handleVerifyOtp(undefined, code)}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground">Didn't receive the OTP?</span>
                  {countdown > 0 ? (
                    <span className="text-accent font-semibold flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-accent hover:underline font-bold"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={(e) => handleVerifyOtp(e)}
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 rounded-xl gap-2 font-bold text-sm shadow-lg shadow-accent/20 transition-all mt-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-4.5 h-4.5" />
                      Verify OTP & Complete Registration
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center justify-center gap-1 pt-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Registration Form
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
