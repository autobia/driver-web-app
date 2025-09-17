"use client";

import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { UserInfo, NavigationTabs } from "../../components/dashboard";
import QualityCheckTicketsComponent from "../../components/dashboard/QualityCheckTicketsComponent";

export default function QualityChecksPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return null;
  }

  const isDriver =
    user?.role?.name_en?.toLowerCase().includes("driver") || false;

  return (
    <div className="min-h-screen bg-neutral-50">
      <UserInfo user={user} />
      <NavigationTabs activeTab="qualityCheckTickets" isDriver={isDriver} />
      <div className="pb-20 sm:pb-0">
        <div className="flex-1 p-3">
          <div className="max-w-7xl mx-auto">
            <QualityCheckTicketsComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
