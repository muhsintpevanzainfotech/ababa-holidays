/**
 * Helper utilities for JWT token decoding and validation
 */

export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  if (!decoded.exp) return false;

  // Current time in seconds vs exp time (with a 10s buffer)
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp <= currentTime + 10;
};
