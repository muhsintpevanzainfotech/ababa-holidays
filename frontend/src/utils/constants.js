export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // Replace backslashes with forward slashes and remove leading slashes
  const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${IMAGE_BASE_URL}/${cleanPath}`;
};
