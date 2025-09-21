"use client";

import { useTranslations } from "next-intl";
import {
  useGetDriverTripsQuery,
  useUpdateTripLocationMutation,
  useCreateAdvancedTripMutation,
  type Trip,
  type WarehouseDestination,
  type CompanyBranchDestination,
} from "../../store/api/tripsApi";
import { useCreateQualityCheckMutation } from "../../store/api/qualityChecksApi";
import {
  useFetchUsersQuery,
  useFetchContentTypesQuery,
} from "../../store/api/coreApi";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../../hooks/useToast";

export default function TripsComponent() {
  const t = useTranslations();
  const toast = useToast();
  const {
    data: tripsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetDriverTripsQuery();
  const [updateTripLocation] = useUpdateTripLocationMutation();
  const [createAdvancedTrip] = useCreateAdvancedTripMutation();
  const [createQualityCheck] = useCreateQualityCheckMutation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [locationLoadingTripId, setLocationLoadingTripId] = useState<
    number | null
  >(null);
  const [operationType, setOperationType] = useState<
    "going" | "arriving" | "assigning" | null
  >(null);
  const [refetchingTripId, setRefetchingTripId] = useState<number | null>(null);

  // Track when we're fetching AND which trip triggered it
  const isRefetchingSpecificTrip = (tripId: number) => {
    const isRefetching = refetchingTripId === tripId && isFetching;
    if (isRefetching) {
      console.log(
        `🔄 Refetching data for trip ${tripId} - isFetching: ${isFetching}, refetchingTripId: ${refetchingTripId}`
      );
    }
    return isRefetching;
  };

  // Check if ANY refetch is in progress (to disable all other actions)
  const isAnyRefetchInProgress = refetchingTripId !== null && isFetching;

  if (isAnyRefetchInProgress) {
    console.log(
      `🚫 All actions disabled - refetching trip ${refetchingTripId}, isFetching: ${isFetching}`
    );
  }

  console.warn("isLoading", isLoading);

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

  // Constants from Flutter code
  const QUALITY_CHECK_CONTENT_TYPE = 48;
  const WAREHOUSE_CONTENT_TYPE = 32;

  // Fallback coordinates
  const FALLBACK_LATITUDE = 17;
  const FALLBACK_LONGITUDE = 17;

  // Helper function to get current location with fallback
  const getCurrentLocationWithFallback = async (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    try {
      if (!navigator.geolocation) {
        console.warn(
          "Geolocation is not supported by this browser. Using fallback coordinates."
        );
        return { latitude: FALLBACK_LATITUDE, longitude: FALLBACK_LONGITUDE };
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.warn(
        "Failed to get current location. Using fallback coordinates:",
        error
      );
      return { latitude: FALLBACK_LATITUDE, longitude: FALLBACK_LONGITUDE };
    }
  };

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

  // Helper function to get destination type translation
  const getDestinationTypeTranslation = (type: string) => {
    switch (type) {
      case "warehouse":
        return t("warehouse");
      case "companybranch":
        return t("companyBranch");
      default:
        return type;
    }
  };

  // Helper function to get destination name
  const getDestinationName = (trip: Trip) => {
    if (!trip.destination_point) return "";

    if (trip.destination_point_type === "warehouse") {
      const warehouse = trip.destination_point as WarehouseDestination;
      return warehouse.name_ar || warehouse.name_en || "";
    } else if (trip.destination_point_type === "companybranch") {
      const company = trip.destination_point as CompanyBranchDestination;
      return company.company_id?.name_ar || company.company_id?.name_en || "";
    }

    return "";
  };

  // Function to handle "going" button click - directly call createTrip
  const handleGoingClick = async (tripId: number) => {
    if (!user) {
      console.error("User not logged in");
      toast.error("Authentication required", "Please login to continue");
      return;
    }

    const trip = trips.find((t) => t.id === tripId);
    if (!trip) {
      console.error("Trip not found");
      return;
    }

    setLocationLoadingTripId(tripId);
    setOperationType("going");
    toast.info(t("startingTrip"), t("loadingTripDetails"));

    try {
      // Get current location with fallback
      const { latitude, longitude } = await getCurrentLocationWithFallback();

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

      // Show success message
      toast.success(t("tripStartedSuccessfully"), t("tripLocationUpdated"));

      // Set refetching state and refetch trips to get updated data
      console.log(`🚀 Starting refetch for trip ${tripId}`);
      setRefetchingTripId(tripId);
      setOperationType("going");
      await refetch();
      console.log(`✅ Refetch completed for trip ${tripId}`);
    } catch (error) {
      console.error("Error in going flow:", error);
      toast.operationError("Going to location", error);
    } finally {
      setLocationLoadingTripId(null);
      setOperationType(null);
      setRefetchingTripId(null);
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
    setOperationType("arriving");
    toast.info(t("startingTrip"), t("loadingTripDetails"));
    try {
      // Get current location with fallback
      const { latitude, longitude } = await getCurrentLocationWithFallback();

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
          console.warn(qualityCheckResult, "results area");

          // Set refetching state and refetch trips to get updated data
          setRefetchingTripId(tripId);
          await refetch();
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

              // Set refetching state and refetch trips to get updated data
              setRefetchingTripId(tripId);
              await refetch();
            } else {
              console.log(
                "The specified trip indicates that there is a delayed items upon it, so we create a quality check for it"
              );

              // Create a new delivery trip
              if (trip.main_source?.warehouse?.id) {
                await createAdvancedTrip({
                  content_type: trip.content_type,
                  object_id: trip.object_id,
                  destination_point: trip.main_source.warehouse.id.toString(),
                  destination_point_type: WAREHOUSE_CONTENT_TYPE,
                  trip_direction: "deliver",
                  assign_to: user.user_id.toString(),
                  user_type: "user",
                }).unwrap();

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

                // Set refetching state and refetch trips to get updated data
                setRefetchingTripId(tripId);
                await refetch();
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

              // Set refetching state and refetch trips to get updated data
              setRefetchingTripId(tripId);
              await refetch();
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
      setOperationType(null);
      setRefetchingTripId(null);
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
    setLocationLoadingTripId(selectedTripForAssign);
    setOperationType("assigning");

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
          await createQualityCheck({
            content_type: trip.content_type as number,
            object_id: trip.object_id,
            quality_checker: selectedPreparer,
          }).unwrap();

          // Update trip with destination coordinates as per Flutter
          await updateTripLocation({
            tripId: selectedTripForAssign,
            data: {
              confirm_destination_point_lat: 12.12345678,
              confirm_destination_point_long: 21.12345678,
            },
          }).unwrap();

          // Close modal and reset state
          handleCloseAssignModal();

          // Set refetching state and refetch trips to get updated data
          setRefetchingTripId(selectedTripForAssign);
          await refetch();
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
      setLocationLoadingTripId(null);
      setOperationType(null);
      setRefetchingTripId(null);
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
              className={`bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative ${
                locationLoadingTripId === trip.id ||
                isRefetchingSpecificTrip(trip.id)
                  ? "opacity-75 scale-[0.98] shadow-lg border-primary-200"
                  : isAnyRefetchInProgress && refetchingTripId !== trip.id
                  ? "opacity-70"
                  : ""
              }`}
            >
              {/* Loading Overlay */}
              {(locationLoadingTripId === trip.id ||
                isRefetchingSpecificTrip(trip.id)) && (
                <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl animate-in fade-in duration-200">
                  <div className="flex flex-col items-center space-y-2 animate-pulse">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-600"></div>
                    <span className="text-sm text-gray-700 font-medium">
                      {isRefetchingSpecificTrip(trip.id)
                        ? t("refreshingTripData")
                        : operationType === "going"
                        ? t("updatingTrip")
                        : operationType === "arriving"
                        ? t("processingArrival")
                        : operationType === "assigning"
                        ? t("assigningPreparer")
                        : t("getting_location")}
                    </span>
                  </div>
                </div>
              )}

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
                    {t("purchaseInvoice")} #{trip.main_source_id}
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

                {/* Destination Information */}
                {trip.destination_point_type && trip.destination_point && (
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {getDestinationTypeTranslation(
                          trip.destination_point_type
                        )}
                      </p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getDestinationName(trip)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Trip Direction */}
                {trip.trip_direction && (
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2"></div>
                    <p className="text-sm text-gray-700">
                      <span className="text-xs text-gray-500 uppercase tracking-wide mr-2">
                        {t("direction")}:
                      </span>
                      {trip.trip_direction === "bring"
                        ? t("bring")
                        : t("deliver")}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-4 pb-4">
                {trip.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleGoingClick(trip.id)}
                      disabled={
                        locationLoadingTripId === trip.id ||
                        isRefetchingSpecificTrip(trip.id) ||
                        isAnyRefetchInProgress
                      }
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      {locationLoadingTripId === trip.id ||
                      isRefetchingSpecificTrip(trip.id) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isRefetchingSpecificTrip(trip.id)
                            ? t("refreshingTripData")
                            : t("getting_location")}
                        </>
                      ) : refetchingTripId === trip.id ? (
                        <>
                          <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t("refreshingTripData")}
                        </>
                      ) : (
                        t("going")
                      )}
                    </Button>
                    {trip.trip_direction !== "deliver" && (
                      <Button
                        onClick={() => handleAssignPreparerClick(trip.id)}
                        disabled={
                          locationLoadingTripId === trip.id ||
                          isRefetchingSpecificTrip(trip.id) ||
                          isAnyRefetchInProgress
                        }
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                      >
                        {t("assignPreparer")}
                      </Button>
                    )}
                  </div>
                )}

                {trip.status === "on_the_way" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleArrivedClick(trip.id)}
                      disabled={
                        locationLoadingTripId === trip.id ||
                        isRefetchingSpecificTrip(trip.id) ||
                        isAnyRefetchInProgress
                      }
                      variant="default"
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                    >
                      {locationLoadingTripId === trip.id ||
                      isRefetchingSpecificTrip(trip.id) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isRefetchingSpecificTrip(trip.id)
                            ? t("refreshingTripData")
                            : t("getting_location")}
                        </>
                      ) : refetchingTripId === trip.id ? (
                        <>
                          <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t("refreshingTripData")}
                        </>
                      ) : (
                        t("arrived")
                      )}
                    </Button>
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

      {/* Assign Preparer Dialog */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("assignPreparer")}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {t("selectPreparer")}
              </label>
              <Select
                value={selectedPreparer?.toString() || ""}
                onValueChange={(value) =>
                  setSelectedPreparer(value ? Number(value) : null)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectPreparerPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {preparersData?.map((preparer) => (
                    <SelectItem
                      key={preparer.id}
                      value={preparer.id.toString()}
                    >
                      {preparer.first_name} {preparer.last_name} (
                      {preparer.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleCloseAssignModal}
              disabled={isAssigning}
              variant="outline"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAssignPreparerSubmit}
              disabled={!selectedPreparer || isAssigning}
              variant="default"
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("assigning")}
                </>
              ) : (
                t("assignPreparer")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
