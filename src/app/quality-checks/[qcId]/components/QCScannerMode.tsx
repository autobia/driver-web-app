"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslations } from "next-intl";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
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
  const [isPaused, setIsPaused] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isProcessingRef = useRef(false);

  // Keep a ref to the latest itemCounters to avoid stale closure issues
  const itemCountersRef = useRef(itemCounters);
  useEffect(() => {
    itemCountersRef.current = itemCounters;
  }, [itemCounters]);

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
      // Cleanup on unmount
      stopScanner();

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Clear state
      setDetectedCode("");
      setIsProcessing(false);
      setErrorMessage("");
      setLastScannedItemId(null);
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
      const scanner = new Html5Qrcode("qr-reader", {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
        ],
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 60,
          qrbox: function (viewfinderWidth) {
            // Static scanning box - 90% width and 200px height
            const boxWidth = Math.floor(viewfinderWidth * 0.9);
            return {
              width: boxWidth,
              height: 200,
            };
          },
        },
        (decodedText) => {
          // When code is detected, pause scanner and process immediately
          if (!isProcessingRef.current) {
            isProcessingRef.current = true;
            pauseScannerAndProcess(decodedText);
          }
        },
        undefined
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        // Stop scanning if active
        if (isScanning) {
          await scannerRef.current.stop();
        }
        // Clear scanner instance
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        // Ensure scanner ref is cleared
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const pauseScannerAndProcess = async (code: string) => {
    try {
      // Pause the scanner (stop camera)
      if (scannerRef.current && isScanning) {
        await scannerRef.current.pause(true);
        setIsPaused(true);
      }

      // Set detected code for UI display
      setDetectedCode(code);
      setIsProcessing(true);
      setErrorMessage("");

      // Clean the scanned code using regex
      const cleanedScannedCode = partNumberScannerRegex(code);

      // Find item by part_number_scan
      const item = currentQC?.items.find((item) => {
        const itemPartNumberScan = item.brand_item?.item?.part_number_scan;
        if (!itemPartNumberScan) return false;
        return (
          itemPartNumberScan?.toLowerCase() ===
          cleanedScannedCode?.toLowerCase()
        );
      });

      if (!item) {
        // Item not found - play error beep and show message
        playErrorBeep();
        setIsProcessing(false);
        setErrorMessage(t("itemNotInThisQC"));

        // Wait 2 seconds then resume scanner
        setTimeout(async () => {
          await resumeScanner();
        }, 2000);
        return;
      }

      // Get the latest counter from ref to avoid stale state issues with async Redux updates
      const latestCounters = itemCountersRef.current;
      const counter = latestCounters[item.id] || {
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

      // Recalculate totals from individual quantities to ensure accuracy
      const currentTotalRequestedQuantity =
        counter.regularQuantity +
        counter.totalReplacementQuantity +
        counter.totalDelayedQuantity;

      // Check if already reached max quantity
      if (currentTotalRequestedQuantity >= item.quantity) {
        playErrorBeep();
        setIsProcessing(false);
        setErrorMessage(t("maxQuantityReached"));

        // Wait 2 seconds then resume scanner
        setTimeout(async () => {
          await resumeScanner();
        }, 2000);
        return;
      }

      // Double-check if incrementing would exceed max quantity
      const potentialTotal = currentTotalRequestedQuantity + 1;
      if (potentialTotal > item.quantity) {
        playErrorBeep();
        setIsProcessing(false);
        setErrorMessage(t("maxQuantityReached"));

        // Wait 2 seconds then resume scanner
        setTimeout(async () => {
          await resumeScanner();
        }, 2000);
        return;
      }

      // Item found and can increment - play success sound
      playSuccessBeep();
      dispatch(incrementItemCounter(item.id));

      // Highlight the scanned item
      setLastScannedItemId(item.id);
      setTimeout(() => setLastScannedItemId(null), 2000);

      // Scroll to the scanned item
      setTimeout(() => {
        const itemElement = scannedItemRefs.current[item.id];
        if (itemElement && itemsListRef.current) {
          itemElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }, 100);

      // Wait 1 second to show success, then resume scanner
      setTimeout(async () => {
        await resumeScanner();
      }, 1000);
    } catch (err) {
      console.error("Error processing scan:", err);
      await resumeScanner();
    }
  };

  const resumeScanner = async () => {
    try {
      // Clear state
      setDetectedCode("");
      setIsProcessing(false);
      setErrorMessage("");
      isProcessingRef.current = false;

      // Resume the scanner (reopen camera)
      if (scannerRef.current && isPaused) {
        await scannerRef.current.resume();
        setIsPaused(false);
      }
    } catch (err) {
      console.error("Error resuming scanner:", err);
      // If resume fails, try to restart the scanner
      await startScanner();
    }
  };

  // Clean scanned part number using regex (from Dart implementation)
  const partNumberScannerRegex = (partNumber: string) => {
    if (!partNumber) {
      return partNumber;
    }

    let correct = false;
    let sku = partNumber.toString().toUpperCase();

    // Remove hyphens and newlines
    sku = sku.replace(/[-]+/g, "");
    sku = sku.replace(/[\n]+/g, "");

    let counter = 0;
    while (!correct && counter < 30) {
      counter += 1;

      if (sku.length > 6) {
        // Split by length of 6
        const firstPart = sku.substring(0, 6);
        const restPart = sku.substring(6);

        // Clean first part
        let cleanedFirstPart = firstPart.replace(/\s/g, "");
        cleanedFirstPart = cleanedFirstPart.replace(
          /[.&#,+()@\^$_~%":*?<>=!]+/g,
          ""
        );

        sku = cleanedFirstPart + restPart;

        // Check if first 6 characters don't have special characters
        const first6 = sku.substring(0, 6);
        if (!/[&\/\\#,+()@\s\^$\-_~%"\.:*?<>{}\s]+/.test(first6)) {
          sku = sku
            .replace(/[.&#,+()@\^$_~%":*?<>=!]+/g, "")
            .replace(/\s.*[a-zA-Z0-9&\/\\#,+()@\^$_~%'":*?<>{}]*$/g, "")
            .replace(/\..*[a-zA-Z0-9&\/\\#,+()@\^$_~%'":*?<>{}]*$/g, "");
          break;
        }

        if (!/[.&#,+()@\^$_~%":*?<>=!\s]+/.test(sku)) {
          correct = true;
        }
      } else {
        sku = sku.replace(/^[&#,+()@\^$_~%":*?<>=!\s]+/g, "");
        break;
      }
    }

    return sku.toString();
  };

  const handleClose = async () => {
    // Stop and cleanup scanner
    await stopScanner();

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Reset all state
    setDetectedCode("");
    setIsProcessing(false);
    setErrorMessage("");
    setLastScannedItemId(null);

    // Call parent close handler
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
        {/* Items List - Top 40% */}
        <div
          ref={itemsListRef}
          className="bg-white overflow-y-auto"
          style={{ height: "40%" }}
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
                    {Object.values(itemCountersRef.current).reduce(
                      (sum, counter) => sum + (counter.regularQuantity + counter.totalReplacementQuantity + counter.totalDelayedQuantity),
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
                        (Object.values(itemCountersRef.current).reduce(
                          (sum, counter) =>
                            sum + (counter.regularQuantity + counter.totalReplacementQuantity + counter.totalDelayedQuantity),
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
                  const counter = itemCountersRef.current[item.id] || {
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

        {/* Camera View - Bottom 60% */}
        <div
          className="bg-black flex flex-col items-center justify-center relative overflow-hidden"
          style={{ height: "60%" }}
        >
          <div
            id="qr-reader"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          />

          {/* Status Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {errorMessage ? (
              <div className="text-center bg-red-500 text-white p-4 rounded-lg shadow-lg animate-pulse">
                <div className="text-5xl mb-3">⚠️</div>
                <p className="text-lg font-bold">{errorMessage}</p>
                {detectedCode && (
                  <div className="mt-3 bg-red-600 rounded px-3 py-2">
                    <p className="text-xs mb-1">{t("detectedCode")}:</p>
                    <p className="text-base font-mono font-semibold break-all">{detectedCode}</p>
                  </div>
                )}
                <p className="text-sm mt-3">{t("resumingScannerSoon")}</p>
              </div>
            ) : isProcessing ? (
              <div className="text-center bg-blue-500 text-white p-4 rounded-lg">
                <p className="text-xs mb-2">{t("detectedCode")}:</p>
                <p className="text-xl font-bold mb-2 font-mono break-all">{detectedCode}</p>
                <p className="text-sm">{t("processing")}...</p>
              </div>
            ) : (
              <div className="text-center bg-primary-600/80 text-white p-4 rounded-lg">
                <p className="text-lg font-semibold">{t("scanQRCode")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
