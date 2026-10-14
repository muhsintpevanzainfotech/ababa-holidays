import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getVendorSlug(vendor: any): string {
  if (!vendor) return "partner";
  const name = vendor.companyName || vendor.name;
  if (name && typeof name === "string" && name.trim()) {
    const slug = slugify(name);
    if (slug) return slug;
  }
  return vendor.id || vendor._id || "partner";
}
