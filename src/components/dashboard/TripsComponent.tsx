"use client";

import { useTranslations } from "next-intl";
import {
  useGetDriverTripsQuery,
  useUpdateTripLocationMutation,
  useCreateAdvancedTripMutation,
} from "../../store/api/tripsApi";
import { useCreateQualityCheckMutation } from "../../store/api/qualityChecksApi";
import {
  useFetchUsersQuery,
  useFetchContentTypesQuery,
} from "../../store/api/coreApi";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function TripsComponent() {
  const t = useTranslations();
  const { data: tripsData, isLoading, error } = useGetDriverTripsQuery();
  const [updateTripLocation] = useUpdateTripLocationMutation();
  const [createAdvancedTrip] = useCreateAdvancedTripMutation();
  const [createQualityCheck] = useCreateQualityCheckMutation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [locationLoadingTripId, setLocationLoadingTripId] = useState<
    number | null
  >(null);

  // Assign Preparer Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTripForAssign, setSelectedTripForAssign] = useState<
    number | null
  >(null);
  const [selectedPreparer, setSelectedPreparer] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch preparers (role_id = 11)
  const { data: preparersData } = useFetchUsersQuery({ role_id: 11 });

  // Fetch content types for driver app
  const { data: driverAppContentTypes } = useFetchContentTypesQuery({
    type_name: "driver_app",
  });

  console.warn(
    "Driver App Content Types:",
    driverAppContentTypes?.content_types
  );
  // Constants from Flutter code
  const QUALITY_CHECK_CONTENT_TYPE = 48;
  const WAREHOUSE_CONTENT_TYPE = 32;

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

  // Function to handle "going" button click - directly call createTrip
  const handleGoingClick = async (tripId: number) => {
    if (!user) {
      console.error("User not logged in");
      return;
    }

    const trip = trips.find((t) => t.id === tripId);
    if (!trip) {
      console.error("Trip not found");
      return;
    }

    setLocationLoadingTripId(tripId);

    try {
      // Get current location using browser's geolocation API
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
          }

          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Update trip location with current coordinates
      await updateTripLocation({
        tripId,
        data: {
          confirm_start_point_lat: latitude,
          confirm_start_point_long: longitude,
        },
      }).unwrap();

      console.log(
        `Trip ${tripId} location updated successfully for going action`
      );
    } catch (error) {
      console.error("Error in going flow:", error);
      // You could add toast notification here for error feedback
    } finally {
      setLocationLoadingTripId(null);
    }
  };

  // Function to handle "arrived" button click - complete Flutter "On The Way" case logic
  const handleArrivedClick = async (tripId: number) => {
    if (!user) {
      console.error("User not logged in");
      return;
    }

    const trip = trips.find((t) => t.id === tripId);
    if (!trip) {
      console.error("Trip not found");
      return;
    }

    setLocationLoadingTripId(tripId);

    try {
      // Get current location using browser's geolocation API
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
          }

          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Get allowed content types for driver app - same as Flutter logic
      const allowedContentTypes = driverAppContentTypes?.content_types || [];
      const isContentTypeAllowed = allowedContentTypes.some(
        (contentType) => contentType.content_type_id === trip.content_type
      );

      if (isContentTypeAllowed) {
        // Content type is allowed for driver app operations
        if (trip.content_type !== QUALITY_CHECK_CONTENT_TYPE) {
          console.log("Getting the quality check");

          // Create quality check for non-QC content types
          const qualityCheckResult = await createQualityCheck({
            content_type: trip.content_type,
            object_id: trip.object_id,
            quality_checker: user.user_id,
          }).unwrap();

          console.log("Quality Check fetched.......");

          // Update trip location with destination coordinates
          await updateTripLocation({
            tripId,
            data: {
              confirm_destination_point_lat: latitude,
              confirm_destination_point_long: longitude,
            },
          }).unwrap();

          console.log("Update trip latitude and longitude");

          if (qualityCheckResult.id) {
            console.log("Quality Check created");

            // Check if destination point has company_id (equivalent to Flutter check)
            if (trip.destination_point?.company_id != null) {
              console.log(
                "Trip has company destination - would navigate to QC screen in Flutter"
              );
              // In Flutter, this would fetch QC details and navigate to QualityCheck screen
              // Here we can trigger a navigation or show success message
            } else {
              console.log("Purchase Order Updated");
              // You could add toast notification here: "Purchase Order Updated"
            }
          }
        } else {
          console.log("Content Type is of type quality check");

          // Handle quality check content type
          if (trip.trip_direction === "bring") {
            if (trip.has_delayed_item === true) {
              // Update trip with create_delayed_qc flag
              await updateTripLocation({
                tripId,
                data: {
                  confirm_destination_point_lat: latitude,
                  confirm_destination_point_long: longitude,
                  create_delayed_qc: true,
                },
              }).unwrap();

              console.log("Trip updated with delayed QC flag");
            } else {
              console.log(
                "The specified trip indicates that there is a delayed items upon it, so we create a quality check for it"
              );

              // Create a new delivery trip
              if (trip.main_source?.warehouse?.id) {
                const newTripResult = await createAdvancedTrip({
                  content_type: trip.content_type,
                  object_id: trip.object_id,
                  destination_point: trip.main_source.warehouse.id.toString(),
                  destination_point_type: WAREHOUSE_CONTENT_TYPE,
                  trip_direction: "deliver",
                  assign_to: user.user_id.toString(),
                  user_type: "user",
                }).unwrap();

                if (newTripResult.id) {
                  // Update original trip location
                  await updateTripLocation({
                    tripId,
                    data: {
                      confirm_destination_point_lat: latitude,
                      confirm_destination_point_long: longitude,
                    },
                  }).unwrap();

                  console.log(
                    "New delivery trip created and original trip updated"
                  );
                }
              }
            }
          } else if (trip.trip_direction === "deliver") {
            try {
              // For deliver trips, just update location
              await updateTripLocation({
                tripId,
                data: {
                  confirm_destination_point_lat: latitude,
                  confirm_destination_point_long: longitude,
                },
              }).unwrap();

              console.log("Delivery trip location updated");
            } catch (deliverError) {
              // Handle API errors like in Flutter
              const apiError = deliverError as { data?: { context?: string } };
              if (apiError?.data?.context) {
                console.error("API Error:", apiError.data.context);
                // You could add toast notification here with apiError.data.context
              } else {
                console.error(
                  "An error occur while validating PO status button"
                );
                // You could add toast notification here: "An error occur while validating PO status button"
              }
            }
          }
        }
      } else {
        // Content type not allowed
        console.error(
          "An error occur while validating PO status button - content type not allowed"
        );
        // You could add toast notification here: "An error occur while validating PO status button"
      }
    } catch (error) {
      console.error(
        "A general error occurs when validating a trip with status on_the_way content_type:",
        error
      );
      // You could add toast notification here: "An error occur while validating PO status button"
    } finally {
      setLocationLoadingTripId(null);
    }
  };

  // Function to handle opening assign preparer modal
  const handleAssignPreparerClick = (tripId: number) => {
    setSelectedTripForAssign(tripId);
    setSelectedPreparer(null);
    setShowAssignModal(true);
  };

  // Function to handle closing assign preparer modal
  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedTripForAssign(null);
    setSelectedPreparer(null);
  };

  // Function to handle assign preparer submission - complete Flutter logic
  const handleAssignPreparerSubmit = async () => {
    if (!user || !selectedTripForAssign || !selectedPreparer) {
      console.error("Missing required data for preparer assignment");
      return;
    }

    const trip = trips.find((t) => t.id === selectedTripForAssign);
    if (!trip) {
      console.error("Trip not found");
      return;
    }

    setIsAssigning(true);

    try {
      // Step 1: If trip status is pending, update trip location first
      if (trip.status === "pending") {
        await updateTripLocation({
          tripId: selectedTripForAssign,
          data: {
            confirm_start_point_lat: 12.12345678,
            confirm_start_point_long: 21.12345678,
          },
        }).unwrap();
        console.log("Trip location updated for pending status");
      }

      // Step 2: Check if content type is NOT quality check type
      if (trip.content_type !== QUALITY_CHECK_CONTENT_TYPE) {
        // Get allowed content types for driver app
        const allowedContentTypes = driverAppContentTypes?.content_types || [];

        // Check if trip's content type is in allowed list
        const isContentTypeAllowed = allowedContentTypes.some(
          (contentType) => contentType.content_type_id === trip.content_type
        );

        if (isContentTypeAllowed) {
          // Create quality check with selected preparer
          const qualityCheckResult = await createQualityCheck({
            content_type: trip.content_type as number,
            object_id: trip.object_id,
            quality_checker: selectedPreparer,
          }).unwrap();

          if (qualityCheckResult.id) {
            // Update trip with destination coordinates as per Flutter
            await updateTripLocation({
              tripId: selectedTripForAssign,
              data: {
                confirm_destination_point_lat: 12.12345678,
                confirm_destination_point_long: 21.12345678,
              },
            }).unwrap();

            console.log("Preparer assigned successfully");
            // You could add toast notification here for success feedback

            // Close modal and reset state
            handleCloseAssignModal();
          }
        } else {
          console.log("Content type not allowed - Already Prepared");
          // You could add toast notification here: "Already Prepared"
          handleCloseAssignModal();
        }
      } else {
        // Content type is quality check type (48) - this should not happen in assign preparer flow
        console.error(
          "Error: Cannot assign preparer to quality check content type"
        );
        // You could add toast notification here: "An error occur while validating PO status button"
        handleCloseAssignModal();
      }
    } catch (error) {
      console.error("Error in assign preparer flow:", error);
      // You could add toast notification here: "Preparer cannot be assigned to this trip due to an error"
    } finally {
      setIsAssigning(false);
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
                {trip.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGoingClick(trip.id)}
                      disabled={locationLoadingTripId === trip.id}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm flex items-center justify-center"
                    >
                      {locationLoadingTripId === trip.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t("getting_location")}
                        </>
                      ) : (
                        t("going")
                      )}
                    </button>
                    <button
                      onClick={() => handleAssignPreparerClick(trip.id)}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm"
                    >
                      {t("assignPreparer")}
                    </button>
                  </div>
                )}

                {trip.status === "on_the_way" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleArrivedClick(trip.id)}
                      disabled={locationLoadingTripId === trip.id}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm flex items-center justify-center"
                    >
                      {locationLoadingTripId === trip.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t("getting_location")}
                        </>
                      ) : (
                        t("arrived")
                      )}
                    </button>
                  </div>
                )}

                {trip.status === "arrived" && (
                  <div className="text-center py-2">
                    <span className="text-sm font-medium text-green-600">
                      {t("tripCompleted")}
                    </span>
                  </div>
                )}

                {trip.status === "cancelled" && (
                  <div className="text-center py-2">
                    <span className="text-sm font-medium text-red-600">
                      {t("tripCancelled")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Preparer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("assignPreparer")}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("selectPreparer")}
              </label>
              <select
                value={selectedPreparer || ""}
                onChange={(e) =>
                  setSelectedPreparer(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t("selectPreparerPlaceholder")}</option>
                {preparersData?.map((preparer) => (
                  <option key={preparer.id} value={preparer.id}>
                    {preparer.first_name} {preparer.last_name} (
                    {preparer.username})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseAssignModal}
                disabled={isAssigning}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleAssignPreparerSubmit}
                disabled={!selectedPreparer || isAssigning}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isAssigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("assigning")}
                  </>
                ) : (
                  t("assignPreparer")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
