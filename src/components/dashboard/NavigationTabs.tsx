"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export type NavigationTab =
  | "trips"
  | "qualityCheckTickets"
  | "purchaseInvoices";

interface NavigationTabsProps {
  activeTab: NavigationTab;
  isDriver: boolean;
}

export default function NavigationTabs({
  activeTab,
  isDriver,
}: NavigationTabsProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleNavigation = (section: NavigationTab) => {
    switch (section) {
      case "trips":
        router.push("/trips");
        break;
      case "qualityCheckTickets":
        router.push("/quality-checks");
        break;
      case "purchaseInvoices":
        router.push("/purchase-invoices");
        break;
    }
  };

  return (
    <>
      {/* Desktop Tiles */}
      <div className="p-3 hidden sm:block">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3">
            {/* Trips Tile - Only show for drivers */}
            {isDriver && (
              <button
                onClick={() => handleNavigation("trips")}
                className={`flex-1 min-w-0 p-4 rounded-xl border transition-all duration-200 ${
                  activeTab === "trips"
                    ? "bg-primary-50 border-primary-300 shadow-md shadow-primary-200/50"
                    : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                }`}
              >
                <div className="text-center">
                  <h3
                    className={`font-semibold ${
                      activeTab === "trips"
                        ? "text-primary-800"
                        : "text-gray-700"
                    }`}
                  >
                    {t("trips")}
                  </h3>
                </div>
              </button>
            )}

            {/* Quality Check Tickets Tile */}
            <button
              onClick={() => handleNavigation("qualityCheckTickets")}
              className={`flex-1 min-w-0 p-4 rounded-xl border transition-all duration-200 ${
                activeTab === "qualityCheckTickets"
                  ? "bg-primary-50 border-primary-300 shadow-md shadow-primary-200/50"
                  : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
              }`}
            >
              <div className="text-center">
                <h3
                  className={`font-semibold ${
                    activeTab === "qualityCheckTickets"
                      ? "text-primary-800"
                      : "text-gray-700"
                  }`}
                >
                  {t("qualityCheckTickets")}
                </h3>
              </div>
            </button>

            {/* Purchase Invoices Tile */}
            <button
              onClick={() => handleNavigation("purchaseInvoices")}
              className={`flex-1 min-w-0 p-4 rounded-xl border transition-all duration-200 ${
                activeTab === "purchaseInvoices"
                  ? "bg-primary-50 border-primary-300 shadow-md shadow-primary-200/50"
                  : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
              }`}
            >
              <div className="text-center">
                <h3
                  className={`font-semibold ${
                    activeTab === "purchaseInvoices"
                      ? "text-primary-800"
                      : "text-gray-700"
                  }`}
                >
                  {t("purchaseInvoices")}
                </h3>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex justify-around items-center">
          {/* Trips Tab - Only show for drivers */}
          {isDriver && (
            <button
              onClick={() => handleNavigation("trips")}
              className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 ${
                activeTab === "trips"
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="w-6 h-6 mb-1">
                <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
              </div>
              <span className="text-xs font-medium">{t("trips")}</span>
            </button>
          )}

          {/* Quality Check Tickets Tab */}
          <button
            onClick={() => handleNavigation("qualityCheckTickets")}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 ${
              activeTab === "qualityCheckTickets"
                ? "bg-primary-50 text-primary-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="w-6 h-6 mb-1">
              <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <span className="text-xs font-medium">
              {t("qualityCheckTickets")}
            </span>
          </button>

          {/* Purchase Invoices Tab */}
          <button
            onClick={() => handleNavigation("purchaseInvoices")}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 ${
              activeTab === "purchaseInvoices"
                ? "bg-primary-50 text-primary-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="w-6 h-6 mb-1">
              <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h10c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
              </svg>
            </div>
            <span className="text-xs font-medium">{t("purchaseInvoices")}</span>
          </button>
        </div>
      </div>
    </>
  );
}
