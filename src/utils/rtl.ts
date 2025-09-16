/**
 * Utility functions for RTL support
 */

export function getRTLClasses(locale: string) {
  const isRTL = locale === "ar";

  return {
    isRTL,
    textAlign: isRTL ? "text-right" : "text-left",
    marginStart: isRTL ? "ml-" : "mr-",
    marginEnd: isRTL ? "mr-" : "ml-",
    paddingStart: isRTL ? "pl-" : "pr-",
    paddingEnd: isRTL ? "pr-" : "pl-",
    floatStart: isRTL ? "float-right" : "float-left",
    floatEnd: isRTL ? "float-left" : "float-right",
    borderStart: isRTL ? "border-r-" : "border-l-",
    borderEnd: isRTL ? "border-l-" : "border-r-",
  };
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
