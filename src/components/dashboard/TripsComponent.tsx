"use client";

import { useTranslations } from "next-intl";
import { useGetDriverTripsQuery } from "../../store/api/tripsApi";

export default function TripsComponent() {
  const t = useTranslations();
  const { data: tripsData, isLoading, error } = useGetDriverTripsQuery();

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
        <div className="space-y-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Trip #{trip.trip_number}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        trip.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : trip.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>{t("from")}:</strong> {trip.origin} →{" "}
                      <strong>{t("to")}:</strong> {trip.destination}
                    </p>
                    <p>
                      <strong>{t("departure")}:</strong>{" "}
                      {new Date(trip.departure_time).toLocaleString()}
                    </p>
                    {trip.arrival_time && (
                      <p>
                        <strong>{t("arrival")}:</strong>{" "}
                        {new Date(trip.arrival_time).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-600">
                    ${trip.fare}
                  </div>
                  <div className="text-sm text-gray-500">{trip.distance}km</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
