import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="text-primary-600  text-4xl">{t("welcome")}</h1>
    </div>
  );
}
