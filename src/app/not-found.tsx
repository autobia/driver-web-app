import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-bold text-primary-200">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-primary-800">
            {t("pageNotFound")}
          </h2>
          <p className="mt-2 text-sm text-primary-600">
            {t("pageNotFoundDescription")}
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            {t("goHome")}
          </Link>
          <Link
            href="/login"
            className="group relative w-full flex justify-center py-2 px-4 border border-primary-300 text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            {t("goToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
