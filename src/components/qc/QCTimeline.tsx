"use client";

import { useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { RootState } from "../../store/store";
import { calculateCounterTotals } from "../../store/slices/qcSlice";
import { CheckCircle, Clock } from "lucide-react";

export default function QCTimeline() {
  const t = useTranslations();
  const { currentQC, itemCounters } = useSelector(
    (state: RootState) => state.qc
  );

  if (!currentQC) return null;

  // Calculate totals
  const totalItems = currentQC.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const countedItems = Object.values(itemCounters).reduce(
    (sum: number, counter) => {
      const { totalRequestedQuantity } = calculateCounterTotals(counter);
      return sum + totalRequestedQuantity;
    },
    0
  );
  const progressPercentage =
    totalItems > 0 ? (countedItems / totalItems) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t("progress")}</h3>
        <div className="text-sm text-gray-500">
          {countedItems} / {totalItems} {t("items")}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{t("countingProgress")}</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white mb-2">
            <CheckCircle className="w-4 h-4" />
          </div>
          <span className="text-xs text-gray-600 text-center">
            {t("started")}
          </span>
        </div>

        <div className="flex-1 h-0.5 bg-gray-200 mx-4">
          <div
            className="h-full bg-primary-600 transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full mb-2 ${
              progressPercentage >= 50
                ? "bg-primary-600 text-white"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-xs text-gray-600 text-center">
            {t("counting")}
          </span>
        </div>

        <div className="flex-1 h-0.5 bg-gray-200 mx-4">
          <div
            className="h-full bg-primary-600 transition-all duration-300 ease-in-out"
            style={{ width: `${Math.max(0, progressPercentage - 50) * 2}%` }}
          />
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full mb-2 ${
              progressPercentage === 100
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
          </div>
          <span className="text-xs text-gray-600 text-center">
            {t("complete")}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
          <div className="text-sm text-gray-500">{t("totalItems")}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {countedItems}
          </div>
          <div className="text-sm text-gray-500">{t("counted")}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {totalItems - countedItems}
          </div>
          <div className="text-sm text-gray-500">{t("remaining")}</div>
        </div>
      </div>
    </div>
  );
}
