"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { RootState } from "../store/store";
import { initializeAuth, logout } from "../store/slices/authSlice";

// Routes that don't require authentication
const publicRoutes = ["/login", "/404"];

// Interface for decoded JWT token
interface DecodedToken {
  exp: number;
  user_id: number;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, token, user } = useSelector(
    (state: RootState) => state.auth
  );

  const isTokenValid = (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Initialize auth state from localStorage on app start
    if (!isAuthenticated) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Check authentication status when pathname changes
    const isPublicRoute = publicRoutes.includes(pathname);

    if (token) {
      // Check if token is still valid
      if (!isTokenValid(token)) {
        // Token expired, logout user
        dispatch(logout());
        if (!isPublicRoute) {
          router.push("/login");
        }
        return;
      }

      // User is authenticated with valid token
      if (pathname === "/login") {
        // Redirect authenticated user away from login page
        router.push("/");
      }
    } else {
      // No token, user is not authenticated
      if (!isPublicRoute) {
        // Redirect to login for protected routes
        router.push("/login");
      }
    }
  }, [token, pathname, dispatch, router]);

  return {
    isAuthenticated: isAuthenticated && token && isTokenValid(token),
    user,
    token,
  };
};

export default useAuth;
