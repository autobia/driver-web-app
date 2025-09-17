"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { RootState } from "../../store/store";
import { calculateCounterTotals } from "../../store/slices/qcSlice";
import { useSubmitQualityCheckMutation } from "../../store/api/qualityChecksApi";
import type {
  QualityCheckSubmissionRequest,
  SubmissionItem,
} from "../../store/api/qualityChecksApi";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
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
  const { currentQC, itemCounters } = useSelector(
    (state: RootState) => state.qc
  );

  const [acknowledgeIncomplete, setAcknowledgeIncomplete] = useState(false);
  const [submitQualityCheck, { isLoading: isSubmitting }] =
    useSubmitQualityCheckMutation();

  if (!currentQC) return null;

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

      // // Submit the quality check
      // const result = await submitQualityCheck({
      //   id: currentQC.id,
      //   data: submissionData,
      // }).unwrap();

      // console.log("Quality Check submitted successfully:", result);

      // // Navigate to success page or dashboard
      // router.push("/");
      // onClose();
    } catch (error) {
      console.error("Failed to submit quality check:", error);
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
        </div>

        <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-2 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>

          {incompleteItems === 0 ? (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
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
                disabled={!acknowledgeIncomplete || isSubmitting}
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
