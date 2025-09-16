"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useState, useTransition } from "react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;

    startTransition(() => {
      // Set cookie to persist language preference
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=lax`;

      // Refresh the page to apply new locale
      router.refresh();
    });

    setIsOpen(false);
  };

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  const isRTL = locale === "ar";

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-primary-300 rounded-lg shadow-sm hover:bg-primary-50 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className={isRTL ? "ml-2" : "mr-2"}>{currentLanguage.flag}</span>
        {currentLanguage.name}
        <svg
          className={`${isRTL ? "mr-2" : "ml-2"} h-5 w-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            isRTL ? "left-0 origin-top-left" : "right-0 origin-top-right"
          } z-10 w-48 mt-2 bg-white border border-primary-200 rounded-lg shadow-lg ring-1 ring-primary-100 ring-opacity-50`}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`${
                  language.code === locale
                    ? "bg-primary-100 text-primary-900 border-r-2 border-primary-500"
                    : "text-neutral-700 hover:bg-primary-50 hover:text-primary-800"
                } group flex items-center w-full px-4 py-2 text-sm transition-colors duration-200`}
                role="menuitem"
                disabled={isPending}
              >
                <span className={isRTL ? "ml-3" : "mr-3"}>{language.flag}</span>
                {language.name}
                {language.code === locale && (
                  <svg
                    className={`${
                      isRTL ? "mr-auto" : "ml-auto"
                    } h-4 w-4 text-primary-600`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
