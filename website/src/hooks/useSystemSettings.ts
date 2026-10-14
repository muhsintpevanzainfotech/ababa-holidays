import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";

export interface CustomContactItem {
  id?: string;
  label: string;
  value: string;
}

export interface CustomSocialItem {
  id?: string;
  title: string;
  url: string;
}

export interface SystemContactDetails {
  primaryPhone?: string;
  supportPhone?: string;
  emergencyPhone?: string;
  primaryEmail?: string;
  supportEmail?: string;
  bookingEmail?: string;
  address?: string;
  workingHours?: string;
  mapEmbedUrl?: string;
  customContacts?: CustomContactItem[];
}

export interface SystemSocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
  pinterest?: string;
  telegram?: string;
  customLinks?: CustomSocialItem[];
}

export const isAvailable = (val?: string | null): boolean => {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed.length === 0) return false;
  const lower = trimmed.toLowerCase();
  return lower !== "n/a" && lower !== "none" && lower !== "null" && lower !== "undefined";
};

export const getDisplayValue = (val?: string | null, fallback = "Not available"): string => {
  return isAvailable(val) ? (val as string).trim() : fallback;
};

export const useSystemSettings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      const [contactRes, socialRes] = await Promise.allSettled([
        axiosInstance.get("/settings/contact-details"),
        axiosInstance.get("/settings/social-links"),
      ]);

      const contactDetails: SystemContactDetails =
        contactRes.status === "fulfilled" && contactRes.value.data?.success && contactRes.value.data.contactDetails
          ? contactRes.value.data.contactDetails
          : {};

      const socialLinks: SystemSocialLinks =
        socialRes.status === "fulfilled" && socialRes.value.data?.success && socialRes.value.data.socialLinks
          ? socialRes.value.data.socialLinks
          : {};

      return { contactDetails, socialLinks };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    contactDetails: data?.contactDetails || {},
    socialLinks: data?.socialLinks || {},
    loading: isLoading,
  };
};

export default useSystemSettings;
