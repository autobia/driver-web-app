"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Package, CheckCircle } from "lucide-react";
import { useSubmitQRCodesMutation } from "../../../store/api/saleOrderApi";
import { useToast } from "../../../hooks/useToast";
import { useRouter } from "next/navigation";

interface ScannedPackage {
  fullCode: string;
  displayCode: string;
  orderId: string;
  boxId: string;
}

interface PackageScannerResultsProps {
  scannedPackages: ScannedPackage[];
  onBack: () => void;
}

export default function PackageScannerResults({
  scannedPackages,
  onBack,
}: PackageScannerResultsProps) {
  const t = useTranslations();
  const toast = useToast();
  const router = useRouter();
  const [submitQRCodes, { isLoading: isSubmitting }] = useSubmitQRCodesMutation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleSubmit = async () => {
    try {
      toast.info(t("submittingPackages"), t("processingPackageSubmission"));

      // Extract full QR codes for API submission - send as array
      const qrCodes = scannedPackages.map((pkg) => pkg.fullCode);

      const result = await submitQRCodes(qrCodes).unwrap();

      if (result.status) {
        setIsSuccess(true);
        toast.success(
          t("packagesSubmitted"),
          t("packagesSubmittedSuccessfully")
        );

        // Wait 2 seconds then navigate back to orders delivery
        setTimeout(() => {
          router.push("/orders-delivery");
          router.refresh();
        }, 2000);
      } else {
        toast.error(
          t("packageSubmissionFailed"),
          result.context || t("unexpectedError")
        );
      }
    } catch (error: unknown) {
      console.error("Package submission error:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "context" in error.data
          ? String(error.data.context)
          : t("packageSubmissionError");
      toast.error(t("packageSubmissionFailed"), errorMessage);
    }
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = () => {
    router.push("/orders-delivery");
  };

  const handleCancelClose = () => {
    setShowCancelModal(false);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("success")}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("packagesSubmittedSuccessfully")}
          </p>
          <p className="text-sm text-gray-500">
            {t("redirectingToOrders")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-neutral-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">
              {t("scanResults")}
            </h1>
          </div>
          <Button
            onClick={handleCancelClick}
            className="h-[40px] min-h-[40px] bg-red-600 hover:bg-red-700 text-white"
            disabled={isSubmitting}
          >
            {t("cancelOperation")}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 overflow-hidden">
          {/* Single Container with Header and Scrollable List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden">
            {/* Header with Count - Fixed */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("scannedPackages")}
              </h3>
              <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold">{scannedPackages.length}</span>
                <span className="text-xs ml-4 rtl:mr-4 rtl:ml-0">{t("packages")}</span>
              </div>
            </div>

            {/* Packages List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {scannedPackages.map((pkg, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-primary-200 bg-primary-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-lg font-bold text-primary-600">
                          {pkg.boxId}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Sticky at Bottom */}
      <div className="flex-shrink-0 bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full h-[40px] min-h-[40px]"
            disabled={isSubmitting}
          >
            {t("returnToScanner")}
          </Button>
          <Button
            onClick={handleSubmit}
            className="w-full h-[40px] min-h-[40px] bg-green-600 hover:bg-green-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>{t("submitAndContinue")}</span>
              </div>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                {t("submitAndContinue")}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {t("confirmCancelOperation")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("confirmCancelOperationMessage")}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleCancelClose}
                variant="outline"
                className="flex-1"
              >
                {t("goBack")}
              </Button>
              <Button
                onClick={handleCancelConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {t("confirmCancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
