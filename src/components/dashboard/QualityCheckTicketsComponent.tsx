"use client";

import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../../store/store";
import {
  useGetQualityChecksQuery,
  useDriverAppResetMutation,
  QualityCheck,
  QualityCheckItem,
} from "../../store/api/qualityChecksApi";
import { useLocale } from "next-intl";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/useToast";

export default function QualityCheckTicketsComponent() {
  const t = useTranslations();
  const toast = useToast();
  const locale = useLocale();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    data: qualityChecksData,
    isLoading,
    error,
  } = useGetQualityChecksQuery(
    { userId: user?.user_id || 0 },
    { skip: !user?.user_id }
  );

  const [driverAppReset, { isLoading: isRefreshing }] =
    useDriverAppResetMutation();

  // Helper function to get localized company name
  const getCompanyName = (qualityCheck: QualityCheck) => {
    return locale === "ar"
      ? qualityCheck.main_source_id?.company_branch?.company?.name_ar ||
          qualityCheck.main_source_id?.company_branch?.company?.name_en
      : qualityCheck.main_source_id?.company_branch?.company?.name_en ||
          qualityCheck.main_source_id?.company_branch?.company?.name_ar;
  };

  // Helper function to calculate total quantity
  const getTotalQuantity = (items: QualityCheckItem[]) => {
    return items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  // Helper function to get status translation
  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "pending":
        return t("pending");
      case "in_progress":
        return t("inProgress");
      case "completed":
        return t("completed");
      default:
        return status;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleStartPreparing = (qualityCheckId: number) => {
    // Navigate to QC detail page
    toast.info(
      t("startingQualityCheckPreparation"),
      t("loadingQualityCheckDetails")
    );
    router.push(`/quality-checks/${qualityCheckId}`);
  };

  const handleRefresh = async (qualityCheckId: number) => {
    try {
      await driverAppReset(qualityCheckId).unwrap();
      toast.success(t("qualityCheckRefreshed"));
    } catch (error) {
      console.error("Failed to refresh quality check:", error);
      toast.error(t("refreshFailed"));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("qualityCheckTickets")}
        </h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2">{t("loadingQualityCheckTickets")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("qualityCheckTickets")}
        </h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="text-center text-red-500">
            <p>{t("errorLoadingQualityCheckTickets")}</p>
          </div>
        </div>
      </div>
    );
  }

  const qualityChecks: QualityCheck[] = qualityChecksData || [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        {t("qualityCheckTickets")}
      </h2>

      {qualityChecks.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="text-center text-gray-500">
            <p>{t("noTicketsMessage")}</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {qualityChecks
            ?.toSorted((a, b) => b.id - a.id)
            ?.map((qualityCheck) => (
              <div
                key={qualityCheck.id}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-primary-400 to-primary-500 px-4 py-3">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {t("qcPrefix")}
                    {qualityCheck.id}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2">
                  {/* Company Name */}
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2"></div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getCompanyName(qualityCheck)}
                    </p>
                  </div>

                  {/* Order ID */}
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-secondary-400 rounded-full flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2"></div>
                    <p className="text-sm text-gray-700">
                      {t("orderId")}:{" "}
                      {typeof qualityCheck.object_id === "object"
                        ? qualityCheck.object_id.id
                        : qualityCheck.object_id}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-2 h-2 bg-secondary-300 rounded-full flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2"></div>
                      <span className="text-sm text-gray-700">
                        {t("quantity")}:
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                      {getTotalQuantity(qualityCheck.items)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-2 h-2 bg-secondary-200 rounded-full flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2"></div>
                      <span className="text-sm text-gray-700">
                        {t("status")}:
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(
                        qualityCheck.status
                      )}`}
                    >
                      {getStatusTranslation(qualityCheck.status)}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 pb-4 space-y-2">
                  <Button
                    onClick={() => handleStartPreparing(qualityCheck.id)}
                    className="w-full"
                    variant="default"
                    size="sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2z"
                      />
                    </svg>
                    {t("startPreparing")}
                  </Button>

                  <Button
                    onClick={() => handleRefresh(qualityCheck.id)}
                    className="w-full"
                    variant="outline"
                    size="sm"
                    disabled={isRefreshing}
                  >
                    <svg
                      className={`w-4 h-4 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    {isRefreshing ? t("refreshing") : t("refresh")}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
