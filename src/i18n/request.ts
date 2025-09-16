import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export default getRequestConfig(async () => {
  // Get locale from cookie first, then fallback to accept-language header
  const cookieStore = await cookies();
  let locale = cookieStore.get("NEXT_LOCALE")?.value;

  if (!locale) {
    // Get from accept-language header
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language");

    if (acceptLanguage) {
      // Simple language detection - prioritize Arabic and English
      if (acceptLanguage.includes("ar")) {
        locale = "ar";
      } else {
        locale = "en";
      }
    } else {
      locale = "en"; // Default fallback
    }
  }

  // Ensure locale is supported
  const supportedLocales = ["en", "ar"];
  if (!supportedLocales.includes(locale)) {
    locale = "en";
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
