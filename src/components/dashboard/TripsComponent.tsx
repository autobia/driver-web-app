"use client";

import { useTranslations } from "next-intl";

export default function TripsComponent() {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t("trips")}</h2>
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="text-center text-gray-500">
          <p>{t("noTripsMessage")}</p>
        </div>
      </div>
    </div>
  );
}
