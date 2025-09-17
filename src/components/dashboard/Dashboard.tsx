"use client";

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
  const activeTab: NavigationTab = isDriver ? "trips" : "qualityCheckTickets";

  if (!user) {
    return null;
  }

  return (
    <>
      <UserInfo user={user} />
      <NavigationTabs activeTab={activeTab} isDriver={isDriver} />
      <div className="pb-20 sm:pb-0">
        <DashboardContent activeTab={activeTab} />
      </div>
    </>
  );
}
