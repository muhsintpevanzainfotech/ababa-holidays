import type { LucideIcon } from "lucide-react";

export interface PackageData {
  id: string;
  image: string;
  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  duration: string;
  rating: number;
  reviews: number;
  category: string;
  featured?: boolean;
  topRated?: boolean;
  description: string;
  itinerary: string[];
  included: string[];
  gallery: string[];
}

export interface PackagePricing {
  price: number;
  listPrice: number;
  offerCode?: string;
  discountPercent?: number;
}

export interface SubServiceItem {
  id: string;
  name: string;
  description: string;
  badge: string;
  image: string;
  icon?: string;
  iconName: string;
  path: string;
}

export interface ServiceCategoryItem {
  id: string;
  name: string;
  tagline: string;
  image: string;
  badge: string;
  path: string;
  subServices: SubServiceItem[];
}

export interface SubService {
  name: string;
  description: string;
  price: string;
  image: string;
  features: string[];
}

export interface ServiceData {
  icon?: LucideIcon;
  title: string;
  description: string;
  longDescription?: string;
  slug: string;
  image: string;
  heroImage?: string;
  subs?: SubService[];
  relatedPackageCategory?: string;
  offerBanner?: { title: string; subtitle: string; code: string; discount: string };
}

export interface FeaturedServiceItem {
  id: string;
  name: string;
  title?: string;
  badge?: string;
  tagline?: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaPath?: string;
}

export interface ServicePackageItem {
  id: string;
  serviceId: string;
  title: string;
  location: string;
  duration: string;
  image: string;
  price: number;
  originalPrice: number;
  discountBadge: string;
  rating: number;
  reviews: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "Kerala" | "Guides" | "Tips" | "Hotels" | "Visa" | "Transport" | string;
  coverImage: string;
  readTime: string;
  publishedDate: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  featured?: boolean;
  tags: string[];
  content: {
    intro: string;
    keyTakeaways: string[];
    sections: {
      heading: string;
      body: string;
      image?: string;
      quote?: string;
    }[];
    conclusion: string;
  };
}
