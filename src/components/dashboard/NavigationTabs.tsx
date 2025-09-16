"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type NavigationTab =
  | "trips"
  | "qualityCheckTickets"
  | "purchaseInvoices";

interface NavigationTabsProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isDriver: boolean;
}

export default function NavigationTabs({
  activeTab,
  onTabChange,
  isDriver,
}: NavigationTabsProps) {
  const t = useTranslations();

  return (
    <div className="p-3">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Select */}
        <div className="sm:hidden">
          <Select
            value={activeTab}
            onValueChange={(value) => onTabChange(value as NavigationTab)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectSection")} />
            </SelectTrigger>
            <SelectContent>
              {isDriver && <SelectItem value="trips">{t("trips")}</SelectItem>}
              <SelectItem value="qualityCheckTickets">
                {t("qualityCheckTickets")}
              </SelectItem>
              <SelectItem value="purchaseInvoices">
                {t("purchaseInvoices")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tiles */}
        <div className="hidden sm:flex flex-wrap gap-3">
          {/* Trips Tile - Only show for drivers */}
          {isDriver && (
            <button
              onClick={() => onTabChange("trips")}
              className={`flex-1 min-w-0 p-4 rounded-xl border transition-all duration-200 ${
                activeTab === "trips"
                  ? "bg-blue-50 border-blue-300 shadow-md shadow-blue-200/50"
                  : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
              }`}
            >
              <div className="text-center">
                <h3
                  className={`font-semibold ${
                    activeTab === "trips" ? "text-blue-800" : "text-gray-700"
                  }`}
                >
                  {t("trips")}
                </h3>
              </div>
            </button>
          )}

          {/* Quality Check Tickets Tile */}
          <button
            onClick={() => onTabChange("qualityCheckTickets")}
            className={`flex-1 min-w-0 p-4 rounded-xl border transition-all duration-200 ${
              activeTab === "qualityCheckTickets"
                ? "bg-emerald-50 border-emerald-300 shadow-md shadow-emerald-200/50"
                : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
            }`}
          >
            <div className="text-center">
              <h3
                className={`font-semibold ${
                  activeTab === "qualityCheckTickets"
                    ? "text-emerald-800"
                    : "text-gray-700"
                }`}
              >
                {t("qualityCheckTickets")}
              </h3>
            </div>
          </button>

          {/* Purchase Invoices Tile */}
          <button
            onClick={() => onTabChange("purchaseInvoices")}
            className={`flex-1 min-w-0 p-4 rounded-xl border transition-all duration-200 ${
              activeTab === "purchaseInvoices"
                ? "bg-purple-50 border-purple-300 shadow-md shadow-purple-200/50"
                : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
            }`}
          >
            <div className="text-center">
              <h3
                className={`font-semibold ${
                  activeTab === "purchaseInvoices"
                    ? "text-purple-800"
                    : "text-gray-700"
                }`}
              >
                {t("purchaseInvoices")}
              </h3>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
