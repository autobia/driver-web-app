"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "../../../components/ui/button";
import { Camera, Package } from "lucide-react";

interface ScannedPackage {
  fullCode: string; // Full QR code sent to backend
  boxId: string;    // Box ID for display
}

interface PackageScannerModeProps {
  onComplete: (packages: ScannedPackage[]) => void;
  onClose: () => void;
  initialPackages?: ScannedPackage[];
}

export default function PackageScannerMode({
  onComplete,
  onClose,
  initialPackages = [],
}: PackageScannerModeProps) {
  const t = useTranslations();
  const router = useRouter();

  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedPackages, setScannedPackages] = useState<ScannedPackage[]>(initialPackages);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isProcessingRef = useRef(false);
  const scannedCodesRef = useRef<Set<string>>(new Set(initialPackages.map(pkg => pkg.boxId)));

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
      setIsProcessing(false);
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

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader-package", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 60,
          qrbox: function (viewfinderWidth, viewfinderHeight) {
            // Scanning box: 90% width, 50% height
            const boxWidth = Math.floor(viewfinderWidth * 0.9);
            const boxHeight = Math.floor(viewfinderHeight * 0.3);
            return {
              width: boxWidth,
              height: boxHeight,
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

  // Extract box ID from QR code format: package-box-90936-a917a423-4fc3-4c46-943e-253979392ee8
  // Box ID is the part after "box-", which is "90936"
  const extractBoxId = (qrCode: string): string => {
    const parts = qrCode.split("-");
    if (parts.length >= 3 && parts[0] === "package" && parts[1] === "box") {
      return parts[2]; // e.g., "90936"
    }
    return qrCode; // Return full code if format doesn't match
  };

  const pauseScannerAndProcess = async (code: string) => {
    try {
      // Extract box ID from QR code
      const boxId = extractBoxId(code);

      // Check if package already scanned using ref (prevents race conditions)
      if (scannedCodesRef.current.has(boxId)) {
        // Silently ignore duplicate - no sound, no error
        isProcessingRef.current = false;
        return;
      }

      // Add to ref immediately to prevent duplicates during rapid scans
      scannedCodesRef.current.add(boxId);

      // Set processing state
      setIsProcessing(true);

      // New package - play success sound and add to list
      playSuccessBeep();
      setScannedPackages((prev) => [
        ...prev,
        {
          fullCode: code,
          boxId,
        },
      ]);

      // Wait 1.5 seconds to show success message, then clear and continue scanning
      setTimeout(() => {
        setIsProcessing(false);
        isProcessingRef.current = false;
      }, 1500);
    } catch (err) {
      console.error("Error processing scan:", err);
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };

  const handleEndScanning = async () => {
    // Stop and cleanup scanner
    await stopScanner();

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Navigate to results page with scanned packages
    onComplete(scannedPackages);
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    // Stop and cleanup scanner
    await stopScanner();

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Reset all state
    setIsProcessing(false);
    scannedCodesRef.current.clear();

    // Call parent close handler
    onClose();

    // Navigate back to orders delivery page
    router.push("/orders-delivery");
  };

  const handleCancelClose = () => {
    setShowCancelModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Camera View - Full Screen */}
      <div className="relative w-full h-full">
        <div
          id="qr-reader-package"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        />

        {/* Top Header Overlay */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="w-6 h-6 text-white" />
              <h1 className="text-xl font-bold text-white">
                {t("packageScanner")}
              </h1>
            </div>
            <Button
              onClick={handleCancelClick}
              variant="outline"
              size="lg"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-8 py-3 text-lg font-bold"
            >
              {t("cancel")}
            </Button>
          </div>
        </div>

        {/* Success Message Overlay - Center */}
        {isProcessing && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 max-w-[90%]">
            <div className="text-center bg-green-500 text-white p-8 rounded-2xl shadow-2xl animate-scale-in">
              <div className="text-7xl mb-4">✓</div>
              <p className="text-2xl font-bold mb-3">{t("packageAdded")}</p>
              <p className="text-sm opacity-90 mb-2">{t("boxId")}:</p>
              <p className="text-base font-bold font-mono px-2 break-all">
                {scannedPackages[scannedPackages.length - 1]?.boxId || ""}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Package Count */}
          <div className="text-center mb-4">
            <div className="inline-block bg-primary-600/90 text-white px-6 py-3 rounded-lg">
              <p className="text-sm">{t("scannedPackages")}</p>
              <p className="text-3xl font-bold">{scannedPackages.length}</p>
            </div>
          </div>

          {/* Instructions */}
          {!isProcessing && (
            <div className="text-center bg-white/20 backdrop-blur-sm text-white p-4 rounded-lg mb-4">
              <p className="text-base font-semibold">
                {t("scanPackageQRCode")}
              </p>
              <p className="text-sm mt-1 opacity-90">
                {t("duplicateScansIgnored")}
              </p>
            </div>
          )}

          {/* End Scanning Button */}
          <Button
            onClick={handleEndScanning}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-6 text-lg font-semibold"
            disabled={scannedPackages.length === 0}
          >
            {scannedPackages.length === 0
              ? t("scanPackagesToContinue")
              : `${t("endScanningAndContinue")} (${scannedPackages.length} ${t(
                  "packages"
                )})`}
          </Button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {t("confirmCancelOperation")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("confirmCancelOperationMessage")}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleCancelClose}
                variant="outline"
                className="flex-1"
              >
                {t("goBack")}
              </Button>
              <Button
                onClick={handleCancelConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {t("confirmCancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
