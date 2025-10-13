"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface TimeCounterProps {
  createdAt: string;
}

interface TimeElapsed {
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
}

export default function TimeCounter({ createdAt }: TimeCounterProps) {
  const t = useTranslations();
  const [timeElapsed, setTimeElapsed] = useState<TimeElapsed>({
    days: 0,
    hours: 0,
    minutes: 0,
    totalHours: 0,
  });

  // Get localized labels using i18n
  const getLabel = (value: number, type: "day" | "hour" | "minute") => {
    const form = value === 1 ? "Singular" : value === 2 ? "Dual" : "Plural";
    const key = `time${type.charAt(0).toUpperCase() + type.slice(1)}${form}`;
    return t(key);
  };

  useEffect(() => {
    const calculateTimeElapsed = () => {
      const now = new Date();
      const created = new Date(createdAt);
      const diffMs = now.getTime() - created.getTime();

      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const totalHours = totalMinutes / 60;
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;

      setTimeElapsed({ days, hours, minutes, totalHours });
    };

    // Calculate immediately
    calculateTimeElapsed();

    // Update every minute
    const interval = setInterval(calculateTimeElapsed, 60000);

    return () => clearInterval(interval);
  }, [createdAt]);

  // Determine color based on total hours
  const getColorClasses = () => {
    if (timeElapsed.totalHours < 2) {
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        pulse: "animate-pulse-slow",
      };
    } else if (timeElapsed.totalHours < 6) {
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        pulse: "animate-pulse-medium",
      };
    } else {
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        pulse: "animate-pulse-fast",
      };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="space-y-1">
      {/* Label */}
      <p className="text-xxl font-medium text-gray-600">
        {t("ticketCreatedFrom")}:
      </p>

      {/* Counter */}
      <div
        className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 ${colors.bg} ${colors.border} ${colors.pulse} transition-all duration-300`}
      >
        <svg
          className={`w-4 h-4 ${colors.text}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className={`text-sm font-bold ${colors.text} tabular-nums`}>
          {timeElapsed.days > 0 && (
            <>
              {timeElapsed.days} {getLabel(timeElapsed.days, "day")}{" "}
            </>
          )}
          {timeElapsed.hours} {getLabel(timeElapsed.hours, "hour")}{" "}
          {timeElapsed.minutes} {getLabel(timeElapsed.minutes, "minute")}
        </span>
      </div>
    </div>
  );
}
