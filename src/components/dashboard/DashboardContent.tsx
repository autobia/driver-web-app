"use client";

import { NavigationTab } from "./NavigationTabs";
import TripsComponent from "./TripsComponent";
import QualityCheckTicketsComponent from "./QualityCheckTicketsComponent";
import PurchaseInvoicesComponent from "./PurchaseInvoicesComponent";

interface DashboardContentProps {
  activeTab: NavigationTab;
}

export default function DashboardContent({ activeTab }: DashboardContentProps) {
  return (
    <div className="flex-1 p-3">
      <div className="max-w-7xl mx-auto">
        {activeTab === "trips" && <TripsComponent />}
        {activeTab === "qualityCheckTickets" && (
          <QualityCheckTicketsComponent />
        )}
        {activeTab === "purchaseInvoices" && <PurchaseInvoicesComponent />}
      </div>
    </div>
  );
}
