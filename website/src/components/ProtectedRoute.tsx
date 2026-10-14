import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store";

interface ProtectedRouteProps {
  children: ReactNode;
  requireVendor?: boolean;
}

export const ProtectedRoute = ({ children, requireVendor = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const token = localStorage.getItem("userToken") || localStorage.getItem("token");

  const hasToken = Boolean(token && token.trim() !== "");

  if (!hasToken && !isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} state={{ from: location }} replace />;
  }

  if (requireVendor && user && user.role !== "Vendor" && user.role !== "Vendor-Staff" && user.role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
