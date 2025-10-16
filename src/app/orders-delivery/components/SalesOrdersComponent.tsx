"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Search, Package, Camera } from "lucide-react";
import {
  useGetUnShippedOrdersQuery,
  useSubmitPackageMutation,
} from "@/store/api/saleOrderApi";
import UploadDocumentsModal from "./UploadDocumentsModal";
import PackageScannerMode from "./PackageScannerMode";
import PackageScannerResults from "./PackageScannerResults";
import { useToast } from "@/hooks/useToast";

export default function SalesOrdersComponent() {
  const t = useTranslations();
  const toast = useToast();

  const { data: orders, isLoading, error } = useGetUnShippedOrdersQuery();
  const [submitPackage, { isLoading: isSubmittingPackage }] =
    useSubmitPackageMutation();

  // Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Package submission state
  const [packageOrderId, setPackageOrderId] = useState("");

  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scannedPackages, setScannedPackages] = useState<
    { fullCode: string; displayCode: string; orderId: string; boxId: string }[]
  >([]);

  const handleUploadDocuments = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setSelectedOrderId(null);
  };

  const handleSubmitPackage = async () => {
    const trimmedInput = packageOrderId.trim();

    if (!trimmedInput) {
      toast.warning(t("emptySearch"), t("pleaseEnterOrderId"));
      return;
    }

    const saleOrderId = parseInt(trimmedInput);
    if (isNaN(saleOrderId)) {
      toast.error(t("invalidInput"), t("pleaseEnterValidOrderNumber"));
      return;
    }

    try {
      toast.info(t("submittingPackage"), t("processingPackageSubmission"));

      const result = await submitPackage({
        sale_order_ids: [saleOrderId],
      }).unwrap();

      if (result.status) {
        toast.success(t("packageSubmitted"), t("packageSubmittedSuccessfully"));
        setPackageOrderId(""); // Clear input on success
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmitPackage();
    }
  };

  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  const handleScannerComplete = (
    packages: {
      fullCode: string;
      displayCode: string;
      orderId: string;
      boxId: string;
    }[]
  ) => {
    setScannedPackages(packages);
    setShowScanner(false);
    setShowResults(true);
  };

  const handleBackToScanner = () => {
    setShowResults(false);
    setShowScanner(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-green-500";
      case "approved":
        return "bg-green-500";
      case "ready":
        return "bg-blue-300";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("ordersDelivery")}
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("ordersDelivery")}
        </h2>
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg">
          {t("failedToLoadSalesOrders")}
        </div>
      </div>
    );
  }

  // Show scanner mode
  if (showScanner) {
    return (
      <PackageScannerMode
        onComplete={handleScannerComplete}
        onClose={handleCloseScanner}
        initialPackages={scannedPackages}
      />
    );
  }

  // Show results page
  if (showResults) {
    return (
      <PackageScannerResults
        scannedPackages={scannedPackages}
        onBack={handleBackToScanner}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("ordersDelivery")}
        </h2>
      </div>

      {/* Scanner Mode Button */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Camera className="h-5 w-5 text-green-600" />
          <h3 className="text-sm font-medium text-green-800">
            {t("scanPackages")}
          </h3>
        </div>
        <Button
          onClick={handleOpenScanner}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Camera className="h-4 w-4 mr-2" />
          {t("openScanner")}
        </Button>
        <p className="text-xs text-green-600 mt-2">
          {t("scanPackagesDescription")}
        </p>
      </div>

      {/* Package Submission Search */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Package className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-medium text-blue-800">
            {t("submitPackagesByOrderId")}
          </h3>
        </div>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder={t("enterOrderId")}
            value={packageOrderId}
            onChange={(e) => setPackageOrderId(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={isSubmittingPackage}
          />
          <Button
            onClick={handleSubmitPackage}
            disabled={isSubmittingPackage || !packageOrderId.trim()}
            className="shrink-0"
          >
            {isSubmittingPackage ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>{t("submitting")}</span>
              </div>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                {t("submit")}
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          {t("submitPackagesByOrderIdDescription")}
        </p>
      </div>

      {/* No Orders Message */}
      {!orders || orders.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-2">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 text-lg font-medium mb-1">
            {t("noSalesOrders")}
          </p>
          <p className="text-gray-500 text-sm">
            {t("noSalesOrdersDescription")}
          </p>
        </div>
      ) : (
        /* Sales Order Cards */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders
            ?.toSorted((a, b) => b.id - a.id)
            ?.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-primary-400 to-primary-500 px-4 py-3">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {t("saleOrder#") + order.id}
                  </h3>
                  {order.public_order_id && (
                    <p className="text-sm text-primary-100 mt-1">
                      {t("publicId")}: {order.public_order_id}
                    </p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Status */}
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div
                      className={`w-2 h-2 ${getStatusColor(
                        order.status
                      )} rounded-full flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {t("status")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {order.status}
                      </p>
                    </div>
                  </div>

                  {/* Created Date and Total Price Row */}
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {t("createdAt")}
                        </p>
                        <p className="text-sm text-gray-700">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 pb-4">
                  <Button
                    onClick={() => handleUploadDocuments(order.id)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t("uploadDocuments")}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Upload Documents Modal */}
      <UploadDocumentsModal
        isOpen={showUploadModal}
        onClose={handleCloseModal}
        orderId={selectedOrderId}
      />
    </div>
  );
}
