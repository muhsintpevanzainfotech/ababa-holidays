import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/store";
import { loginSuccess } from "@/store/slices/authSlice";
import { loginApi, verifyOtpApi, requestForgotOtpApi, resetPasswordWithOtpApi } from "@/api/endpoints";
import OtpInput from "@/components/auth/OtpInput";

type AuthTab = "password" | "otp" | "forgot";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>("password");
  
  // Password Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // OTP Login & Forgot Password state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  // Resend Timer
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  // Handle Resend Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle Standard Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const data = await loginApi({ email, pass: password });
      
      // If vendor or user requires OTP step
      if (data.needsOTP) {
        setOtpEmail(email);
        setActiveTab("otp");
        setOtpSent(true);
        setCountdown(60);
        toast({
          title: "Verification Required",
          description: "An OTP has been sent to your email to complete sign-in.",
        });
        return;
      }

      // Successful direct login
      const token = data.accessToken || data.token || "demo-jwt-token-xyz123";
      const user = {
        id: data._id || data.user?.id || "u-101",
        name: data.name || data.user?.name || email.split("@")[0],
        email: data.email || email,
        phone: data.phone || data.user?.phone,
        role: data.role || "user",
      };

      dispatch(loginSuccess({ token, user }));
      toast({ title: "Welcome back!", description: `Signed in successfully as ${user.name}` });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Request OTP for OTP Login or Forgot Password
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = otpEmail || email;
    if (!targetEmail) {
      toast({ title: "Please enter your email address", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await requestForgotOtpApi({ email: targetEmail });
      setOtpEmail(targetEmail);
      setOtpSent(true);
      setCountdown(60);
      toast({
        title: "OTP Code Sent!",
        description: `We have sent a 6-digit code to ${targetEmail}`,
      });
    } catch (err: any) {
      toast({
        title: "Could not send OTP",
        description: err.message || "Please check your email and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (countdown > 0 || !otpEmail) return;
    setIsLoading(true);
    try {
      await requestForgotOtpApi({ email: otpEmail });
      setCountdown(60);
      toast({
        title: "New Code Sent",
        description: `A fresh 6-digit OTP code has been dispatched to ${otpEmail}`,
      });
    } catch (err: any) {
      toast({
        title: "Resend Failed",
        description: err.message || "Failed to resend code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP for Quick Sign-In
  const handleVerifyOtpLogin = async (e?: React.FormEvent, codeToSubmit?: string) => {
    if (e) e.preventDefault();
    const code = codeToSubmit || otpCode;
    if (!code || code.length < 6) {
      toast({ title: "Please enter a valid 6-digit OTP code", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtpApi({ email: otpEmail, otp: code });
      const token = res.accessToken || res.token || "demo-jwt-token-xyz123";
      const user = {
        id: res._id || "u-101",
        name: res.name || otpEmail.split("@")[0],
        email: res.email || otpEmail,
        phone: res.phone,
        role: res.role || "user",
      };

      dispatch(loginSuccess({ token, user }));
      toast({
        title: "OTP Verified!",
        description: `Welcome back, ${user.name}! Access granted.`,
      });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message || "Invalid or expired OTP code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password via OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      toast({ title: "Please enter the 6-digit OTP code", variant: "destructive" });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "New password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordWithOtpApi({ email: otpEmail, otp: otpCode, pass: newPassword });
      toast({
        title: "Password Reset Successful!",
        description: "Your password has been updated. You can now sign in.",
      });
      setActiveTab("password");
      setPassword(newPassword);
      setEmail(otpEmail);
      setOtpSent(false);
      setOtpCode("");
    } catch (err: any) {
      toast({
        title: "Reset Failed",
        description: err.message || "Invalid OTP or request expired.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Dynamic Ambient Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[380px] h-[380px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[320px] h-[320px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10 my-6"
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
            <span>Secure Modern Authentication</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
            {activeTab === "password" && "Welcome Back"}
            {activeTab === "otp" && "OTP Verification"}
            {activeTab === "forgot" && "Reset Your Password"}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm max-w-xs mx-auto">
            {activeTab === "password" && "Sign in to access your bookings, itineraries and saved trips"}
            {activeTab === "otp" && (otpSent ? `Enter the 6-digit code sent to ${otpEmail}` : "Sign in quickly using your registered email OTP")}
            {activeTab === "forgot" && (otpSent ? `Enter code and set new password` : "Receive a 6-digit code to recover your account")}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-card/90 backdrop-blur-xl border border-border/80 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          {/* Top Tab Switcher */}
          <div className="flex bg-muted/60 p-1 rounded-2xl mb-6 border border-border/40">
            <button
              type="button"
              onClick={() => {
                setActiveTab("password");
                setOtpSent(false);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "password"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("otp");
                setOtpEmail(email);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "otp"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              OTP Sign In
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* 1. PASSWORD LOGIN TAB */}
            {activeTab === "password" && (
              <motion.form
                key="password-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handlePasswordLogin}
                className="space-y-4"
              >
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
                      className="pl-10 h-11 rounded-xl bg-background/50 border-border/80 focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Password</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("forgot");
                        setOtpEmail(email);
                      }}
                      className="text-xs text-accent hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 rounded-xl bg-background/50 border-border/80 focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 rounded-xl gap-2 font-bold text-sm shadow-lg shadow-accent/20 transition-all mt-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/60" /></div>
                  <div className="relative flex justify-center text-[11px]"><span className="bg-card px-3 text-muted-foreground uppercase font-semibold">Or fast access</span></div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setActiveTab("otp");
                    setOtpEmail(email);
                  }}
                  className="w-full gap-2 h-11 rounded-xl border-border/80 font-medium text-xs hover:bg-accent/5 hover:text-accent hover:border-accent/40"
                >
                  <KeyRound className="w-4 h-4 text-accent" />
                  Sign In with 6-Digit OTP Code
                </Button>
              </motion.form>
            )}

            {/* 2. OTP LOGIN TAB */}
            {activeTab === "otp" && (
              <motion.div
                key="otp-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                {!otpSent ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Your Email Address</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          required
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="pl-10 h-11 rounded-xl bg-background/50 border-border/80"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        We will send a 6-digit verification code to this email.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 rounded-xl gap-2 font-bold text-sm shadow-md mt-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          Get 6-Digit OTP Code
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-accent/5 p-3 rounded-xl border border-accent/20 text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                        <span className="truncate text-foreground font-medium">{otpEmail}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-accent text-[11px] font-semibold hover:underline shrink-0"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider block text-center mb-1">
                        Enter 6-Digit Verification Code
                      </Label>
                      <OtpInput
                        value={otpCode}
                        onChange={setOtpCode}
                        disabled={isLoading}
                        onComplete={(code) => handleVerifyOtpLogin(undefined, code)}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-muted-foreground">Didn't receive code?</span>
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
                      onClick={(e) => handleVerifyOtpLogin(e)}
                      disabled={isLoading || otpCode.length < 6}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 rounded-xl gap-2 font-bold text-sm shadow-lg shadow-accent/20 transition-all mt-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Verifying Code...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Verify & Sign In
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. FORGOT PASSWORD TAB */}
            {activeTab === "forgot" && (
              <motion.div
                key="forgot-tab"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="space-y-4"
              >
                {!otpSent ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Account Email</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          required
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="pl-10 h-11 rounded-xl bg-background/50 border-border/80"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Enter your email to receive a password reset OTP code.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 rounded-xl gap-2 font-bold text-sm shadow-md"
                    >
                      {isLoading ? "Sending..." : "Send Reset Code"}
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider block text-center mb-1">
                        6-Digit Reset Code
                      </Label>
                      <OtpInput value={otpCode} onChange={setOtpCode} disabled={isLoading} />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">New Password</Label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type={showNewPw ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="pl-10 pr-10 h-11 rounded-xl bg-background/50 border-border/80"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        >
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || otpCode.length < 6 || !newPassword}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 rounded-xl gap-2 font-bold text-sm shadow-md mt-2"
                    >
                      {isLoading ? "Updating Password..." : "Update Password & Sign In"}
                    </Button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("password");
                    setOtpSent(false);
                  }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center justify-center gap-1.5 pt-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Password Sign In
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Prompt */}
        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
          Don't have an account yet?{" "}
          <Link to="/register" className="text-accent hover:underline font-bold">
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
