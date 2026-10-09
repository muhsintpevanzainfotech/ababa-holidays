import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import GlobalScrollEffects from "@/components/GlobalScrollEffects";
import FloatingActionWidgets from "@/components/FloatingActionWidgets";
import { WishlistProvider } from "@/contexts/WishlistContext";

const Index = lazy(() => import("./pages/Index.tsx"));
const ServicesPage = lazy(() => import("./pages/ServicesPage.tsx"));
const SubServicePage = lazy(() => import("./pages/SubServicePage.tsx"));
const PackagesPage = lazy(() => import("./pages/PackagesPage.tsx"));
const PackageDetailsPage = lazy(() => import("./pages/PackageDetailsPage.tsx"));
const BookingPage = lazy(() => import("./pages/BookingPage.tsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.tsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.tsx"));
const DashboardPage = lazy(() => import("./pages/DashboardPage.tsx"));
const WishlistPage = lazy(() => import("./pages/WishlistPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.tsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.tsx"));
const PlannerPage = lazy(() => import("./pages/PlannerPage.tsx"));
const BlogPage = lazy(() => import("./pages/BlogPage.tsx"));
const BlogDetailsPage = lazy(() => import("./pages/BlogDetailsPage.tsx"));
const VendorStorePage = lazy(() => import("./pages/VendorStorePage.tsx"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Loading page...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WishlistProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GlobalScrollEffects />
          <FloatingActionWidgets />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/service" element={<ServicesPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/packages/:id" element={<PackageDetailsPage />} />
              <Route path="/vendor/:id" element={<VendorStorePage />} />
              <Route path="/booking/:id" element={<BookingPage />} />
              <Route path="/ticket-visa" element={<Navigate to="/packages" replace />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/planner/:threadId?" element={<PlannerPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </WishlistProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
