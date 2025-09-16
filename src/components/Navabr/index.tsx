import { useTranslations, useLocale } from "next-intl";
import LogoutButton from "./LogoutButton";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <nav className="bg-white shadow-primary-100 border-b-2 border-l-2 border-r-2 border-primary-200/30 backdrop-blur-sm sticky top-0 z-50 rounded-bl-[15px] rounded-br-[15px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand - Start side (left in LTR, right in RTL) */}
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-bold text-primary-600 tracking-tight hover:text-primary-700 transition-colors duration-200 cursor-pointer">
              {t("autobia")}
            </h1>
          </div>

          {/* Actions - End side (right in LTR, left in RTL) */}
          <div
            className={`flex items-center ${
              isRTL ? "space-x-reverse space-x-4" : "space-x-4"
            }`}
          >
            <LanguageSwitcher />
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
