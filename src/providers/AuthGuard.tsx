"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

interface AuthGuardProps {
  children: ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login"];

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated && !isPublicRoute) {
        // Redirect to login if not authenticated and not on a public route
        router.push("/login");
      } else if (isAuthenticated && isPublicRoute) {
        // Redirect to home if authenticated but on a public route (like login)
        router.push("/");
      }
    }
  }, [isAuthenticated, isPublicRoute, isInitialized, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show loading while redirecting
  if (
    (!isAuthenticated && !isPublicRoute) ||
    (isAuthenticated && isPublicRoute)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
