"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import UserInfo from "./UserInfo";
import NavigationTabs, { NavigationTab } from "./NavigationTabs";
import DashboardContent from "./DashboardContent";

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Check if user is a driver to show trips by default
  const isDriver =
    user?.role?.name_en?.toLowerCase().includes("driver") || false;
  const defaultTab: NavigationTab = isDriver ? "trips" : "qualityCheckTickets";

  const [activeTab, setActiveTab] = useState<NavigationTab>(defaultTab);

  if (!user) {
    return null;
  }

  return (
    <>
      <UserInfo user={user} />
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDriver={isDriver}
      />
      <DashboardContent activeTab={activeTab} />
    </>
  );
}
