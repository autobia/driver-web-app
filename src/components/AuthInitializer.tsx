"use client";

import { useAuth } from "../hooks/useAuth";
import { ReactNode } from "react";

interface AuthInitializerProps {
  children: ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  // This will initialize auth state and handle route protection
  useAuth();

  return <>{children}</>;
}
