"use client";

import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../../store/store";
import { useGetDriverTripsQuery } from "../../store/api/tripsApi";
import { useGetQualityChecksQuery } from "../../store/api/qualityChecksApi";
import { useGetUnShippedOrdersQuery } from "../../store/api/saleOrderApi";

export type NavigationTab =
  | "trips"
  | "qualityCheckTickets"
  | "purchaseInvoices"
  | "ordersDelivery";

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
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

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

  const { data: salesOrdersData } = useGetUnShippedOrdersQuery(undefined, {
    skip: !isAuthenticated || !isDriver,
  });

  const { searchResults } = useSelector(
    (state: RootState) => state.purchaseOrder
  );

  // Calculate counts for badges
  const tripsCount = tripsData?.trips?.length || 0;
  const qualityChecksCount = qualityChecksData?.length || 0;
  const purchaseInvoicesCount = searchResults?.length || 0;
  const ordersDeliveryCount = salesOrdersData?.length || 0;

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
      case "ordersDelivery":
        router.push("/orders-delivery");
        break;
    }
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex justify-around items-center">
          {/* Trips Tab - Only show for drivers */}
          {isDriver && (
            <button
              onClick={() => handleNavigation("trips")}
              className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 relative ${
                activeTab === "trips"
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="w-6 h-6 mb-1 relative">
                <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
                {tripsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {tripsCount > 9 ? "9+" : tripsCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{t("trips")}</span>
            </button>
          )}

          {/* Quality Check Tickets Tab */}
          <button
            onClick={() => handleNavigation("qualityCheckTickets")}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 relative ${
              activeTab === "qualityCheckTickets"
                ? "bg-primary-50 text-primary-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="w-6 h-6 mb-1 relative">
              <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              {qualityChecksCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {qualityChecksCount > 9 ? "9+" : qualityChecksCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">
              {t("qualityCheckTickets")}
            </span>
          </button>

          {/* Purchase Invoices Tab */}
          <button
            onClick={() => handleNavigation("purchaseInvoices")}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 relative ${
              activeTab === "purchaseInvoices"
                ? "bg-primary-50 text-primary-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="w-6 h-6 mb-1 relative">
              <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h10c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
              </svg>
              {purchaseInvoicesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {purchaseInvoicesCount > 9 ? "9+" : purchaseInvoicesCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{t("purchaseInvoices")}</span>
          </button>

          {/* Orders Delivery Tab */}
          {isDriver && (
            <button
              onClick={() => handleNavigation("ordersDelivery")}
              className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 relative ${
                activeTab === "ordersDelivery"
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="w-6 h-6 mb-1 relative">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14zM6 11h12v2H6zm0-4h12v2H6zm0 8h12v2H6z" />
                </svg>
                {ordersDeliveryCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {ordersDeliveryCount > 9 ? "9+" : ordersDeliveryCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{t("ordersDelivery")}</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
