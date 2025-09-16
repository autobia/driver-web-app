"use client";

import { useTranslations } from "next-intl";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";

export default function LogoutButton() {
  const t = useTranslations();
  const handleLogout = () => {
    // Add logout logic here
    console.log("Logout clicked");
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
      title={t("logout") || "Logout"}
      aria-label={t("logout") || "Logout"}
    >
      <ArrowLeftStartOnRectangleIcon className="h-6 w-6" />
    </button>
  );
}
