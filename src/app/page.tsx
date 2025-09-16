import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="h-full w-full bg-neutral-50 flex flex-col">
      {/* Dynamic full-screen content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-16">
        <div className="w-full max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-primary-600 text-3xl sm:text-4xl lg:text-5xl font-bold">
            {t("welcome")}
          </h1>
        </div>
      </div>
    </div>
  );
}
