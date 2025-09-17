"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { useEffect, useState } from "react";
import {
  resetCurrentQC,
  resetAllCounters,
  setCurrentQC,
} from "../../store/slices/qcSlice";
import { useGetQualityChecksQuery } from "../../store/api/qualityChecksApi";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle } from "lucide-react";
import QCTimeline from "./QCTimeline";
import QCItemCard from "./QCItemCard";
import ConfirmationModal from "./ConfirmationModal";
import CompletionModal from "./CompletionModal";

export default function QualityCheckDetail() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations();
  const dispatch = useDispatch();
  const locale = useLocale();

  const qcId = params.qcId as string;
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentQC, isLoading } = useSelector((state: RootState) => state.qc);

  const [showBackModal, setShowBackModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Fetch QC data if not in state
  const {
    data: qualityChecksData,
    isLoading: isQCLoading,
    error: qcError,
  } = useGetQualityChecksQuery(
    { userId: user?.user_id || 0 },
    { skip: !user?.user_id }
  );

  useEffect(() => {
    if (qualityChecksData && qcId && !currentQC) {
      const qc = qualityChecksData.find((q) => q.id.toString() === qcId);
      if (qc) {
        dispatch(setCurrentQC(qc));
      }
    }
  }, [qualityChecksData, qcId, currentQC, dispatch]);

  const handleBack = () => {
    setShowBackModal(true);
  };

  const confirmBack = () => {
    dispatch(resetCurrentQC());
    router.back();
    setShowBackModal(false);
  };

  const handleResetCounters = () => {
    setShowResetModal(true);
  };

  const confirmResetCounters = () => {
    dispatch(resetAllCounters());
    setShowResetModal(false);
  };

  const handleComplete = () => {
    setShowCompletionModal(true);
  };

  if (isQCLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (qcError || !currentQC) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-red-500">Error loading quality check details</p>
        <Button
          onClick={() => {
            dispatch(resetCurrentQC());
            router.back();
          }}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                {locale === "ar" ? (
                  <ArrowRight className="w-5 h-5" />
                ) : (
                  <ArrowLeft className="w-5 h-5" />
                )}
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  QC#{currentQC.id}
                </h1>
                <p className="text-sm text-gray-500">
                  Order ID:{" "}
                  {typeof currentQC.object_id === "object"
                    ? currentQC.object_id.id
                    : currentQC.object_id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleResetCounters}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("resetCounter")}
            </Button>

            <Button onClick={handleComplete} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              {t("complete")}
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <QCTimeline />

        {/* Items List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t("items")}</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentQC.items.map((item) => (
              <QCItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showBackModal}
        onClose={() => setShowBackModal(false)}
        onConfirm={confirmBack}
        title={t("confirmBack")}
        message={t("confirmBackMessage")}
        confirmText={t("goBack")}
        cancelText={t("cancel")}
        variant="destructive"
      />

      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmResetCounters}
        title={t("confirmReset")}
        message={t("confirmResetMessage")}
        confirmText={t("reset")}
        cancelText={t("cancel")}
        variant="destructive"
      />

      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
      />
    </div>
  );
}
