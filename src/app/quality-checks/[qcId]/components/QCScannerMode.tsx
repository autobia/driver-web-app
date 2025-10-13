"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslations } from "next-intl";
import { Html5Qrcode } from "html5-qrcode";
import { RootState } from "../../../../store/store";
import { incrementItemCounter } from "../../../../store/slices/qcSlice";
import { Button } from "../../../../components/ui/button";
import { Camera, Package } from "lucide-react";

interface QCScannerModeProps {
  onClose: () => void;
}

export default function QCScannerMode({ onClose }: QCScannerModeProps) {
  const t = useTranslations();
  const dispatch = useDispatch();
  const { currentQC } = useSelector((state: RootState) => state.qc);
  const itemCounters = useSelector((state: RootState) => state.qc.itemCounters);

  const [isScanning, setIsScanning] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Track last scanned item ID for highlighting
  const [lastScannedItemId, setLastScannedItemId] = useState<number | null>(
    null
  );
  const itemsListRef = useRef<HTMLDivElement>(null);
  const scannedItemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    // Initialize audio context
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }

    // Start scanner
    startScanner();

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play success beep (higher pitch, pleasant)
  const playSuccessBeep = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800; // Higher pitch for success
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  };

  // Play error beep (lower pitch, distinct)
  const playErrorBeep = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 200; // Lower pitch for error
    oscillator.type = "sawtooth";

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  };

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: function (viewfinderWidth, viewfinderHeight) {
            // Make the scanning box 90% width and 60% height for better mobile experience
            const boxWidth = Math.floor(viewfinderWidth * 0.9);
            const boxHeight = Math.floor(viewfinderHeight * 0.6);
            return {
              width: boxWidth,
              height: boxHeight,
            };
          },
        },
        (decodedText) => {
          // Just update the detected code, don't process it yet
          setDetectedCode(decodedText);
        },
        undefined
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleConfirmScan = () => {
    if (!detectedCode || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(""); // Clear previous error

    // Find item by part number in the scanned QR code
    const item = currentQC?.items.find(
      (item) =>
        item.brand_item?.item?.part_number?.toLowerCase() ===
        detectedCode.toLowerCase()
    );

    if (!item) {
      // Item not found in this QC
      playErrorBeep();
      setErrorMessage(t("itemNotInThisQC"));
      setDetectedCode("");
      setTimeout(() => {
        setErrorMessage("");
        setIsProcessing(false);
      }, 3000);
      return;
    }

    // Get current counter for this item
    const counter = itemCounters[item.id] || {
      itemId: item.id,
      regularQuantity: 0,
      originalQuantity: item.quantity,
      status: "not-started" as const,
      replacementItems: [],
      delayedItems: [],
      totalReplacementQuantity: 0,
      totalDelayedQuantity: 0,
      totalRequestedQuantity: 0,
    };

    // Check if already reached max quantity
    if (counter.totalRequestedQuantity >= item.quantity) {
      playErrorBeep();
      setErrorMessage(t("maxQuantityReached"));
      setDetectedCode("");
      setTimeout(() => {
        setErrorMessage("");
        setIsProcessing(false);
      }, 3000);
      return;
    }

    // Item found and can increment - play success sound and increment counter
    playSuccessBeep();
    dispatch(incrementItemCounter(item.id));

    // Highlight the scanned item
    setLastScannedItemId(item.id);
    setTimeout(() => setLastScannedItemId(null), 2000);

    // Scroll to the scanned item for better UX
    setTimeout(() => {
      const itemElement = scannedItemRefs.current[item.id];
      if (itemElement && itemsListRef.current) {
        itemElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, 100);

    // Reset for next scan
    setDetectedCode("");
    setTimeout(() => setIsProcessing(false), 500);
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">
              {t("scannerMode")}
            </h1>
          </div>
          <Button
            onClick={handleClose}
            className="bg-primary-600 hover:bg-primary-700 text-white"
            size="sm"
          >
            {t("endScanning")}
          </Button>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Items List - Top 30% */}
        <div
          ref={itemsListRef}
          className="bg-white overflow-y-auto"
          style={{ height: "30%" }}
        >
          <div className="p-4">
            {/* Summary Header */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t("items")}: {currentQC?.items.length || 0}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {t("totalQuantity")}:{" "}
                    {currentQC?.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    ) || 0}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600">
                    {Object.values(itemCounters).reduce(
                      (sum, counter) => sum + counter.totalRequestedQuantity,
                      0
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{t("scanned")}</p>
                </div>
              </div>
              {/* Progress bar for total */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (Object.values(itemCounters).reduce(
                          (sum, counter) =>
                            sum + counter.totalRequestedQuantity,
                          0
                        ) /
                          (currentQC?.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          ) || 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {!currentQC?.items || currentQC.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t("noItemsScannedYet")}
              </div>
            ) : (
              <div className="space-y-3">
                {currentQC.items.map((item) => {
                  const counter = itemCounters[item.id] || {
                    itemId: item.id,
                    regularQuantity: 0,
                    originalQuantity: item.quantity,
                    status: "not-started" as const,
                    replacementItems: [],
                    delayedItems: [],
                    totalReplacementQuantity: 0,
                    totalDelayedQuantity: 0,
                    totalRequestedQuantity: 0,
                  };

                  const isHighlighted = lastScannedItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      ref={(el) => {
                        scannedItemRefs.current[item.id] = el;
                      }}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        isHighlighted
                          ? "border-green-500 bg-green-100 scale-105 shadow-lg"
                          : counter.totalRequestedQuantity >= item.quantity
                          ? "border-green-500 bg-green-50"
                          : counter.totalRequestedQuantity > 0
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <Package
                            className={`w-6 h-6 flex-shrink-0 mt-1 ${
                              isHighlighted
                                ? "text-green-600"
                                : counter.totalRequestedQuantity >=
                                  item.quantity
                                ? "text-green-600"
                                : counter.totalRequestedQuantity > 0
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-xl">
                              {item.brand_item?.item?.part_number || "N/A"}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {item.brand_item?.brand?.name_en || "N/A"} -{" "}
                              {item.brand_item?.item?.description || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div
                            className={`text-3xl font-bold leading-none ${
                              isHighlighted
                                ? "text-green-600"
                                : counter.totalRequestedQuantity >=
                                  item.quantity
                                ? "text-green-600"
                                : counter.totalRequestedQuantity > 0
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          >
                            {counter.totalRequestedQuantity}
                          </div>
                          <div className="text-lg text-gray-500 font-medium">
                            / {item.quantity}
                          </div>
                          {counter.totalRequestedQuantity >= item.quantity && (
                            <div className="text-xs text-green-600 font-bold mt-1">
                              ✓ {t("complete")}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isHighlighted
                                ? "bg-green-500"
                                : counter.totalRequestedQuantity >=
                                  item.quantity
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (counter.totalRequestedQuantity /
                                  item.quantity) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Camera View - Bottom 70% */}
        <div
          className="bg-black flex flex-col items-center justify-center relative overflow-hidden"
          style={{ height: "70%" }}
        >
          <div id="qr-reader" style={{ width: "100%", height: "100%" }} />

          {/* Detected Code & Scan Button Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {errorMessage ? (
              <div className="text-center mb-4 bg-red-500 text-white p-3 rounded-lg">
                <p className="text-sm font-bold">{errorMessage}</p>
              </div>
            ) : detectedCode ? (
              <div className="text-center mb-4">
                <p className="text-white text-xs mb-1">{t("detectedCode")}:</p>
                <p className="text-white text-lg font-bold">{detectedCode}</p>
              </div>
            ) : (
              <div className="text-center mb-4">
                <p className="text-white text-sm">{t("scanQRCode")}</p>
              </div>
            )}

            <Button
              onClick={handleConfirmScan}
              disabled={!detectedCode || isProcessing || !!errorMessage}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isProcessing ? t("processing") : t("confirmScan")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
