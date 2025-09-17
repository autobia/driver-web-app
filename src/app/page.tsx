"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { RootState } from "../store/store";

function DashboardRedirect() {
  const { user, isInitialized } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    if (isInitialized && user) {
      // Check if user is a driver to show trips by default
      const isDriver =
        user?.role?.name_en?.toLowerCase().includes("driver") || false;
      const defaultRoute = isDriver ? "/trips" : "/quality-checks";

      router.replace(defaultRoute);
    }
  }, [user, router, isInitialized]);

  if (!isInitialized) {
    // Show loading while auth is initializing
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">{t("loading")}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return <DashboardRedirect />;
}
