"use client";

import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  UserInfo,
  NavigationTabs,
  SalesOrdersComponent,
} from "../../components/dashboard";

export default function OrdersDeliveryPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return null;
  }

  const isDriver =
    user?.role?.name_en?.toLowerCase().includes("driver") || false;

  return (
    <div className="min-h-screen bg-neutral-50">
      <UserInfo user={user} />
      <NavigationTabs activeTab="ordersDelivery" isDriver={isDriver} />
      <div className="pb-20 sm:pb-0">
        <div className="flex-1 p-3">
          <div className="max-w-7xl mx-auto">
            <SalesOrdersComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
