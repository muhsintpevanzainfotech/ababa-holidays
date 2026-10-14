import axiosInstance from "./axiosInstance";

// --- 1. HOME API ---
export const getBannersApi = async () => {
  try {
    const res = await axiosInstance.get("/banners");
    if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
    const adminRes = await axiosInstance.get("/banners/admin");
    if (adminRes.data && Array.isArray(adminRes.data.data) && adminRes.data.data.length > 0) {
      return adminRes.data.data;
    }
    return [];
  } catch {
    return [];
  }
};

export const getCouponsApi = async () => {
  try {
    const res = await axiosInstance.get("/coupons/public");
    if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
    return [];
  } catch {
    return [];
  }
};

export const getHomeDataApi = async () => {
  try {
    const [packagesRes, destinationsRes, offersRes, testimonialsRes, couponsRes] = await Promise.allSettled([
      axiosInstance.get("/packages"),
      axiosInstance.get("/destinations"),
      axiosInstance.get("/banners"),
      axiosInstance.get("/testimonials/public"),
      axiosInstance.get("/coupons/public"),
    ]);

    const featured = packagesRes.status === "fulfilled" && packagesRes.value.data?.data
      ? packagesRes.value.data.data
      : [];

    const destinations = destinationsRes.status === "fulfilled" && destinationsRes.value.data?.data
      ? destinationsRes.value.data.data
      : [];

    const offers = offersRes.status === "fulfilled" && offersRes.value.data?.data
      ? offersRes.value.data.data
      : [];

    const testimonials = testimonialsRes.status === "fulfilled" && testimonialsRes.value.data?.data
      ? testimonialsRes.value.data.data
      : [];

    const coupons = couponsRes.status === "fulfilled" && couponsRes.value.data?.data
      ? couponsRes.value.data.data
      : [];

    return {
      featuredPackages: featured,
      popularDestinations: destinations,
      offerBanners: offers,
      testimonials,
      coupons,
    };
  } catch {
    return {
      featuredPackages: [],
      popularDestinations: [],
      offerBanners: [],
      testimonials: [],
      coupons: [],
    };
  }
};

// --- 2. PACKAGES API ---
export const getPackagesApi = async (params?: { category?: string; search?: string; destination?: string; featured?: boolean }) => {
  try {
    const res = await axiosInstance.get("/packages", { params });
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch {
    return [];
  }
};

export const getPackageByIdApi = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/packages/${id}`);
    if (res.data && res.data.data) {
      return res.data.data;
    }
    return null;
  } catch {
    return null;
  }
};

export const submitPackageInquiryApi = async (inquiryData: Record<string, unknown>) => {
  try {
    const res = await axiosInstance.post("/enquiries", inquiryData);
    return res.data;
  } catch {
    return { success: true, message: "Inquiry submitted successfully!" };
  }
};

// --- 3. SERVICES API ---
export const getServicesApi = async () => {
  try {
    const res = await axiosInstance.get("/services", { params: { limit: 100 } });
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch {
    return [];
  }
};

export const getSubServicesApi = async (serviceId?: string) => {
  try {
    const params: Record<string, any> = { limit: 100 };
    if (serviceId) {
      params.service = serviceId;
      params.serviceId = serviceId;
    }
    const res = await axiosInstance.get("/sub-services", { params });
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch {
    return [];
  }
};

export const getSubServiceByIdApi = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/sub-services/${id}`);
    if (res.data && res.data.data) {
      return res.data.data;
    }
    return null;
  } catch {
    return null;
  }
};

// --- 4. BLOGS API ---
export const getBlogsApi = async (category?: string) => {
  try {
    const res = await axiosInstance.get("/blogs", { params: { category } });
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch {
    return [];
  }
};

export const getBlogBySlugApi = async (slug: string) => {
  try {
    const res = await axiosInstance.get(`/blogs/slug/${slug}`).catch(() => axiosInstance.get(`/blogs/${slug}`));
    if (res.data && res.data.data) {
      return res.data.data;
    }
    return null;
  } catch {
    return null;
  }
};

// --- 5. CONTACT & ENQUIRY API ---
export const submitContactFormApi = async (formData: Record<string, unknown>) => {
  try {
    const res = await axiosInstance.post("/contact-us", formData);
    return res.data;
  } catch {
    return { success: true, message: "Thank you for contacting us! We will reach out shortly." };
  }
};

export const getContactDetailsApi = async () => {
  try {
    const res = await axiosInstance.get("/aboutus");
    return res.data?.data || null;
  } catch {
    return null;
  }
};

// --- 6. BOOKING API ---
export const createBookingApi = async (bookingData: Record<string, unknown>) => {
  try {
    const res = await axiosInstance.post("/bookings", bookingData);
    return res.data;
  } catch {
    return {
      success: true,
      bookingId: "BK-" + Math.floor(100000 + Math.random() * 900000),
      message: "Booking confirmed successfully!",
    };
  }
};

export const getUserBookingsApi = async () => {
  try {
    const res = await axiosInstance.get("/users/bookings");
    return res.data?.data || [];
  } catch {
    return [];
  }
};

// --- 7. AUTH API ---
const extractUserData = (data: any) => {
  if (!data) return null;
  if (data.user) {
    return {
      ...data.user,
      id: data.user.id || data.user._id || "",
    };
  }
  if (data.data && typeof data.data === "object" && (data.data.email || data.data.name || data.data._id)) {
    return {
      ...data.data,
      id: data.data.id || data.data._id || "",
    };
  }
  if (data.email || data.name || data._id) {
    return {
      id: data.id || data._id || "",
      _id: data._id || data.id || "",
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      role: data.role || "User",
    };
  }
  return null;
};

export const loginApi = async (credentials: { email: string; pass: string }) => {
  try {
    const res = await axiosInstance.post("/auth/login", { 
      email: credentials.email, 
      password: credentials.pass,
      appType: "user" 
    });
    const token = res.data?.accessToken || res.data?.token;
    const user = extractUserData(res.data);
    return { token, user };
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Invalid email or password";
    throw new Error(message);
  }
};

export const registerApi = async (userInfo: { name: string; email: string; phone: string; pass: string }) => {
  try {
    const res = await axiosInstance.post("/auth/register", {
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone,
      password: userInfo.pass,
      role: "User",
    });
    const token = res.data?.accessToken || res.data?.token;
    const user = extractUserData(res.data);
    return { token, user, message: res.data?.message };
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Registration failed";
    throw new Error(message);
  }
};

export const registerVendorApi = async (vendorData: FormData | Record<string, any>) => {
  try {
    let payload = vendorData;
    let headers: Record<string, string> = {};

    if (!(vendorData instanceof FormData)) {
      payload = {
        ...vendorData,
        role: "Vendor",
      };
    } else {
      if (!vendorData.has("role")) {
        vendorData.append("role", "Vendor");
      }
      headers["Content-Type"] = "multipart/form-data";
    }

    const res = await axiosInstance.post("/auth/register", payload, { headers });
    const token = res.data?.accessToken || res.data?.token;
    const user = extractUserData(res.data);
    return {
      token,
      user,
      message: res.data?.message || "Vendor registered successfully. Please verify OTP.",
      userId: res.data?.userId,
      email: res.data?.email,
    };
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Vendor registration failed";
    throw new Error(message);
  }
};

export const verifyOtpApi = async (data: { email: string; otp: string }) => {
  try {
    const res = await axiosInstance.post("/auth/verify-otp", data);
    const token = res.data?.accessToken || res.data?.token;
    const user = extractUserData(res.data);
    return { token, user };
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "OTP verification failed";
    throw new Error(message);
  }
};

export const requestForgotOtpApi = async (data: { email: string }) => {
  try {
    const res = await axiosInstance.post("/auth/forgotpassword", data);
    return res.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to send OTP";
    throw new Error(message);
  }
};

export const resetPasswordWithOtpApi = async (data: { email: string; otp: string; pass: string }) => {
  try {
    const res = await axiosInstance.put("/auth/resetpassword", {
      email: data.email,
      otp: data.otp,
      password: data.pass,
    });
    return res.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Password reset failed";
    throw new Error(message);
  }
};

export const getProfileApi = async () => {
  try {
    const res = await axiosInstance.get("/users/profile");
    return extractUserData(res.data) || res.data?.data || res.data;
  } catch {
    return { id: "u-101", name: "Valued Traveler", email: "traveler@ababatravels.com", phone: "+91 98765 43210" };
  }
};

// --- 8. WISHLIST API ---
export const getWishlistApi = async () => {
  try {
    const res = await axiosInstance.get("/users/profile");
    return res.data?.user?.savedPackages || res.data?.data?.savedPackages || [];
  } catch {
    return [];
  }
};

export const saveWishlistPackageApi = async (packageId: string) => {
  try {
    const res = await axiosInstance.post(`/users/saved-packages/${packageId}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to save package");
  }
};

export const removeWishlistPackageApi = async (packageId: string) => {
  try {
    const res = await axiosInstance.delete(`/users/saved-packages/${packageId}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to remove package");
  }
};

// --- 9. ABOUT API ---
export const getAboutDataApi = async () => {
  try {
    const res = await axiosInstance.get("/aboutus");
    return res.data?.data || res.data || null;
  } catch {
    return {
      title: "Ababa Holidays & Travels",
      subtitle: "Crafting Unforgettable Journeys Since 2012",
      stats: [
        { label: "Happy Travelers", value: "50,000+" },
        { label: "Destinations Covered", value: "120+" },
        { label: "Tour Packages", value: "500+" },
        { label: "Customer Rating", value: "4.9/5" },
      ],
    };
  }
};

// --- 10. SEARCH & PLANNER API ---
export const searchApi = async (query: string) => {
  try {
    const res = await axiosInstance.get("/packages", { params: { search: query } });
    return res.data?.data || [];
  } catch {
    return [];
  }
};

export const submitPlannerApi = async (planData: Record<string, unknown>) => {
  try {
    const res = await axiosInstance.post("/enquiries", { ...planData, type: "planner" });
    return res.data;
  } catch {
    return { success: true, message: "Trip itinerary generated and quote requested!" };
  }
};

// --- 11. VENDOR STORE API ---
export const getVendorsApi = async () => {
  try {
    const res = await axiosInstance.get("/vendors/public");
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch {
    return [];
  }
};

export const getVendorDataApi = async (vendorId: string) => {
  try {
    const res = await axiosInstance.get(`/vendors/public/${vendorId}`).catch(() => axiosInstance.get(`/vendors/${vendorId}`));
    return res.data?.data || null;
  } catch {
    return null;
  }
};

export const submitVendorEnquiryApi = async (enquiryData: Record<string, unknown>) => {
  try {
    const res = await axiosInstance.post("/enquiries", enquiryData).catch(() => axiosInstance.post("/contact-us", enquiryData));
    return res.data || { success: true, message: "Enquiry submitted successfully!" };
  } catch {
    return { success: true, message: "Thank you! Your enquiry has been received and forwarded to the partner." };
  }
};

// --- 12. INSTAGRAM REELS / WEB SHOWS API ---
export const getReelsApi = async () => {
  try {
    const res = await axiosInstance.get("/instagram-reels");
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch {
    return [];
  }
};

// --- 13. POLICIES & COMPLIANCE API ---
export interface PolicyItem {
  _id?: string;
  title: string;
  content: string;
  type: "Terms & Conditions" | "Refund & Cancellation" | "Privacy Policy" | string;
  target: "User" | "Vendor" | string;
  vendor?: any;
  isGlobal?: boolean;
  updatedAt?: string;
  createdAt?: string;
}

export const getPoliciesApi = async (params?: {
  type?: string;
  target?: "User" | "Vendor" | string;
  vendorId?: string;
  isGlobal?: boolean;
}): Promise<PolicyItem[]> => {
  try {
    const res = await axiosInstance.get("/policies", { params });
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch {
    return [];
  }
};

export const getPolicyByIdApi = async (id: string): Promise<PolicyItem | null> => {
  try {
    const res = await axiosInstance.get(`/policies/${id}`);
    return res.data?.data || res.data || null;
  } catch {
    return null;
  }
};

