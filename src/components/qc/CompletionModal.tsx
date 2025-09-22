"use client";

import { useState, useRef } from "react";
import {
  useSubmitQualityCheckMutation,
  useCloseQualityCheckMutation,
  useCreateDelayedItemsFlowMutation,
} from "../../store/api/qualityChecksApi";
import { useUploadFileMutation } from "../../store/api/filerApi";
import type {
  QualityCheckSubmissionRequest,
  SubmissionItem,
  QualityCheckCloseRequest,
  CreateDelayedItemsFlowRequest,
} from "../../store/api/qualityChecksApi";
import {
  useCreateAdvancedTripMutation,
  useGetDriverTripsQuery,
} from "../../store/api/tripsApi";
import type { CreateAdvancedTripRequest } from "../../store/api/tripsApi";
import { useDrivers, usePreparers } from "../../hooks/useUserData";
import { useSelector, useDispatch } from "react-redux";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { RootState } from "../../store/store";
import { useToast } from "../../hooks/useToast";
import {
  calculateCounterTotals,
  resetCurrentQC,
} from "../../store/slices/qcSlice";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  CheckCircle,
  AlertTriangle,
  Package,
  Timer,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CompletionModal({
  isOpen,
  onClose,
}: CompletionModalProps) {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();
  const { currentQC, itemCounters } = useSelector(
    (state: RootState) => state.qc
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [acknowledgeIncomplete, setAcknowledgeIncomplete] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("0");
  const [selectedPreparerId, setSelectedPreparerId] = useState<string>("0");

  // Image upload state
  const [images, setImages] = useState<
    {
      file: File;
      preview: string;
      uploading: boolean;
      uploaded: boolean;
      error?: string;
      id: number;
    }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [submitQualityCheck, { isLoading: isSubmitting }] =
    useSubmitQualityCheckMutation();
  const [closeQualityCheck] = useCloseQualityCheckMutation();
  const [createDelayedItemsFlow] = useCreateDelayedItemsFlowMutation();
  const [createTrip] = useCreateAdvancedTripMutation();
  const [uploadFile] = useUploadFileMutation();

  // Hook for refetching driver trips
  const { refetch: refetchDriverTrips } = useGetDriverTripsQuery();

  // Fetch drivers and preparers data
  const { data: drivers, isLoading: driversLoading } = useDrivers();
  const { data: preparers, isLoading: preparersLoading } = usePreparers();

  if (!currentQC) return null;

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Helper to get MIME type from file extension
  const getMimeType = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "webp":
        return "image/webp";
      case "svg":
        return "image/svg+xml";
      case "bmp":
        return "image/bmp";
      default:
        return "image/jpeg"; // Default fallback
    }
  };

  // Helper to create complete base64 data URL
  const createBase64DataUrl = (file: File, base64Data: string): string => {
    const mimeType = getMimeType(file.name);
    return `data:${mimeType};base64,${base64Data}`;
  };

  // Handle file selection and auto-upload
  const handleSelectImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    // Process each file
    for (const file of files) {
      const preview = await fileToBase64(file);
      const imageId = Date.now() + Math.random(); // Unique ID for tracking

      const newImage = {
        file,
        preview,
        uploading: true,
        uploaded: false,
        id: imageId,
      };

      // Add image to state with uploading status
      setImages((prev) => [...prev, newImage]);

      // Start upload immediately
      try {
        const base64Data = preview.split(",")[1];
        const finalBase64Image = createBase64DataUrl(file, base64Data);
        await uploadFile({
          content_type: 48, // QC content type
          object_id: currentQC.id,
          type: 1, // Image type
          base64_file: finalBase64Image,
        }).unwrap();

        // Update to uploaded state using the unique ID
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, uploading: false, uploaded: true }
              : img
          )
        );
      } catch {
        // Update to error state using the unique ID
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, uploading: false, error: t("uploadFailed") }
              : img
          )
        );
      }
    }

    e.target.value = "";
  };

  // Remove image
  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Upload a single image
  const handleUploadImage = async (idx: number) => {
    setImages((prev) =>
      prev.map((img, i) =>
        i === idx ? { ...img, uploading: true, error: undefined } : img
      )
    );
    const img = images[idx];
    try {
      // Create complete base64 data URL with proper MIME type
      const base64Data = img.preview.split(",")[1];
      const finalBase64Image = createBase64DataUrl(img.file, base64Data);
      await uploadFile({
        content_type: 48, // QC content type - adjust as needed
        object_id: currentQC.id,
        type: 1, // Image type - adjust as needed
        base64_file: finalBase64Image,
      }).unwrap();
      setImages((prev) =>
        prev.map((img, i) =>
          i === idx ? { ...img, uploading: false, uploaded: true } : img
        )
      );
    } catch {
      setImages((prev) =>
        prev.map((img, i) =>
          i === idx
            ? { ...img, uploading: false, error: t("uploadFailed") }
            : img
        )
      );
    }
  };

  // Calculate completion statistics
  const totalItems = currentQC.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Calculate detailed breakdown
  let totalRegular = 0;
  let totalReplacements = 0;
  let totalDelayed = 0;
  let countedItems = 0;

  Object.values(itemCounters).forEach((counter) => {
    const {
      totalRequestedQuantity,
      totalReplacementQuantity,
      totalDelayedQuantity,
    } = calculateCounterTotals(counter);
    totalRegular += counter.regularQuantity;
    totalReplacements += totalReplacementQuantity;
    totalDelayed += totalDelayedQuantity;
    countedItems += totalRequestedQuantity;
  });

  const incompleteItemsData = Object.values(itemCounters)
    .map((counter, index) => {
      const { totalRequestedQuantity } = calculateCounterTotals(counter);
      const qcItem = currentQC.items[index];
      return {
        counter,
        qcItem,
        remaining: counter.originalQuantity - totalRequestedQuantity,
        isIncomplete: totalRequestedQuantity < counter.originalQuantity,
      };
    })
    .filter((item) => item.isIncomplete);

  const incompleteItems = incompleteItemsData.length;
  const totalRemainingQuantity = incompleteItemsData.reduce(
    (sum, item) => sum + item.remaining,
    0
  );

  const handleComplete = async () => {
    try {
      // Build submission data according to API specification
      const submissionData: QualityCheckSubmissionRequest = {
        items: currentQC.items.map((qcItem) => {
          const counter = itemCounters[qcItem.id];
          if (!counter) {
            throw new Error(`Counter not found for item ${qcItem.id}`);
          }

          const {
            totalRequestedQuantity,
            totalReplacementQuantity,
            totalDelayedQuantity,
          } = calculateCounterTotals(counter);
          const marketQuantity = Math.max(
            0,
            counter.originalQuantity - totalRequestedQuantity
          );

          const submissionItem: SubmissionItem = {
            part_number: qcItem.brand_item.item.part_number,
            brand: qcItem.brand_item.brand.id,
            manufacturer: qcItem.brand_item.item.manufacturer.id,
            received_quantity: counter.regularQuantity,
            replacement_quantity: totalReplacementQuantity,
            replacement_list: counter.replacementItems.map((replacement) => ({
              replacement_item_sku: replacement.sku,
              brand_id: replacement.brand.id,
              manufacturer_id: replacement.manufacturer.id,
              quantity: replacement.quantity,
            })),
            delayed_quantity: totalDelayedQuantity,
            market_quantity: marketQuantity,
          };

          return submissionItem;
        }),
      };

      // Log the submission request for verification
      console.log("Quality Check Submission Request:", {
        qcId: currentQC.id,
        submissionData: submissionData,
      });

      // Submit the quality check
      const result = await submitQualityCheck({
        id: currentQC.id,
        data: submissionData,
      }).unwrap();

      console.log("Quality Check submitted successfully:", result);

      // Determine user role
      const isDriver = user?.role?.name_en?.toLowerCase() === "driver";

      if (isDriver) {
        // Driver flow (existing logic)
        console.log("Processing as driver role");

        // Determine if all items are sent to market
        const allItemsToMarket = submissionData.items.every(
          (item) =>
            item.market_quantity > 0 &&
            item.received_quantity === 0 &&
            item.replacement_quantity === 0 &&
            item.delayed_quantity === 0
        );

        const assignedTo = user?.user_id ? user.user_id.toString() : "";

        // Prepare close request data
        const closeData: QualityCheckCloseRequest = {
          close: true,
          assigned_type: 17,
          assigned_to: Number(assignedTo),
          trip: !allItemsToMarket,
        };

        // Close the quality check
        const closeResult = await closeQualityCheck({
          id: currentQC.id,
          data: closeData,
        }).unwrap();

        console.log("Quality Check closed successfully:", closeResult);

        // Check if there are any delayed items and create delayed items flow if needed
        const hasDelayedItems = submissionData.items.some(
          (item) => item.delayed_quantity > 0
        );

        if (hasDelayedItems) {
          const delayedItemsData: CreateDelayedItemsFlowRequest = {
            qc_id: currentQC.id,
            delayed_user_id: Number(assignedTo),
          };

          console.log("Creating delayed items flow:", delayedItemsData);

          const delayedResult = await createDelayedItemsFlow(
            delayedItemsData
          ).unwrap();
          console.log(
            "Delayed items flow created successfully:",
            delayedResult
          );
        }
      } else {
        // Non-driver flow (new logic)
        console.log("Processing as non-driver role");

        // Validate driver selection
        if (selectedDriverId === "0") {
          throw new Error("Driver selection is required");
        }

        // Step 2: Create Trip
        const tripData: CreateAdvancedTripRequest = {
          content_type: 48,
          object_id: currentQC.id,
          destination_point:
            currentQC.main_source_id.company_branch.id.toString(),
          destination_point_type: 32,
          trip_direction: "bring",
          assign_to: selectedDriverId.toString(),
          user_type: "user",
        };

        console.log("Creating trip:", tripData);

        const tripResult = await createTrip(tripData).unwrap();
        console.log("Trip created successfully:", tripResult);

        // Step 3: Close QC Ticket
        const closeData: QualityCheckCloseRequest = {
          delayed_driver_id:
            selectedPreparerId !== "0" ? parseInt(selectedPreparerId) : 0,
          close: true,
        };

        console.log("Closing QC with data:", closeData);

        const closeResult = await closeQualityCheck({
          id: currentQC.id,
          data: closeData,
        }).unwrap();

        console.log("Quality Check closed successfully:", closeResult);

        // Step 4: Check if there are any delayed items and create delayed items flow if needed
        const hasDelayedItems = submissionData.items.some(
          (item) => item.delayed_quantity > 0
        );

        if (hasDelayedItems) {
          const delayedItemsData: CreateDelayedItemsFlowRequest = {
            qc_id: currentQC.id,
            delayed_user_id:
              selectedPreparerId !== "0" ? parseInt(selectedPreparerId) : 0,
          };

          console.log("Creating delayed items flow:", delayedItemsData);

          const delayedResult = await createDelayedItemsFlow(
            delayedItemsData
          ).unwrap();
          console.log(
            "Delayed items flow created successfully:",
            delayedResult
          );
        }
      }

      // Show success toast before navigation
      toast.success(t("qualityCheckCompleted"));

      // Refetch driver trips to update the trips list
      refetchDriverTrips();

      // Navigate to success page or dashboard
      dispatch(resetCurrentQC());
      router.push("/quality-checks");
      onClose();
    } catch (error) {
      console.error("Failed to submit or close quality check:", error);
      // TODO: Show error message to user
    }
  };

  const handleContinue = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            {incompleteItems === 0 ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            )}
            <span>
              {incompleteItems === 0
                ? t("readyToComplete")
                : t("submitQualityCheck")}
            </span>
          </DialogTitle>
          <DialogDescription>
            {incompleteItems === 0
              ? t("completionSummaryDescription")
              : t("submitQualityCheckDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
              <Package className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {totalRegular}
              </div>
              <div className="text-xs text-gray-600">{t("regular")}</div>
            </div>

            <div className="text-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
              <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-xl font-bold text-yellow-600">
                {totalReplacements}
              </div>
              <div className="text-xs text-gray-600">{t("replacements")}</div>
            </div>

            <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
              <Timer className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-xl font-bold text-orange-600">
                {totalDelayed}
              </div>
              <div className="text-xs text-gray-600">{t("delayed")}</div>
            </div>

            <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-xl font-bold text-green-600">
                {countedItems}
              </div>
              <div className="text-xs text-gray-600">{t("totalCounted")}</div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <div className="text-sm text-gray-600">
                  {t("totalExpected")}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {totalItems}
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-sm text-gray-600">
                  {t("totalProcessed")}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {countedItems}
                </div>
              </div>
              {totalRemainingQuantity > 0 && (
                <div className="text-center sm:text-right">
                  <div className="text-sm text-gray-600">{t("remaining")}</div>
                  <div className="text-xl sm:text-2xl font-bold text-red-600">
                    {totalRemainingQuantity}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-blue-800 text-sm sm:text-base flex items-center">
                📎 {t("attachImages")}
              </h3>
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs sm:text-sm"
              >
                {t("addImages")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleSelectImages}
              />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative bg-white border rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={img.preview}
                        alt={t("imagePreview")}
                        className={`w-full h-full object-cover transition-opacity ${
                          img.uploading ? "opacity-75" : "opacity-100"
                        }`}
                      />
                      {/* Uploading overlay */}
                      {img.uploading && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      {/* Success overlay */}
                      {img.uploaded && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>

                    {/* Upload status */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1.5">
                      {img.uploaded ? (
                        <div className="text-center">
                          <span className="text-xs block text-green-300 font-medium">
                            ✓ {t("uploadSuccess")}
                          </span>
                        </div>
                      ) : img.uploading ? (
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          </div>
                          <span className="text-xs block text-yellow-300">
                            {t("uploading")}
                          </span>
                        </div>
                      ) : img.error ? (
                        <div className="text-center">
                          <span className="text-xs block text-red-300 mb-1">
                            {t("uploadFailed")}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="text-xs h-6 px-2"
                            onClick={() => handleUploadImage(idx)}
                          >
                            {t("retry")}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <p className="text-sm text-blue-600 text-center py-3">
                {t("imageUploadDescription")}
              </p>
            )}
          </div>

          {/* Incomplete Items Details */}
          {incompleteItems > 0 && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                <span className="font-medium text-red-800 text-sm sm:text-base">
                  {t("incompleteItemsDetails")} ({incompleteItems} {t("items")})
                </span>
              </div>

              <div className="space-y-2 mb-4 max-h-48 sm:max-h-64 overflow-y-auto">
                {incompleteItemsData.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-white rounded border space-y-1 sm:space-y-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {item.qcItem?.brand_item?.brand?.name_en || "N/A"} -{" "}
                        {item.qcItem?.brand_item?.item?.description || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {t("partNumber")}:{" "}
                        {item.qcItem?.brand_item?.item?.part_number || "N/A"}
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <div className="text-sm font-medium text-red-600">
                        {t("missing")}: {item.remaining}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.counter.regularQuantity +
                          item.counter.replacementItems.reduce(
                            (s, r) => s + r.quantity,
                            0
                          ) +
                          item.counter.delayedItems.reduce(
                            (s, d) => s + d.quantity,
                            0
                          )}{" "}
                        / {item.counter.originalQuantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Acknowledgment Checkbox */}
              <div className="flex items-start space-x-3 p-3 bg-white rounded border-2 border-red-300">
                <Checkbox
                  id="acknowledge-incomplete"
                  checked={acknowledgeIncomplete}
                  onCheckedChange={(checked) =>
                    setAcknowledgeIncomplete(checked === true)
                  }
                  className="mt-1 flex-shrink-0"
                />
                <Label
                  htmlFor="acknowledge-incomplete"
                  className="text-sm leading-5 flex-1"
                >
                  <span className="font-medium text-red-800 block mb-1">
                    {t("acknowledgeIncompleteDescription")}
                  </span>
                </Label>
              </div>
            </div>
          )}

          {incompleteItems === 0 && (
            <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span className="font-medium text-green-800 text-sm sm:text-base">
                  {t("allItemsCompleted")}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-green-700">
                {t("readyToSubmit")}
              </p>
            </div>
          )}

          {/* Driver and Preparer Selectors for Non-Driver Roles */}
          {!user?.role?.name_en?.toLowerCase().includes("driver") && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {t("assignmentSettings")}
                </h3>

                {/* Driver Selector */}
                <div className="space-y-2 mb-4">
                  <Label
                    htmlFor="driver-select"
                    className="text-sm font-medium text-gray-700"
                  >
                    {t("selectDriver")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedDriverId}
                    onValueChange={setSelectedDriverId}
                  >
                    <SelectTrigger id="driver-select" className="w-full">
                      <SelectValue
                        placeholder={
                          driversLoading
                            ? t("loading")
                            : t("selectDriverPlaceholder")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0" disabled>
                        {t("selectDriverPlaceholder")}
                      </SelectItem>
                      {drivers?.map((driver) => (
                        <SelectItem
                          key={driver.id}
                          value={driver.id.toString()}
                        >
                          {driver.first_name} {driver.last_name} (
                          {driver.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDriverId === "0" && (
                    <p className="text-xs text-red-600">
                      {t("driverRequired")}
                    </p>
                  )}
                </div>

                {/* Delayed Preparer Selector - only show if there are delayed items */}
                {totalDelayed > 0 && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="preparer-select"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      {t("selectDelayedPreparer")}{" "}
                      <span className="text-gray-500 text-xs ml-1">
                        ({t("optional")})
                      </span>
                    </Label>
                    <Select
                      value={selectedPreparerId}
                      onValueChange={setSelectedPreparerId}
                    >
                      <SelectTrigger id="preparer-select" className="w-full">
                        <SelectValue
                          placeholder={
                            preparersLoading
                              ? t("loading")
                              : t("selectPreparerPlaceholder")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">
                          {t("noPreparerSelected")}
                        </SelectItem>
                        {preparers?.map((preparer) => (
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
                    <p className="text-xs text-gray-500">
                      {t("delayedPreparerDescription")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-2 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          {incompleteItems === 0 ? (
            <Button
              onClick={handleComplete}
              disabled={
                isSubmitting ||
                (!user?.role?.name_en?.toLowerCase().includes("driver") &&
                  selectedDriverId === "0")
              }
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          ) : (
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button
                onClick={handleContinue}
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {t("continueWorking")}
              </Button>

              {/* Single Submit button - requires acknowledgment for incomplete items */}
              <Button
                onClick={handleComplete}
                disabled={
                  !acknowledgeIncomplete ||
                  isSubmitting ||
                  (!user?.role?.name_en?.toLowerCase().includes("driver") &&
                    selectedDriverId === "0")
                }
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? t("submitting") : t("submit")}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
