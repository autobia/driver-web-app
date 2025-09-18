"use client";

import { useTranslations } from "next-intl";
import { setGlobalTranslations } from "@/lib/translationUtils";
import { useEffect } from "react";

interface TranslationInitializerProps {
  children: React.ReactNode;
}

export default function TranslationInitializer({
  children,
}: TranslationInitializerProps) {
  const t = useTranslations();

  useEffect(() => {
    // Set the global translation function
    setGlobalTranslations(t);
  }, [t]);

  return <>{children}</>;
}
