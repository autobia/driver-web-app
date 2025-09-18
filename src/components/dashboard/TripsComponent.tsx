"use client";

import { useTranslations } from "next-intl";
import { useGetDriverTripsQuery } from "../../store/api/tripsApi";

export default function TripsComponent() {
  const t = useTranslations();
  const { data: tripsData, isLoading, error } = useGetDriverTripsQuery();

  // Helper function to get status translation
  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "pending":
        return t("pending");
      case "on_the_way":
        return t("onTheWay");
      case "arrived":
        return t("arrived");
      case "cancelled":
        return t("cancelled");
      default:
        return status;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "on_the_way":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "arrived":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{t("trips")}</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2">{t("loadingTrips")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{t("trips")}</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="text-center text-red-500">
            <p>{t("errorLoadingTrips")}</p>
          </div>
        </div>
      </div>
    );
  }

  const trips = tripsData?.trips || [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t("trips")}</h2>

      {trips.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="text-center text-gray-500">
            <p>{t("noTripsMessage")}</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary-400 to-primary-500 px-4 py-3">
                <h3 className="text-base font-bold text-white tracking-wide">
                  {t("trip")}#{trip.id}
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2">
                {/* Purchase Invoice ID */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2"></div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {t("purchaseInvoice")} #{trip.object_id}
                  </p>
                </div>

                {/* Trip Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-secondary-200 rounded-full flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2"></div>
                    <span className="text-sm text-gray-700">
                      {t("status")}:
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(
                      trip.status
                    )}`}
                  >
                    {getStatusTranslation(trip.status)}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 pb-4">
                <div className="flex gap-2">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm">
                    {t("arrived")}
                  </button>
                  <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm">
                    {t("assignPreparer")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
