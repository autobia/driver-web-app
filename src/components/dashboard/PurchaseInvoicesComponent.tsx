"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetPurchaseOrderQuery,
  type PurchaseOrderResponse,
} from "@/store/api/purchaseOrderApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  setSearchQuery,
  setSearching,
  setSearchResults,
  setSearchError,
} from "@/store/slices/purchaseOrderSlice";
import { useToast } from "@/hooks/useToast";

export default function PurchaseInvoicesComponent() {
  const t = useTranslations();
  const dispatch = useDispatch();
  const toast = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<PurchaseOrderResponse | null>(null);

  const { searchQuery, isSearching, searchResults, error } = useSelector(
    (state: RootState) => state.purchaseOrder
  );

  // Skip the query by default, only trigger when we want to search
  const {
    data,
    error: apiError,
    isLoading,
  } = useGetPurchaseOrderQuery(
    { purchaseOrderID: parseInt(searchQuery) },
    {
      skip: !searchQuery || isNaN(parseInt(searchQuery)),
      refetchOnMountOrArgChange: true,
    }
  );

  const handleSearch = async () => {
    const trimmedInput = searchInput.trim();

    if (!trimmedInput) {
      toast.warning(t("emptySearch"), t("pleaseEnterPurchaseOrderId"));
      return;
    }

    const purchaseOrderID = parseInt(trimmedInput);
    if (isNaN(purchaseOrderID)) {
      toast.error(t("invalidInput"), t("pleaseEnterValidPurchaseOrderNumber"));
      return;
    }

    // Check if we already have this result
    const existingResult = searchResults.find(
      (result) => result.id === purchaseOrderID
    );
    if (existingResult) {
      toast.info(
        t("alreadyLoaded"),
        t("purchaseOrderAlreadyLoaded", { id: purchaseOrderID })
      );
      setSearchInput(""); // Clear search input
      return;
    }

    dispatch(setSearching(true));
    dispatch(setSearchQuery(trimmedInput));
    toast.info(
      t("searching"),
      t("searchingForPurchaseOrder", { id: purchaseOrderID })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleShowItems = (order: PurchaseOrderResponse) => {
    setSelectedOrder(order);
    setShowItemsModal(true);
  };

  const calculateTotalPrice = (order: PurchaseOrderResponse) => {
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Handle API response
  useEffect(() => {
    if (
      data &&
      searchQuery &&
      !searchResults.find((result) => result.id === data.id)
    ) {
      dispatch(setSearchResults(data));
      toast.success(
        t("found"),
        t("purchaseOrderLoadedSuccessfully", { id: data.id })
      );
      setSearchInput(""); // Clear search input after successful search
    }
  }, [data, searchQuery, dispatch, toast, searchResults, t]);

  // Handle API error
  useEffect(() => {
    if (apiError && searchQuery) {
      const errorMessage = t("failedToFetchPurchaseOrder");
      dispatch(setSearchError(errorMessage));
      toast.operationError(t("search"), apiError);
      dispatch(setSearching(false));
    }
  }, [apiError, searchQuery, dispatch, toast, t]);

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center space-x-4">
        <h2 className="text-xl font-semibold text-gray-900 text-nowrap">
          {t("purchaseInvoices")}
        </h2>
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder={t("searchByPurchaseInvoice")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSearching || isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || isLoading || !searchInput.trim()}
            size="sm"
            className="px-3"
          >
            {isSearching || isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search Results Info */}
      {searchResults.length > 0 && (
        <div className="text-sm text-gray-600">
          {t("searchResultsCount", { count: searchResults.length })}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* No Search Performed Message */}
      {searchResults.length === 0 && !isSearching && !isLoading && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 text-lg font-medium mb-1">
            {t("noSearchPerformed")}
          </p>
          <p className="text-gray-500 text-sm">
            {t("enterPurchaseOrderIdToSearch")}
          </p>
        </div>
      )}

      {/* Purchase Order Cards */}
      {searchResults.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary-400 to-primary-500 px-4 py-3">
                <h3 className="text-base font-bold text-white tracking-wide">
                  PO #{order.id}
                </h3>
                {order.invoice_id && (
                  <p className="text-sm text-primary-100 mt-1">
                    Invoice: {order.invoice_id}
                  </p>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Company Name */}
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2 mr-2 rtl:mr-0 rtl:ml-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {t("company")}
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.company_branch.company.name_ar ||
                        order.company_branch.company.name_en}
                    </p>
                    {order.company_branch.company.commercial_name && (
                      <p className="text-xs text-gray-600 truncate">
                        {order.company_branch.company.commercial_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2 mr-2 rtl:mr-0 rtl:ml-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {t("address")}
                    </p>
                    <p className="text-sm text-gray-700">
                      {order.company_branch.building_number}{" "}
                      {order.company_branch.street_name}
                    </p>
                    {order.company_branch.postal_code && (
                      <p className="text-xs text-gray-600">
                        {t("postalCode")}: {order.company_branch.postal_code}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Count */}
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2"></div>
                  <p className="text-sm text-gray-700">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mr-2">
                      {t("itemsCount")}:
                    </span>
                    {order.items.length} {t("itemsCount")}
                  </p>
                </div>

                {/* Order Date */}
                {order.actual_purchase_date && (
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mr-2 rtl:mr-0 rtl:ml-2"></div>
                    <p className="text-sm text-gray-700">
                      <span className="text-xs text-gray-500 uppercase tracking-wide mr-2">
                        {t("purchaseDate")}:
                      </span>
                      {new Date(
                        order.actual_purchase_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-4 pb-4">
                <Button
                  onClick={() => handleShowItems(order)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t("showPurchaseOrderItems")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchase Order Items Modal */}
      <Dialog open={showItemsModal} onOpenChange={setShowItemsModal}>
        <DialogContent className="max-w-7xl w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] min-w-[320px] sm:min-w-[600px] md:min-w-[800px] lg:min-w-[1000px] xl:min-w-[1200px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg md:text-xl">
              {t("purchaseOrderItems")} - PO #{selectedOrder?.id}
            </DialogTitle>
            {selectedOrder && (
              <div className="text-base md:text-lg font-semibold text-primary-600 mt-2 p-3 bg-primary-50 rounded-lg border">
                {t("totalAmount")}:{" "}
                {calculateTotalPrice(selectedOrder).toFixed(2)} {t("currency")}
              </div>
            )}
          </DialogHeader>

          {selectedOrder && (
            <div className="flex-1 overflow-hidden mt-4">
              <div className="overflow-auto max-h-[60vh] border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow>
                      <TableHead className="min-w-[80px] text-xs md:text-sm">
                        {t("itemId")}
                      </TableHead>
                      <TableHead className="min-w-[120px] text-xs md:text-sm">
                        {t("partNumber")}
                      </TableHead>
                      <TableHead className="min-w-[100px] text-xs md:text-sm">
                        {t("manufacturer")}
                      </TableHead>
                      <TableHead className="min-w-[100px] text-xs md:text-sm">
                        {t("brand")}
                      </TableHead>
                      <TableHead className="min-w-[80px] text-center text-xs md:text-sm">
                        {t("quantity")}
                      </TableHead>
                      <TableHead className="min-w-[100px] text-right text-xs md:text-sm">
                        {t("pricePerItem")}
                      </TableHead>
                      <TableHead className="min-w-[100px] text-right text-xs md:text-sm">
                        {t("totalPrice")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-xs md:text-sm">
                          {item.id}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-mono">
                          {item.part_number}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          <div
                            className="truncate max-w-[150px]"
                            title={
                              item.manufacturer.name_ar ||
                              item.manufacturer.name_en
                            }
                          >
                            {item.manufacturer.name_ar ||
                              item.manufacturer.name_en}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          <div
                            className="truncate max-w-[150px]"
                            title={item.brand.name_ar || item.brand.name_en}
                          >
                            {item.brand.name_ar || item.brand.name_en}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-xs md:text-sm font-medium">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm font-mono">
                          {item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm font-semibold font-mono">
                          {(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile-friendly summary */}
              <div className="md:hidden mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  {t("itemsCount")}: {selectedOrder.items.length} •{" "}
                  {t("totalAmount")}:{" "}
                  <span className="font-semibold">
                    {calculateTotalPrice(selectedOrder).toFixed(2)}{" "}
                    {t("currency")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
