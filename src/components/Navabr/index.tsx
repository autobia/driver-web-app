"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { RootState } from "../../store/store";
import { useGetDriverTripsQuery } from "../../store/api/tripsApi";
import { useGetQualityChecksQuery } from "../../store/api/qualityChecksApi";
import LogoutButton from "./LogoutButton";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // Check if user is a driver to show trips
  const isDriver =
    user?.role?.name_en?.toLowerCase().includes("driver") || false;

  // Fetch data for badge counts
  const { data: tripsData } = useGetDriverTripsQuery(undefined, {
    skip: !isAuthenticated || !isDriver,
  });

  const { data: qualityChecksData } = useGetQualityChecksQuery(
    {
      userId: user?.user_id || 0,
      status: "pending,in_progress",
    },
    {
      skip: !isAuthenticated || !user?.user_id,
    }
  );

  // Calculate counts for badges
  const tripsCount = tripsData?.trips?.length || 0;
  const qualityChecksCount = qualityChecksData?.length || 0;
  const purchaseInvoicesCount = 0; // TODO: Add API call when available

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Get current active tab based on pathname
  const getActiveTab = () => {
    if (pathname.includes("/trips")) return "trips";
    if (pathname.includes("/quality-checks")) return "qualityCheckTickets";
    if (pathname.includes("/purchase-invoices")) return "purchaseInvoices";
    return "";
  };

  const activeTab = getActiveTab();

  const navigationItems = [
    ...(isDriver
      ? [
          {
            key: "trips",
            label: t("trips"),
            path: "/trips",
            count: tripsCount,
            icon: (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            ),
          },
        ]
      : []),
    {
      key: "qualityCheckTickets",
      label: t("qualityCheckTickets"),
      path: "/quality-checks",
      count: qualityChecksCount,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      ),
    },
    {
      key: "purchaseInvoices",
      label: t("purchaseInvoices"),
      path: "/purchase-invoices",
      count: purchaseInvoicesCount,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h10c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-primary-100/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand - Start side (left in LTR, right in RTL) */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handleNavigation("/")}
              className="text-3xl font-bold text-primary-600 tracking-tight hover:text-primary-700 transition-colors duration-200 cursor-pointer"
            >
              {t("autobia")}
            </button>
          </div>

          {/* Desktop Navigation - Center */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center justify-center flex-1 max-w-2xl mx-8">
              <nav
                className={`flex ${
                  isRTL ? "space-x-reverse space-x-6" : "space-x-6"
                }`}
                aria-label="Main navigation"
              >
                {navigationItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNavigation(item.path)}
                    className={`group relative flex items-center ${
                      isRTL ? "space-x-reverse space-x-2" : "space-x-2"
                    } px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      activeTab === item.key
                        ? "text-primary-600 bg-primary-50/80 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {/* Active indicator */}
                    {activeTab === item.key && (
                      <div className="absolute inset-x-0 -bottom-2 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                    )}

                    <span
                      className={`transition-colors duration-200 ${
                        activeTab === item.key
                          ? "text-primary-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="whitespace-nowrap font-semibold">
                      {item.label}
                    </span>

                    {/* Count Badge */}
                    {item.count > 0 && (
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
                          activeTab === item.key
                            ? "bg-primary-600 text-white"
                            : "bg-red-500 text-white group-hover:bg-red-600"
                        }`}
                      >
                        {item.count > 99 ? "99+" : item.count}
                      </span>
                    )}

                    {/* Active badge */}
                    {activeTab === item.key && (
                      <div
                        className={`absolute -top-1 ${
                          isRTL ? "-left-1" : "-right-1"
                        } w-2 h-2 bg-primary-500 rounded-full animate-pulse`}
                      ></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Actions - End side (right in LTR, left in RTL) */}
          <div
            className={`flex items-center ${
              isRTL ? "space-x-reverse space-x-4" : "space-x-4"
            }`}
          >
            <LanguageSwitcher />
            {isAuthenticated && <LogoutButton />}
          </div>
        </div>
      </div>
    </nav>
  );
}
