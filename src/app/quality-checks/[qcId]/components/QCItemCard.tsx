"use client";

import { useSelector, useDispatch } from "react-redux";
import { useTranslations, useLocale } from "next-intl";
import { RootState } from "../../../../store/store";
import { QualityCheckItem } from "../../../../store/api/qualityChecksApi";
import {
  incrementItemCounter,
  decrementItemCounter,
  bulkScanItem,
  removeReplacementItem,
  removeDelayedItem,
  selectItemCounter,
} from "../../../../store/slices/qcSlice";
import { Button } from "../../../../components/ui/button";
import { Plus, Minus, Package, Clock, Timer, ScanLine } from "lucide-react";
import { useState } from "react";
import ReplacementItemModal from "./ReplacementItemModal";
import DelayedItemModal from "./DelayedItemModal";

interface QCItemCardProps {
  item: QualityCheckItem;
  searchQuery?: string;
}

// Utility function to highlight matching text
function highlightText(text: string, query: string) {
  if (!query.trim()) {
    return text;
  }

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="bg-yellow-300 text-gray-900 px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function QCItemCard({ item, searchQuery = "" }: QCItemCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useDispatch();

  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [showDelayedModal, setShowDelayedModal] = useState(false);

  const counter = useSelector((state: RootState) =>
    selectItemCounter(state, item.id)
  ) || {
    itemId: item.id,
    regularQuantity: 0,
    originalQuantity: item.quantity,
    status: "not-started" as const,
    replacementItems: [],
    delayedItems: [],
    totalReplacementQuantity: 0,
    totalDelayedQuantity: 0,
    totalRequestedQuantity: 0,
  };

  // Check if there's a shortage (when regular + replacement + delayed < original)
  const hasShortage = counter.totalRequestedQuantity < item.quantity;

  const handleIncrement = () => {
    // Can increment regular quantity if total won't exceed original quantity
    if (counter.totalRequestedQuantity < item.quantity) {
      dispatch(incrementItemCounter(item.id));
    }
  };

  const handleDecrement = () => {
    // Can decrement regular quantity if there are regular items to decrement
    if (counter.regularQuantity > 0) {
      dispatch(decrementItemCounter(item.id));
    }
  };

  const handleBulkScan = () => {
    dispatch(bulkScanItem(item.id));
  };

  const getStatusColor = () => {
    switch (counter.status) {
      case "completed":
        return "border-green-500 bg-green-50";
      case "in-progress":
        return "border-primary-500 bg-primary-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  const getStatusIcon = () => {
    switch (counter.status) {
      case "completed":
        return <Package className="w-5 h-5 text-green-600" />;
      case "in-progress":
        return <Package className="w-5 h-5 text-primary-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div
      className={`w-full max-w-full overflow-hidden rounded-lg border-2 p-4 transition-all duration-200 ${getStatusColor()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getStatusIcon()}
          <div className="w-full max-w-full">
            <h3 className="font-bold text-gray-900 text-lg">
              {searchQuery
                ? highlightText(
                    item.brand_item?.item?.part_number || "N/A",
                    searchQuery
                  )
                : item.brand_item?.item?.part_number || "N/A"}
            </h3>
            <p className="text-sm text-gray-600 mt-1 break-words">
              {locale === "ar"
                ? item.brand_item?.brand?.name_ar || item.brand_item?.brand?.name_en || "N/A"
                : item.brand_item?.brand?.name_en || "N/A"}{" "}
              -{" "}
              {locale === "ar"
                ? item.brand_item?.item?.description_ar || item.brand_item?.item?.description_en || item.brand_item?.item?.description || "N/A"
                : item.brand_item?.item?.description_en || item.brand_item?.item?.description || "N/A"}
            </p>
          </div>
        </div>
        {hasShortage && <Clock className="w-5 h-5 text-yellow-500" />}
      </div>
      {/* Total Summary */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-900">
            {t("totalRequested")}: {counter.totalRequestedQuantity} /{" "}
            {item.quantity}
          </div>
          <div className="text-xs text-gray-500">
            {Math.min(
              100,
              Math.round((counter.totalRequestedQuantity / item.quantity) * 100)
            )}
            % {t("progress")}
          </div>
        </div>

        {/* Breakdown by Type */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-blue-600">{t("regular")}:</span>
            <span className="font-medium">{counter.regularQuantity}</span>
          </div>
          {counter.totalReplacementQuantity > 0 && (
            <div className="flex justify-between">
              <span className="text-yellow-600">{t("replacements")}:</span>
              <span className="font-medium">
                {counter.totalReplacementQuantity}
              </span>
            </div>
          )}
          {counter.totalDelayedQuantity > 0 && (
            <div className="flex justify-between">
              <span className="text-orange-600">{t("delayed")}:</span>
              <span className="font-medium">
                {counter.totalDelayedQuantity}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Regular Quantity Counter */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleDecrement}
            disabled={counter.regularQuantity === 0}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <div className="text-center min-w-[60px]">
            <div className="text-lg font-bold text-blue-600">
              {counter.regularQuantity}
            </div>
            <div className="text-xs text-gray-500">{t("regular")}</div>
          </div>

          <Button
            onClick={handleIncrement}
            disabled={counter.totalRequestedQuantity >= item.quantity}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>

          {/* Bulk Scan Button */}
          {counter.status !== "completed" && (
            <Button
              onClick={handleBulkScan}
              disabled={counter.totalRequestedQuantity >= item.quantity}
              size="sm"
              variant="default"
              className="h-8 px-3 bg-primary-600 hover:bg-primary-700 text-white"
            >
              <ScanLine className="w-4 h-4 mr-1" />
              {t("bulkScanAll")}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
          {/* Create segments with proper positioning */}
          <div className="flex h-full">
            {/* Regular quantity */}
            {counter.regularQuantity > 0 && (
              <div
                className="bg-blue-500 transition-all duration-300 h-full"
                style={{
                  width: `${(counter.regularQuantity / item.quantity) * 100}%`,
                }}
              />
            )}
            {/* Replacement quantity */}
            {counter.totalReplacementQuantity > 0 && (
              <div
                className="bg-yellow-500 transition-all duration-300 h-full"
                style={{
                  width: `${
                    (counter.totalReplacementQuantity / item.quantity) * 100
                  }%`,
                }}
              />
            )}
            {/* Delayed quantity */}
            {counter.totalDelayedQuantity > 0 && (
              <div
                className="bg-orange-500 transition-all duration-300 h-full"
                style={{
                  width: `${
                    (counter.totalDelayedQuantity / item.quantity) * 100
                  }%`,
                }}
              />
            )}
          </div>
        </div>
        {/* Legend */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded"></div>
              <span>{t("regular")}</span>
            </div>
            {counter.totalReplacementQuantity > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                <span>{t("replacements")}</span>
              </div>
            )}
            {counter.totalDelayedQuantity > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded"></div>
                <span>{t("delayed")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Replacement Items Section */}
      {counter.replacementItems.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm font-medium text-yellow-800 mb-2">
            {t("replacementItems")} ({counter.replacementItems.length})
          </div>
          <div className="space-y-2">
            {counter.replacementItems.map((replacement) => (
              <div
                key={replacement.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex-1">
                  <div className="text-gray-700 font-medium">
                    {replacement.manufacturer.name} - {replacement.brand.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t("partNumber")}: {replacement.sku}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600 font-medium">
                    {t("qty")}: {replacement.quantity}
                  </span>
                  <Button
                    onClick={() =>
                      dispatch(
                        removeReplacementItem({
                          itemId: item.id,
                          replacementId: replacement.id,
                        })
                      )
                    }
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delayed Items Section */}
      {counter.delayedItems.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-sm font-medium text-orange-800 mb-2">
            {t("delayedItems")} ({counter.delayedItems.length})
          </div>
          <div className="space-y-2">
            {counter.delayedItems.map((delayed) => (
              <div
                key={delayed.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex-1">
                  <div className="text-gray-700 font-medium">
                    {t("delayedItem")}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-600 font-medium">
                    {t("qty")}: {delayed.quantity}
                  </span>
                  <Button
                    onClick={() =>
                      dispatch(
                        removeDelayedItem({
                          itemId: item.id,
                          delayedId: delayed.id,
                        })
                      )
                    }
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {counter.totalRequestedQuantity < item.quantity && (
          <>
            <Button
              onClick={() => setShowReplacementModal(true)}
              disabled={counter.status === "completed"}
              size="sm"
              variant={hasShortage ? "default" : "outline"}
              className={`flex-1 text-xs ${
                hasShortage
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : ""
              }`}
            >
              {hasShortage ? t("addReplacement") : t("addExtraItem")}
            </Button>

            <Button
              onClick={() => setShowDelayedModal(true)}
              disabled={counter.status === "completed"}
              size="sm"
              variant="outline"
              className="flex-1 text-xs bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Timer className="w-3 h-3 mr-1" />
              {t("markAsDelayed")}
            </Button>
          </>
        )}

        {counter.totalRequestedQuantity >= item.quantity && (
          <div className="flex-1 text-center text-xs font-medium text-green-600 py-2">
            ✓ {t("complete")}
          </div>
        )}
      </div>
      {/* Item Details */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div>
            <span className="font-medium">{t("manufacturer")}:</span>
            <br />
            {locale === "ar"
              ? item.brand_item?.item?.manufacturer?.name_ar || item.brand_item?.item?.manufacturer?.name_en || "N/A"
              : item.brand_item?.item?.manufacturer?.name_en || "N/A"}
          </div>
          <div>
            <span className="font-medium">{t("brand")}:</span>
            <br />
            {locale === "ar"
              ? item.brand_item?.brand?.name_ar || item.brand_item?.brand?.name_en || "N/A"
              : item.brand_item?.brand?.name_en || "N/A"}
          </div>
        </div>
      </div>
      {/* Replacement Item Modal */}
      <ReplacementItemModal
        isOpen={showReplacementModal}
        onClose={() => setShowReplacementModal(false)}
        originalItemId={item.id}
        maxQuantity={Math.max(
          0,
          item.quantity - counter.totalRequestedQuantity
        )}
      />

      {/* Delayed Item Modal */}
      <DelayedItemModal
        isOpen={showDelayedModal}
        onClose={() => setShowDelayedModal(false)}
        originalItemId={item.id}
        maxQuantity={Math.max(
          0,
          item.quantity - counter.totalRequestedQuantity
        )}
      />
    </div>
  );
}
