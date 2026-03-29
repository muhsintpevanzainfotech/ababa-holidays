export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export const DEFAULT_IMAGE = '/public/defaults/default_travel.png';

export const getImageUrl = (path) => {
  if (!path) return `${IMAGE_BASE_URL}${DEFAULT_IMAGE}`;
  if (path.startsWith('http')) return path;
  
  // Replace backslashes with forward slashes and remove leading slashes
  const cleanPath = path.toString().replace(/\\/g, '/').replace(/^\/+/, '');
  return `${IMAGE_BASE_URL}/${cleanPath}`;
};
