"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, AlertTriangle } from "lucide-react";
import { useFetchShippingCompaniesQuery } from "@/store/api/coreApi";
import {
  useUploadFileMutation,
  useSubmitShippingDocumentMutation,
} from "@/store/api/saleOrderApi";
import { useToast } from "@/hooks/useToast";

interface UploadDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
}

export default function UploadDocumentsModal({
  isOpen,
  onClose,
  orderId,
}: UploadDocumentsModalProps) {
  const t = useTranslations();
  const toast = useToast();
  const {
    data: shippingCompanies,
    isLoading: isLoadingCompanies,
    error: companiesError,
  } = useFetchShippingCompaniesQuery();

  // Mutation hooks
  const [uploadFile] = useUploadFileMutation();
  const [submitShippingDocument] = useSubmitShippingDocumentMutation();

  // Form state
  const [selectedShippingCompany, setSelectedShippingCompany] =
    useState<string>("");
  const [shippingPrice, setShippingPrice] = useState<string>("");
  const [includeVat, setIncludeVat] = useState<boolean>(true);
  const [loadingFee, setLoadingFee] = useState<string>("0");
  const [shippingPolicyFile, setShippingPolicyFile] = useState<File | null>(
    null
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [ordersScanned, setOrdersScanned] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleClose = () => {
    // Reset form
    setSelectedShippingCompany("");
    setShippingPrice("");
    setIncludeVat(true);
    setLoadingFee("0");
    setShippingPolicyFile(null);
    setReceiptFile(null);
    setOrdersScanned(false);
    onClose();
  };

  const handleConfirmUpload = async () => {
    if (!orderId || !shippingPolicyFile || !receiptFile) {
      toast.error(t("error"), t("pleaseCompleteAllFields"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Show initial upload message
      toast.info(t("uploadDocuments"), t("uploadingDocuments"));

      console.log("Starting 4 API calls for order:", orderId);

      // === SHIPPING POLICY FILE (2 API CALLS) ===
      console.log("1/4: Uploading shipping policy file to storage...");
      const base64PolicyFile = await fileToBase64(shippingPolicyFile);

      const policyFileUploadResponse = await uploadFile({
        content_type: 75, // Sale order content type
        object_id: orderId!,
        type: 1, // Image type
        base64_file: base64PolicyFile,
      }).unwrap();

      console.log("2/4: Submitting shipping policy document...");
      await submitShippingDocument({
        content_type: 75,
        object_id: orderId!,
        url: policyFileUploadResponse.file,
        type: "ShippingPolicy",
        shipping_company_id: parseInt(selectedShippingCompany),
        shipping_price: parseFloat(shippingPrice),
        is_vat_included: includeVat,
        loading_fee: parseFloat(loadingFee),
      }).unwrap();

      // === RECEIPT FILE (2 API CALLS) ===
      console.log("3/4: Uploading receipt file to storage...");
      const base64ReceiptFile = await fileToBase64(receiptFile);

      const receiptFileUploadResponse = await uploadFile({
        content_type: 75, // Sale order content type
        object_id: orderId!,
        type: 1, // Image type
        base64_file: base64ReceiptFile,
      }).unwrap();

      console.log("4/4: Submitting receipt document...");
      await submitShippingDocument({
        content_type: 75,
        object_id: orderId!,
        url: receiptFileUploadResponse.file,
        type: "ShippingReceipt",
        shipping_company_id: parseInt(selectedShippingCompany),
        shipping_price: parseFloat(shippingPrice),
        is_vat_included: includeVat,
        loading_fee: parseFloat(loadingFee),
      }).unwrap();

      // All 4 API calls completed successfully
      console.log("All 4 API calls completed successfully");
      toast.success(t("uploadDocuments"), t("documentsUploadedSuccessfully"));
      handleClose();
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String(error.data.message)
          : t("uploadErrorMessage");

      toast.error(t("uploadFailed"), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    selectedShippingCompany &&
    shippingPrice &&
    shippingPolicyFile &&
    receiptFile &&
    ordersScanned &&
    !isSubmitting;
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader className="px-4 sm:px-6">
          <DialogTitle className="text-lg font-semibold">
            {t("uploadDocuments")} - SO #{orderId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4">
          {/* Warning Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-orange-800">
                  {t("importantNote")}
                </p>
                <p className="text-xs sm:text-sm text-orange-700 mt-1">
                  {t("actionsNotReversible")}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Company Selection */}
          <div className="space-y-2">
            <Label htmlFor="shipping-company" className="text-sm font-medium">
              {t("shippingCompany")} *
            </Label>
            <Select
              value={selectedShippingCompany}
              onValueChange={setSelectedShippingCompany}
              disabled={isLoadingCompanies}
            >
              <SelectTrigger className="w-full" id="shipping-company">
                <SelectValue
                  placeholder={
                    isLoadingCompanies
                      ? t("loadingShippingCompanies") ||
                        "Loading shipping companies..."
                      : companiesError
                      ? t("errorLoadingCompanies") || "Error loading companies"
                      : t("selectShippingCompany")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {shippingCompanies?.length
                  ? shippingCompanies.map((company) => (
                      <SelectItem
                        key={company.id}
                        value={company.id.toString()}
                      >
                        {company.name_ar || company.name_en}
                      </SelectItem>
                    ))
                  : !isLoadingCompanies &&
                    !companiesError && (
                      <SelectItem value="no-companies" disabled>
                        {t("noShippingCompanies") ||
                          "No shipping companies available"}
                      </SelectItem>
                    )}
              </SelectContent>
            </Select>
          </div>

          {/* Shipping Price */}
          <div className="space-y-2">
            <Label
              htmlFor="shipping-price"
              className="text-xs sm:text-sm font-medium"
            >
              {t("shippingPrice")} *
            </Label>
            <Input
              id="shipping-price"
              type="number"
              min="0"
              step="0.01"
              value={shippingPrice}
              onChange={(e) => setShippingPrice(e.target.value)}
              placeholder="0.00"
              className="w-full text-sm"
            />
          </div>

          {/* VAT Inclusion */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-medium">
              {t("vatInclusion")}
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="include-vat"
                  name="vat-option"
                  checked={includeVat}
                  onChange={() => setIncludeVat(true)}
                  className="h-3 w-3 sm:h-4 sm:w-4 text-primary-600"
                />
                <Label htmlFor="include-vat" className="text-xs sm:text-sm">
                  {t("includeVat")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="exclude-vat"
                  name="vat-option"
                  checked={!includeVat}
                  onChange={() => setIncludeVat(false)}
                  className="h-3 w-3 sm:h-4 sm:w-4 text-primary-600"
                />
                <Label htmlFor="exclude-vat" className="text-xs sm:text-sm">
                  {t("excludeVat")}
                </Label>
              </div>
            </div>
          </div>

          {/* Loading Fee */}
          <div className="space-y-2">
            <Label
              htmlFor="loading-fee"
              className="text-xs sm:text-sm font-medium"
            >
              {t("loadingFee")}
            </Label>
            <Input
              id="loading-fee"
              type="number"
              min="0"
              step="0.01"
              value={loadingFee}
              onChange={(e) => setLoadingFee(e.target.value)}
              placeholder="0.00"
              className="w-full text-sm"
            />
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Shipping Policy Upload */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                {t("shippingPolicy")} *
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="shipping-policy"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) =>
                    setShippingPolicyFile(e.target.files?.[0] || null)
                  }
                  className="hidden"
                />
                <Label
                  htmlFor="shipping-policy"
                  className="cursor-pointer flex flex-col items-center space-y-1 sm:space-y-2"
                >
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-600 text-center px-2">
                    {shippingPolicyFile
                      ? shippingPolicyFile.name
                      : t("clickToUpload")}
                  </span>
                </Label>
              </div>
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                {t("receipt")} *
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="receipt"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Label
                  htmlFor="receipt"
                  className="cursor-pointer flex flex-col items-center space-y-1 sm:space-y-2"
                >
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-600 text-center px-2">
                    {receiptFile ? receiptFile.name : t("clickToUpload")}
                  </span>
                </Label>
              </div>
            </div>
          </div>

          {/* Orders Scanned Acknowledgment */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="orders-scanned"
                checked={ordersScanned}
                onCheckedChange={(checked) =>
                  setOrdersScanned(checked === true)
                }
                className="mt-1 flex-shrink-0"
              />
              <div className="flex-1">
                <Label
                  htmlFor="orders-scanned"
                  className="text-xs sm:text-sm font-medium text-blue-800 cursor-pointer"
                >
                  {t("acknowledgeOrdersScanned")} *
                </Label>
                <p className="text-xs text-blue-700 mt-1">
                  {t("acknowledgeOrdersScannedDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 px-4 sm:px-6 pb-4 sm:pb-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirmUpload}
            disabled={!isFormValid}
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>{t("uploading")}</span>
              </div>
            ) : (
              t("confirmUpload")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
