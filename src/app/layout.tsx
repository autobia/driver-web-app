import { Rubik } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import Navbar from "@/components/Navabr";
import StoreProvider from "@/store/ReduxProvider";
import AuthInitializer from "@/providers/AuthInitializer";
import AuthGuard from "@/providers/AuthGuard";
import UserDataProvider from "@/providers/UserDataProvider";
import TranslationInitializer from "@/providers/TranslationInitializer";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "Driver Web App",
  description:
    "Professional driver management and delivery tracking application",
  metadataBase: new URL("https://driver.autobia.com"),
  openGraph: {
    title: "Driver Web App",
    description:
      "Professional driver management and delivery tracking application",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_SA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Driver Web App",
    description:
      "Professional driver management and delivery tracking application",
  },
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const isRTL = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} className="h-full">
      <body className={`${rubik.variable} antialiased h-full`}>
        <StoreProvider>
          <NextIntlClientProvider>
            <TranslationInitializer>
              <AuthInitializer>
                <AuthGuard>
                  <UserDataProvider>
                    <div className="h-full flex flex-col">
                      <Navbar />
                      <main className="flex-1">{children}</main>
                    </div>
                    <Toaster />
                  </UserDataProvider>
                </AuthGuard>
              </AuthInitializer>
            </TranslationInitializer>
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
