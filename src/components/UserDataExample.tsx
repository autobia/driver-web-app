"use client";

import React from "react";
import {
  useDrivers,
  usePreparers,
  useAllUsersLoadingState,
} from "@/hooks/useUserData";

/**
 * Example component demonstrating how to use the fetched user data
 * This component can be used anywhere in the app to display or work with user data
 */
export default function UserDataExample() {
  // Get drivers data
  const {
    data: drivers,
    isLoading: driversLoading,
    error: driversError,
  } = useDrivers();

  // Get preparers data
  const {
    data: preparers,
    isLoading: preparersLoading,
    error: preparersError,
  } = usePreparers();

  // Get overall loading state
  const {
    isLoading: allUsersLoading,
    isError: hasErrors,
    errors,
  } = useAllUsersLoadingState();

  if (allUsersLoading) {
    return <div className="p-4">Loading user data...</div>;
  }

  if (hasErrors) {
    return (
      <div className="p-4 text-red-600">
        <h3>Error loading user data:</h3>
        {!!errors.drivers && <p>• Drivers: Error occurred</p>}
        {!!errors.preparers && <p>• Preparers: Error occurred</p>}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">User Data Example</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Drivers Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">
            Drivers ({drivers?.length || 0})
          </h3>
          {driversLoading ? (
            <p>Loading drivers...</p>
          ) : driversError ? (
            <p className="text-red-500">Error loading drivers</p>
          ) : (
            <ul className="space-y-1">
              {drivers?.slice(0, 5).map((driver) => (
                <li key={driver.id} className="text-sm">
                  {driver.first_name} {driver.last_name} ({driver.username})
                </li>
              ))}
              {drivers && drivers.length > 5 && (
                <li className="text-sm text-gray-500">
                  ... and {drivers.length - 5} more
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Preparers Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">
            Preparers ({preparers?.length || 0})
          </h3>
          {preparersLoading ? (
            <p>Loading preparers...</p>
          ) : preparersError ? (
            <p className="text-red-500">Error loading preparers</p>
          ) : (
            <ul className="space-y-1">
              {preparers?.slice(0, 5).map((preparer) => (
                <li key={preparer.id} className="text-sm">
                  {preparer.first_name} {preparer.last_name} (
                  {preparer.username})
                </li>
              ))}
              {preparers && preparers.length > 5 && (
                <li className="text-sm text-gray-500">
                  ... and {preparers.length - 5} more
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p>• User data is automatically fetched when the app loads</p>
        <p>• Data is cached and shared across all components</p>
        <p>
          • Use the hooks in /hooks/useUserData.ts to access this data anywhere
        </p>
      </div>
    </div>
  );
}
