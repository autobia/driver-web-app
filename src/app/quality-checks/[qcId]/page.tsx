"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import { useEffect, useState } from "react";
import {
  resetCurrentQC,
  resetAllCounters,
  setCurrentQC,
} from "../../../store/slices/qcSlice";
import {
  useGetQualityChecksQuery,
  useGetQualityCheckByIdQuery,
} from "../../../store/api/qualityChecksApi";
import { Button } from "../../../components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  Scan,
  Search,
  X,
} from "lucide-react";
import QCTimeline from "./components/QCTimeline";
import QCItemCard from "./components/QCItemCard";
import ConfirmationModal from "./components/ConfirmationModal";
import CompletionModal from "./components/CompletionModal";
import QCScannerMode from "./components/QCScannerMode";

export default function QualityCheckDetailPage() {
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
  const [showScannerMode, setShowScannerMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch specific QC data - either from list or directly by ID
  const { data: qualityChecksData, isLoading: isQCListLoading } =
    useGetQualityChecksQuery(
      { userId: user?.user_id || 0 },
      { skip: !user?.user_id }
    );

  const {
    data: specificQCData,
    isLoading: isSpecificQCLoading,
    error: specificQCError,
  } = useGetQualityCheckByIdQuery(parseInt(qcId), {
    skip: !qcId || isNaN(parseInt(qcId)),
  });

  useEffect(() => {
    if (!currentQC && qcId) {
      // First try to find QC in the list data
      if (qualityChecksData) {
        const qc = qualityChecksData.find((q) => q.id.toString() === qcId);
        if (qc) {
          dispatch(setCurrentQC(qc));
          return;
        }
      }

      // If not found in list, use the specific QC data
      if (specificQCData) {
        dispatch(setCurrentQC(specificQCData));
      }
    }
  }, [qualityChecksData, specificQCData, qcId, currentQC, dispatch]);

  const isQCLoading = isQCListLoading || isSpecificQCLoading;
  const qcError = specificQCError;

  const handleBack = () => {
    setShowBackModal(true);
  };

  const confirmBack = () => {
    dispatch(resetCurrentQC());
    router.push("/quality-checks");
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

  const handleOpenScannerMode = () => {
    setShowScannerMode(true);
  };

  // Sort items based on search query
  const sortedItems = currentQC
    ? currentQC.items.slice().sort((a, b) => {
        if (!searchQuery.trim()) {
          return 0; // Keep original order if no search
        }

        const searchLower = searchQuery.toLowerCase();
        const partNumberA = (a.brand_item?.item?.part_number || "").toLowerCase();
        const partNumberB = (b.brand_item?.item?.part_number || "").toLowerCase();

        const matchA = partNumberA.includes(searchLower);
        const matchB = partNumberB.includes(searchLower);

        // Items with matches come first
        if (matchA && !matchB) return -1;
        if (!matchA && matchB) return 1;

        // Among matching items, sort by the position of the match
        if (matchA && matchB) {
          const indexA = partNumberA.indexOf(searchLower);
          const indexB = partNumberB.indexOf(searchLower);
          if (indexA !== indexB) return indexA - indexB;
        }

        return 0;
      })
    : [];

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
        <p className="text-red-500">{t("errorLoadingQualityCheckDetails")}</p>
        <Button
          onClick={() => {
            dispatch(resetCurrentQC());
            router.push("/quality-checks");
          }}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("backToQualityChecks")}
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
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("items")}
              </h2>
              <Button
                onClick={handleOpenScannerMode}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Scan className="w-4 h-4 mr-2" />
                {t("scannerMode")}
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchByPartNumber")}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedItems.map((item) => (
              <QCItemCard key={item.id} item={item} searchQuery={searchQuery} />
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

      {/* Scanner Mode */}
      {showScannerMode && (
        <QCScannerMode onClose={() => setShowScannerMode(false)} />
      )}
    </div>
  );
}
