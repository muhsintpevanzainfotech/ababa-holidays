import { PackagePricing } from "@/types/travel";

export const getPackagePricing = (pkg: any): PackagePricing => {
  if (!pkg) return { price: 0, listPrice: 0 };
  const loc = (pkg.location || "").toLowerCase();
  const isKerala = loc.includes("kerala");
  const isBeach = pkg.category === "Beach";
  const discountPercent = pkg.discountPercent ?? (isKerala ? 30 : isBeach ? 40 : undefined);
  const listPrice = pkg.originalPrice ?? pkg.price ?? 0;

  if (!discountPercent) {
    return { price: pkg.price ?? listPrice, listPrice };
  }

  return {
    price: Math.round(listPrice * (1 - discountPercent / 100)),
    listPrice,
    offerCode: pkg.offerCode || (isKerala ? "KERALA30" : "EARLY25"),
    discountPercent,
  };
};
