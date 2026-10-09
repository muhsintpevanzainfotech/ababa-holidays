export const BACKEND_IMAGE_URL = (
  import.meta.env.VITE_IMAGE_BASE_URL ||
  (import.meta.env.VITE_API_URL || "http://localhost:9000/api").replace(/\/api\/?$/, "")
).replace(/\/$/, "");

export const getImageUrl = (src?: string | null, fallback = "/favicon.png"): string => {
  if (!src || typeof src !== "string" || src.trim() === "" || src === "undefined" || src === "null") {
    return fallback;
  }

  const clean = src.trim().replace(/\\/g, "/");

  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }

  if (clean.startsWith("/uploads/") || clean.startsWith("uploads/")) {
    const relative = clean.startsWith("/") ? clean : `/${clean}`;
    return `${BACKEND_IMAGE_URL}${relative}`;
  }

  if (clean.startsWith("/public/") || clean.startsWith("public/")) {
    const relative = clean.startsWith("/") ? clean : `/${clean}`;
    return `${BACKEND_IMAGE_URL}${relative}`;
  }

  if (clean.startsWith("/")) {
    return clean;
  }

  return `${BACKEND_IMAGE_URL}/${clean}`;
};

export default getImageUrl;

