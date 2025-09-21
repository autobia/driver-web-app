"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { useGetUnShippedOrdersQuery } from "@/store/api/saleOrderApi";
import { useToast } from "@/hooks/useToast";

export default function SalesOrdersComponent() {
  const t = useTranslations();
  const toast = useToast();

  const { data: orders, isLoading, error } = useGetUnShippedOrdersQuery();

  const handleUploadDocuments = (orderId: number) => {
    // TODO: Implement document upload functionality
    toast.info(t("uploadDocuments"), `Upload documents for order #${orderId}`);
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
          {t("ordersDelivery") || "Orders Delivery"}
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
          {t("ordersDelivery") || "Orders Delivery"}
        </h2>
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg">
          {t("failedToLoadSalesOrders") || "Failed to load sales orders"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("ordersDelivery") || "Orders Delivery"}
        </h2>
      </div>

      {/* No Orders Message */}
      {!orders || orders.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-2">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 text-lg font-medium mb-1">
            {t("noSalesOrders") || "No Sales Orders"}
          </p>
          <p className="text-gray-500 text-sm">
            {t("noSalesOrdersDescription") || "No unshipped sales orders found"}
          </p>
        </div>
      ) : (
        /* Sales Order Cards */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary-400 to-primary-500 px-4 py-3">
                <h3 className="text-base font-bold text-white tracking-wide">
                  SO #{order.id}
                </h3>
                {order.public_order_id && (
                  <p className="text-sm text-primary-100 mt-1">
                    Public ID: {order.public_order_id}
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
                      {t("status") || "Status"}
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
                        {t("createdAt") || "Created At"}
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
                  {t("uploadDocuments") || "Upload Documents"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
