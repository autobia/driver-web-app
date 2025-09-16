"use client";

import { useTranslations } from "next-intl";

export default function PurchaseInvoicesComponent() {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        {t("purchaseInvoices")}
      </h2>
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="text-center text-gray-500">
          <p>{t("noInvoicesMessage")}</p>
        </div>
      </div>
    </div>
  );
}
