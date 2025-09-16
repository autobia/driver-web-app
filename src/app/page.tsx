"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* User Info Tile - Under Navbar */}
      {isAuthenticated && user && (
        <div className="p-3">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl border border-neutral-200 p-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Welcome Message */}
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {t("welcome")}, {user.first_name} {user.last_name}!
                  </h1>
                  <span className="text-lg">👋</span>
                </div>

                {/* User Details - ID and Role Only */}
                <div className="flex gap-2 flex-shrink-0">
                  {/* User ID Badge */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 min-w-0">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-700">
                        {t("userId")}:
                      </span>
                      <span className="text-sm font-bold text-blue-900">
                        {user.user_id}
                      </span>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 min-w-0">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span className="text-sm font-medium text-emerald-700">
                        {t("role")}:
                      </span>
                      <span className="text-sm font-bold text-emerald-900">
                        {locale === "ar"
                          ? user.role.name_ar
                          : user.role.name_en}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{/* Content will go here */}</div>
      </div>
    </div>
  );
}
